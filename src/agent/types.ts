export type ChatProviderId = 'openai' | 'chrome-ai'

export interface SimpleChatConfig {
  /** OpenAI-compatible base URL without trailing /chat/completions */
  apiBaseUrl: string
  apiKey: string
  model: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  headers?: Record<string, string>
  maxMessages?: number
  maxToolRounds?: number
  /** Phase1 always 'openai'; 'chrome-ai' reserved for Phase2 Nano */
  provider?: ChatProviderId
}

export interface ChatThread {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  metadata?: Record<string, unknown>
}

export type Role = 'system' | 'user' | 'assistant' | 'tool'

export interface ToolCall {
  id: string
  name: string
  arguments: string
}

export interface ChatMessage {
  id: string
  threadId: string
  role: Role
  content: string
  toolCallId?: string
  toolCalls?: ToolCall[]
  createdAt: number
  status?: 'streaming' | 'done' | 'error'
}

export interface ToolContext {
  threadId: string
  abortSignal: AbortSignal
}

export interface HostTool {
  name: string
  description: string
  parameters: object
  handler: (args: unknown, ctx: ToolContext) => Promise<unknown> | unknown
}

export interface HistoryStore {
  listThreads(): Promise<ChatThread[]>
  getMessages(threadId: string): Promise<ChatMessage[]>
  upsertThread(t: ChatThread): Promise<void>
  appendMessage(m: ChatMessage): Promise<void>
  updateMessage(m: ChatMessage): Promise<void>
  deleteThread(id: string): Promise<void>
  clearAll?(): Promise<void>
}

export type ChatEvent =
  | { type: 'text-delta'; delta: string; messageId: string }
  | { type: 'tool-call'; toolCall: ToolCall; messageId: string }
  | { type: 'tool-result'; toolCallId: string; name: string; result: unknown; error?: boolean }
  | { type: 'message'; message: ChatMessage }
  | { type: 'thread'; thread: ChatThread }
  | { type: 'done'; message: ChatMessage }
  | { type: 'error'; error: Error }

export function createId(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

export function normalizeBaseUrl(base: string): string {
  return base.replace(/\/+$/, '')
}

export function chatCompletionsUrl(apiBaseUrl: string): string {
  return `${normalizeBaseUrl(apiBaseUrl)}/chat/completions`
}
