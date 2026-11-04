import { ToolRegistry } from './ToolRegistry'
import { MemoryStore } from './MemoryStore'
import {
  createId,
  type ChatEvent,
  type ChatMessage,
  type ChatThread,
  type HistoryStore,
  type HostTool,
  type SimpleChatConfig,
  type ToolCall,
  type ChatProviderId,
} from './types'
import { mergeToolCallDeltas, type AccumulatedToolCall } from './sse'
import { OpenAICompatProvider } from './providers/OpenAICompatProvider'
import type { ChatProvider, OpenAICompatMessage } from './providers/types'
import { isChatProviderId } from './providers/types'

export interface ChatEngineOptions {
  config: SimpleChatConfig
  store?: HistoryStore
  storageKey?: string
  fetchImpl?: typeof fetch
  /** Optional override; otherwise resolved from config.provider. */
  provider?: ChatProvider
}

interface CompletionResult {
  finishReason: string | null
  toolCalls: ToolCall[]
  assistantMessage: ChatMessage
}

export class ChatEngine {
  config: SimpleChatConfig
  readonly tools = new ToolRegistry()
  readonly store: HistoryStore
  private fetchImpl: typeof fetch
  private abort: AbortController | null = null
  private listeners = new Set<(ev: ChatEvent) => void>()
  private openaiProvider: OpenAICompatProvider
  private injectedProvider: ChatProvider | null = null
  currentThreadId: string | null = null

  constructor(opts: ChatEngineOptions) {
    this.config = { ...opts.config }
    this.store = opts.store ?? new MemoryStore()
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis)
    this.openaiProvider = new OpenAICompatProvider(this.fetchImpl)
    this.injectedProvider = opts.provider ?? null
  }

  on(listener: (ev: ChatEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(ev: ChatEvent): void {
    for (const l of this.listeners) l(ev)
  }

  updateConfig(partial: Partial<SimpleChatConfig>): void {
    this.config = { ...this.config, ...partial }
  }

  /** Active provider id (openai | chrome-ai). Phase1 defaults to openai. */
  getProviderId(): ChatProviderId {
    const p = this.config.provider
    if (isChatProviderId(p)) return p
    return 'openai'
  }

  getProvider(): ChatProvider {
    if (this.injectedProvider) return this.injectedProvider
    // Phase2: switch on this.getProviderId() === 'chrome-ai'
    return this.openaiProvider
  }

  registerTool(tool: HostTool): void {
    this.tools.register(tool)
  }

  unregisterTool(name: string): void {
    this.tools.unregister(name)
  }

  stop(): void {
    this.abort?.abort()
    this.abort = null
  }

  async listThreads(): Promise<ChatThread[]> {
    return this.store.listThreads()
  }

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    return this.store.getMessages(threadId)
  }

  async createThread(title = '新会话'): Promise<ChatThread> {
    const now = Date.now()
    const thread: ChatThread = {
      id: createId('thread'),
      title,
      createdAt: now,
      updatedAt: now,
    }
    await this.store.upsertThread(thread)
    this.currentThreadId = thread.id
    this.emit({ type: 'thread', thread })
    return thread
  }

  async selectThread(id: string): Promise<void> {
    this.currentThreadId = id
  }

  async deleteThread(id: string): Promise<void> {
    await this.store.deleteThread(id)
    if (this.currentThreadId === id) this.currentThreadId = null
  }

  async ensureThread(): Promise<ChatThread> {
    if (this.currentThreadId) {
      const threads = await this.store.listThreads()
      const found = threads.find((t) => t.id === this.currentThreadId)
      if (found) return found
    }
    return this.createThread()
  }

  async *send(userText: string): AsyncGenerator<ChatEvent> {
    const text = userText.trim()
    if (!text) return

    const thread = await this.ensureThread()

    const userMsg: ChatMessage = {
      id: createId('msg'),
      threadId: thread.id,
      role: 'user',
      content: text,
      createdAt: Date.now(),
      status: 'done',
    }
    await this.store.appendMessage(userMsg)
    if (thread.title === '新会话' || thread.title === 'New chat') {
      thread.title = text.slice(0, 40) + (text.length > 40 ? '…' : '')
    }
    thread.updatedAt = Date.now()
    await this.store.upsertThread(thread)

    const userEv: ChatEvent = { type: 'message', message: userMsg }
    this.emit(userEv)
    yield userEv
    const threadEv: ChatEvent = { type: 'thread', thread }
    this.emit(threadEv)
    yield threadEv

    this.abort = new AbortController()
    const signal = this.abort.signal
    const maxRounds = this.config.maxToolRounds ?? 5
    const provider = this.getProvider()
    // Nano path does not run OpenAI tools (v1).
    const toolsEnabled = provider.supportsTools && this.tools.list().length > 0

    try {
      for (let round = 0; round <= maxRounds; round++) {
        const history = await this.store.getMessages(thread.id)
        const events: ChatEvent[] = []
        const result = await this.runCompletion(
          thread,
          history,
          signal,
          (ev) => {
            events.push(ev)
            this.emit(ev)
          },
          toolsEnabled,
        )
        for (const ev of events) yield ev

        if (toolsEnabled && result.finishReason === 'tool_calls' && result.toolCalls.length) {
          for (const call of result.toolCalls) {
            const run = await this.tools.run(call.name, call.arguments, {
              threadId: thread.id,
              abortSignal: signal,
            })
            const content = run.ok
              ? JSON.stringify(run.result ?? null)
              : JSON.stringify({ error: run.error })
            const toolMsg: ChatMessage = {
              id: createId('msg'),
              threadId: thread.id,
              role: 'tool',
              content,
              toolCallId: call.id,
              createdAt: Date.now(),
              status: 'done',
            }
            await this.store.appendMessage(toolMsg)
            const toolEv: ChatEvent = {
              type: 'tool-result',
              toolCallId: call.id,
              name: call.name,
              result: run.ok ? run.result : run.error,
              error: !run.ok,
            }
            this.emit(toolEv)
            yield toolEv
            const msgEv: ChatEvent = { type: 'message', message: toolMsg }
            this.emit(msgEv)
            yield msgEv
          }
          continue
        }

        const doneEv: ChatEvent = { type: 'done', message: result.assistantMessage }
        this.emit(doneEv)
        yield doneEv
        return
      }

      const err = new Error(`Exceeded maxToolRounds (${maxRounds})`)
      this.emit({ type: 'error', error: err })
      yield { type: 'error', error: err }
    } catch (err) {
      if (signal.aborted) {
        const aborted = new Error('Aborted')
        this.emit({ type: 'error', error: aborted })
        yield { type: 'error', error: aborted }
        return
      }
      const error = err instanceof Error ? err : new Error(String(err))
      this.emit({ type: 'error', error })
      yield { type: 'error', error }
    } finally {
      this.abort = null
    }
  }

  private async runCompletion(
    thread: ChatThread,
    history: ChatMessage[],
    signal: AbortSignal,
    onEvent: (ev: ChatEvent) => void,
    toolsEnabled: boolean,
  ): Promise<CompletionResult> {
    const { systemPrompt, maxMessages } = this.config
    const provider = this.getProvider()
    const openaiMessages = this.toOpenAIMessages(history, systemPrompt, maxMessages ?? 40)
    const tools = toolsEnabled ? this.tools.toOpenAI() : []

    const assistantId = createId('msg')
    const assistantMessage: ChatMessage = {
      id: assistantId,
      threadId: thread.id,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
      status: 'streaming',
    }
    await this.store.appendMessage(assistantMessage)
    onEvent({ type: 'message', message: { ...assistantMessage } })

    const toolAcc = new Map<number, AccumulatedToolCall>()
    let finishReason: string | null = null

    for await (const ev of provider.stream({
      config: this.config,
      messages: openaiMessages,
      tools,
      signal,
    })) {
      if (ev.type === 'text-delta') {
        assistantMessage.content += ev.delta
        await this.store.updateMessage({ ...assistantMessage })
        onEvent({
          type: 'text-delta',
          delta: ev.delta,
          messageId: assistantId,
        })
      } else if (ev.type === 'tool-call-deltas') {
        mergeToolCallDeltas(toolAcc, ev.deltas)
      } else if (ev.type === 'finish') {
        finishReason = ev.finishReason
      }
    }

    let toolCalls: ToolCall[] = []
    if (toolAcc.size) {
      toolCalls = [...toolAcc.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => ({
          id: v.id || createId('call'),
          name: v.name,
          arguments: v.arguments || '{}',
        }))
      assistantMessage.toolCalls = toolCalls
      for (const tc of toolCalls) {
        onEvent({ type: 'tool-call', toolCall: tc, messageId: assistantId })
      }
      if (!finishReason) finishReason = 'tool_calls'
    }

    assistantMessage.status = 'done'
    await this.store.updateMessage({ ...assistantMessage })
    thread.updatedAt = Date.now()
    await this.store.upsertThread(thread)
    onEvent({ type: 'message', message: { ...assistantMessage } })

    return { finishReason, toolCalls, assistantMessage }
  }

  private toOpenAIMessages(
    history: ChatMessage[],
    systemPrompt: string | undefined,
    maxMessages: number,
  ): OpenAICompatMessage[] {
    const out: OpenAICompatMessage[] = []
    if (systemPrompt) {
      out.push({ role: 'system', content: systemPrompt })
    }
    const sliced = history.slice(-maxMessages)
    for (const m of sliced) {
      if (m.role === 'tool') {
        out.push({
          role: 'tool',
          content: m.content,
          tool_call_id: m.toolCallId ?? '',
        })
      } else if (m.role === 'assistant' && m.toolCalls?.length) {
        out.push({
          role: 'assistant',
          content: m.content || '',
          tool_calls: m.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: { name: tc.name, arguments: tc.arguments },
          })),
        })
      } else if (m.role === 'system') {
        // injected from config each turn
      } else {
        out.push({ role: m.role as 'user' | 'assistant', content: m.content })
      }
    }
    return out
  }
}

export function createChatClient(opts: ChatEngineOptions): ChatEngine {
  return new ChatEngine(opts)
}
