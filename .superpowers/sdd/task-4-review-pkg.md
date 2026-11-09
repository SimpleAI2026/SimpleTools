# Review package Task 4
BASE: 8dac1709ac875fb7a949487b0211cf5eff125984
HEAD: c3e47fbd880ff1fd4e92d48f2fe978d51254237b

## Commits
c3e47fb feat(agent): add ChatEngine with streaming tool loop

## Stat
 src/agent/ChatEngine.ts                | 352 +++++++++++++++++++++++++++++++++
 src/agent/__tests__/ChatEngine.test.ts | 122 ++++++++++++
 2 files changed, 474 insertions(+)

## Diff
diff --git a/src/agent/ChatEngine.ts b/src/agent/ChatEngine.ts
new file mode 100644
index 0000000..b070a9b
--- /dev/null
+++ b/src/agent/ChatEngine.ts
@@ -0,0 +1,352 @@
+import { ToolRegistry } from './ToolRegistry'
+import { MemoryStore } from './MemoryStore'
+import {
+  createId,
+  type ChatEvent,
+  type ChatMessage,
+  type ChatThread,
+  type HistoryStore,
+  type HostTool,
+  type SimpleChatConfig,
+  type ToolCall,
+  type ChatProviderId,
+} from './types'
+import { mergeToolCallDeltas, type AccumulatedToolCall } from './sse'
+import { OpenAICompatProvider } from './providers/OpenAICompatProvider'
+import type { ChatProvider, OpenAICompatMessage } from './providers/types'
+import { isChatProviderId } from './providers/types'
+
+export interface ChatEngineOptions {
+  config: SimpleChatConfig
+  store?: HistoryStore
+  storageKey?: string
+  fetchImpl?: typeof fetch
+  /** Optional override; otherwise resolved from config.provider. */
+  provider?: ChatProvider
+}
+
+interface CompletionResult {
+  finishReason: string | null
+  toolCalls: ToolCall[]
+  assistantMessage: ChatMessage
+}
+
+export class ChatEngine {
+  config: SimpleChatConfig
+  readonly tools = new ToolRegistry()
+  readonly store: HistoryStore
+  private fetchImpl: typeof fetch
+  private abort: AbortController | null = null
+  private listeners = new Set<(ev: ChatEvent) => void>()
+  private openaiProvider: OpenAICompatProvider
+  private injectedProvider: ChatProvider | null = null
+  currentThreadId: string | null = null
+
+  constructor(opts: ChatEngineOptions) {
+    this.config = { ...opts.config }
+    this.store = opts.store ?? new MemoryStore()
+    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis)
+    this.openaiProvider = new OpenAICompatProvider(this.fetchImpl)
+    this.injectedProvider = opts.provider ?? null
+  }
+
+  on(listener: (ev: ChatEvent) => void): () => void {
+    this.listeners.add(listener)
+    return () => this.listeners.delete(listener)
+  }
+
+  private emit(ev: ChatEvent): void {
+    for (const l of this.listeners) l(ev)
+  }
+
+  updateConfig(partial: Partial<SimpleChatConfig>): void {
+    this.config = { ...this.config, ...partial }
+  }
+
+  /** Active provider id (openai | chrome-ai). Phase1 defaults to openai. */
+  getProviderId(): ChatProviderId {
+    const p = this.config.provider
+    if (isChatProviderId(p)) return p
+    return 'openai'
+  }
+
+  getProvider(): ChatProvider {
+    if (this.injectedProvider) return this.injectedProvider
+    // Phase2: switch on this.getProviderId() === 'chrome-ai'
+    return this.openaiProvider
+  }
+
+  registerTool(tool: HostTool): void {
+    this.tools.register(tool)
+  }
+
+  unregisterTool(name: string): void {
+    this.tools.unregister(name)
+  }
+
+  stop(): void {
+    this.abort?.abort()
+    this.abort = null
+  }
+
+  async listThreads(): Promise<ChatThread[]> {
+    return this.store.listThreads()
+  }
+
+  async getMessages(threadId: string): Promise<ChatMessage[]> {
+    return this.store.getMessages(threadId)
+  }
+
+  async createThread(title = '新会话'): Promise<ChatThread> {
+    const now = Date.now()
+    const thread: ChatThread = {
+      id: createId('thread'),
+      title,
+      createdAt: now,
+      updatedAt: now,
+    }
+    await this.store.upsertThread(thread)
+    this.currentThreadId = thread.id
+    this.emit({ type: 'thread', thread })
+    return thread
+  }
+
+  async selectThread(id: string): Promise<void> {
+    this.currentThreadId = id
+  }
+
+  async deleteThread(id: string): Promise<void> {
+    await this.store.deleteThread(id)
+    if (this.currentThreadId === id) this.currentThreadId = null
+  }
+
+  async ensureThread(): Promise<ChatThread> {
+    if (this.currentThreadId) {
+      const threads = await this.store.listThreads()
+      const found = threads.find((t) => t.id === this.currentThreadId)
+      if (found) return found
+    }
+    return this.createThread()
+  }
+
+  async *send(userText: string): AsyncGenerator<ChatEvent> {
+    const text = userText.trim()
+    if (!text) return
+
+    const thread = await this.ensureThread()
+
+    const userMsg: ChatMessage = {
+      id: createId('msg'),
+      threadId: thread.id,
+      role: 'user',
+      content: text,
+      createdAt: Date.now(),
+      status: 'done',
+    }
+    await this.store.appendMessage(userMsg)
+    if (thread.title === '新会话' || thread.title === 'New chat') {
+      thread.title = text.slice(0, 40) + (text.length > 40 ? '…' : '')
+    }
+    thread.updatedAt = Date.now()
+    await this.store.upsertThread(thread)
+
+    const userEv: ChatEvent = { type: 'message', message: userMsg }
+    this.emit(userEv)
+    yield userEv
+    this.emit({ type: 'thread', thread })
+
+    this.abort = new AbortController()
+    const signal = this.abort.signal
+    const maxRounds = this.config.maxToolRounds ?? 5
+    const provider = this.getProvider()
+    // Nano path does not run OpenAI tools (v1).
+    const toolsEnabled = provider.supportsTools && this.tools.list().length > 0
+
+    try {
+      for (let round = 0; round <= maxRounds; round++) {
+        const history = await this.store.getMessages(thread.id)
+        const events: ChatEvent[] = []
+        const result = await this.runCompletion(
+          thread,
+          history,
+          signal,
+          (ev) => {
+            events.push(ev)
+            this.emit(ev)
+          },
+          toolsEnabled,
+        )
+        for (const ev of events) yield ev
+
+        if (toolsEnabled && result.finishReason === 'tool_calls' && result.toolCalls.length) {
+          for (const call of result.toolCalls) {
+            const run = await this.tools.run(call.name, call.arguments, {
+              threadId: thread.id,
+              abortSignal: signal,
+            })
+            const content = run.ok
+              ? JSON.stringify(run.result ?? null)
+              : JSON.stringify({ error: run.error })
+            const toolMsg: ChatMessage = {
+              id: createId('msg'),
+              threadId: thread.id,
+              role: 'tool',
+              content,
+              toolCallId: call.id,
+              createdAt: Date.now(),
+              status: 'done',
+            }
+            await this.store.appendMessage(toolMsg)
+            const toolEv: ChatEvent = {
+              type: 'tool-result',
+              toolCallId: call.id,
+              name: call.name,
+              result: run.ok ? run.result : run.error,
+              error: !run.ok,
+            }
+            this.emit(toolEv)
+            yield toolEv
+            const msgEv: ChatEvent = { type: 'message', message: toolMsg }
+            this.emit(msgEv)
+            yield msgEv
+          }
+          continue
+        }
+
+        const doneEv: ChatEvent = { type: 'done', message: result.assistantMessage }
+        this.emit(doneEv)
+        yield doneEv
+        return
+      }
+
+      const err = new Error(`Exceeded maxToolRounds (${maxRounds})`)
+      this.emit({ type: 'error', error: err })
+      yield { type: 'error', error: err }
+    } catch (err) {
+      if (signal.aborted) {
+        const aborted = new Error('Aborted')
+        this.emit({ type: 'error', error: aborted })
+        yield { type: 'error', error: aborted }
+        return
+      }
+      const error = err instanceof Error ? err : new Error(String(err))
+      this.emit({ type: 'error', error })
+      yield { type: 'error', error }
+    } finally {
+      this.abort = null
+    }
+  }
+
+  private async runCompletion(
+    thread: ChatThread,
+    history: ChatMessage[],
+    signal: AbortSignal,
+    onEvent: (ev: ChatEvent) => void,
+    toolsEnabled: boolean,
+  ): Promise<CompletionResult> {
+    const { systemPrompt, maxMessages } = this.config
+    const provider = this.getProvider()
+    const openaiMessages = this.toOpenAIMessages(history, systemPrompt, maxMessages ?? 40)
+    const tools = toolsEnabled ? this.tools.toOpenAI() : []
+
+    const assistantId = createId('msg')
+    const assistantMessage: ChatMessage = {
+      id: assistantId,
+      threadId: thread.id,
+      role: 'assistant',
+      content: '',
+      createdAt: Date.now(),
+      status: 'streaming',
+    }
+    await this.store.appendMessage(assistantMessage)
+    onEvent({ type: 'message', message: { ...assistantMessage } })
+
+    const toolAcc = new Map<number, AccumulatedToolCall>()
+    let finishReason: string | null = null
+
+    for await (const ev of provider.stream({
+      config: this.config,
+      messages: openaiMessages,
+      tools,
+      signal,
+    })) {
+      if (ev.type === 'text-delta') {
+        assistantMessage.content += ev.delta
+        await this.store.updateMessage({ ...assistantMessage })
+        onEvent({
+          type: 'text-delta',
+          delta: ev.delta,
+          messageId: assistantId,
+        })
+      } else if (ev.type === 'tool-call-deltas') {
+        mergeToolCallDeltas(toolAcc, ev.deltas)
+      } else if (ev.type === 'finish') {
+        finishReason = ev.finishReason
+      }
+    }
+
+    let toolCalls: ToolCall[] = []
+    if (toolAcc.size) {
+      toolCalls = [...toolAcc.entries()]
+        .sort((a, b) => a[0] - b[0])
+        .map(([, v]) => ({
+          id: v.id || createId('call'),
+          name: v.name,
+          arguments: v.arguments || '{}',
+        }))
+      assistantMessage.toolCalls = toolCalls
+      for (const tc of toolCalls) {
+        onEvent({ type: 'tool-call', toolCall: tc, messageId: assistantId })
+      }
+      if (!finishReason) finishReason = 'tool_calls'
+    }
+
+    assistantMessage.status = 'done'
+    await this.store.updateMessage({ ...assistantMessage })
+    thread.updatedAt = Date.now()
+    await this.store.upsertThread(thread)
+    onEvent({ type: 'message', message: { ...assistantMessage } })
+
+    return { finishReason, toolCalls, assistantMessage }
+  }
+
+  private toOpenAIMessages(
+    history: ChatMessage[],
+    systemPrompt: string | undefined,
+    maxMessages: number,
+  ): OpenAICompatMessage[] {
+    const out: OpenAICompatMessage[] = []
+    if (systemPrompt) {
+      out.push({ role: 'system', content: systemPrompt })
+    }
+    const sliced = history.slice(-maxMessages)
+    for (const m of sliced) {
+      if (m.role === 'tool') {
+        out.push({
+          role: 'tool',
+          content: m.content,
+          tool_call_id: m.toolCallId ?? '',
+        })
+      } else if (m.role === 'assistant' && m.toolCalls?.length) {
+        out.push({
+          role: 'assistant',
+          content: m.content || '',
+          tool_calls: m.toolCalls.map((tc) => ({
+            id: tc.id,
+            type: 'function',
+            function: { name: tc.name, arguments: tc.arguments },
+          })),
+        })
+      } else if (m.role === 'system') {
+        // injected from config each turn
+      } else {
+        out.push({ role: m.role as 'user' | 'assistant', content: m.content })
+      }
+    }
+    return out
+  }
+}
+
+export function createChatClient(opts: ChatEngineOptions): ChatEngine {
+  return new ChatEngine(opts)
+}
diff --git a/src/agent/__tests__/ChatEngine.test.ts b/src/agent/__tests__/ChatEngine.test.ts
new file mode 100644
index 0000000..37f0401
--- /dev/null
+++ b/src/agent/__tests__/ChatEngine.test.ts
@@ -0,0 +1,122 @@
+import { describe, it, expect, vi, beforeEach } from 'vitest'
+import { ChatEngine } from '../ChatEngine'
+import { MemoryStore } from '../MemoryStore'
+
+function sseChunk(obj: unknown): string {
+  return `data: ${JSON.stringify(obj)}\n\n`
+}
+
+function streamResponse(chunks: string[]): Response {
+  const encoder = new TextEncoder()
+  const stream = new ReadableStream<Uint8Array>({
+    start(controller) {
+      for (const c of chunks) controller.enqueue(encoder.encode(c))
+      controller.close()
+    },
+  })
+  return new Response(stream, {
+    status: 200,
+    headers: { 'Content-Type': 'text/event-stream' },
+  })
+}
+
+describe('ChatEngine', () => {
+  let fetchMock: ReturnType<typeof vi.fn>
+
+  beforeEach(() => {
+    fetchMock = vi.fn()
+  })
+
+  it('streams text deltas from mock SSE', async () => {
+    fetchMock.mockResolvedValue(
+      streamResponse([
+        sseChunk({ choices: [{ delta: { content: 'Hello' }, finish_reason: null }] }),
+        sseChunk({ choices: [{ delta: { content: ' world' }, finish_reason: null }] }),
+        sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
+        'data: [DONE]\n\n',
+      ]),
+    )
+
+    const engine = new ChatEngine({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'test-model',
+        provider: 'openai',
+      },
+      store: new MemoryStore(),
+      fetchImpl: fetchMock as unknown as typeof fetch,
+    })
+
+    const deltas: string[] = []
+    let doneContent = ''
+    for await (const ev of engine.send('hi')) {
+      if (ev.type === 'text-delta') deltas.push(ev.delta)
+      if (ev.type === 'done') doneContent = ev.message.content
+    }
+
+    expect(deltas.join('')).toBe('Hello world')
+    expect(doneContent).toBe('Hello world')
+  })
+
+  it('runs tool loop and feeds result back', async () => {
+    fetchMock
+      .mockResolvedValueOnce(
+        streamResponse([
+          sseChunk({
+            choices: [
+              {
+                delta: {
+                  tool_calls: [
+                    {
+                      index: 0,
+                      id: 'call_1',
+                      type: 'function',
+                      function: { name: 'echo', arguments: '{"x":1}' },
+                    },
+                  ],
+                },
+                finish_reason: null,
+              },
+            ],
+          }),
+          sseChunk({ choices: [{ delta: {}, finish_reason: 'tool_calls' }] }),
+          'data: [DONE]\n\n',
+        ]),
+      )
+      .mockResolvedValueOnce(
+        streamResponse([
+          sseChunk({ choices: [{ delta: { content: 'done' }, finish_reason: null }] }),
+          sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
+          'data: [DONE]\n\n',
+        ]),
+      )
+
+    const engine = new ChatEngine({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'test-model',
+        provider: 'openai',
+      },
+      store: new MemoryStore(),
+      fetchImpl: fetchMock as unknown as typeof fetch,
+    })
+    engine.registerTool({
+      name: 'echo',
+      description: 'Echo args',
+      parameters: { type: 'object', properties: { x: { type: 'number' } } },
+      handler: async (args) => args,
+    })
+
+    const toolResults: unknown[] = []
+    let final = ''
+    for await (const ev of engine.send('run echo')) {
+      if (ev.type === 'tool-result') toolResults.push(ev.result)
+      if (ev.type === 'done') final = ev.message.content
+    }
+    expect(toolResults[0]).toEqual({ x: 1 })
+    expect(final).toBe('done')
+    expect(fetchMock).toHaveBeenCalledTimes(2)
+  })
+})
