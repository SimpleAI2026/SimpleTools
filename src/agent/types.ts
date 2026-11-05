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
  /** openai (cloud BYOK) | chrome-ai (Chrome Prompt API / Gemini Nano) */
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

/** Multimodal content part (OpenAI-compatible vision shape). */
export type ChatContentPart =
  | { type: 'text'; text: string }
  | {
      type: 'image_url'
      image_url: { url: string; detail?: 'auto' | 'low' | 'high' }
      /** UI / persistence helpers; strip before OpenAI body if desired */
      name?: string
      mime?: string
      attachmentId?: string
    }

export interface ChatMessage {
  id: string
  threadId: string
  role: Role
  /** Plain-text summary / legacy; when `parts` is set, parts win for the model */
  content: string
  /** Optional multimodal parts (Phase A: text + image_url) */
  parts?: ChatContentPart[]
  toolCallId?: string
  toolCalls?: ToolCall[]
  createdAt: number
  status?: 'streaming' | 'done' | 'error'
}

/** Attachment input for ChatEngine.send (already resolved URLs / data URLs). */
export interface SendAttachment {
  url: string
  mime?: string
  name?: string
  detail?: 'auto' | 'low' | 'high'
}

export interface SendOptions {
  attachments?: SendAttachment[]
}

/** Host-pluggable upload; return a model/UI reference. */
export type UploadFileResult =
  | { url: string; mime?: string; name?: string }
  | { base64: string; mime: string; name?: string }
  | { id: string; url?: string; mime?: string; name?: string }

export type UploadFileHandler = (
  file: File,
  ctx: { signal: AbortSignal; threadId: string | null },
) => Promise<UploadFileResult>

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
