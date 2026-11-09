### Task 1: Agent types + MemoryStore + createId

**Files:**
- Create: `src/agent/types.ts`
- Create: `src/agent/MemoryStore.ts`
- Create: `src/agent/__tests__/types.test.ts`
- Test: `src/agent/__tests__/types.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `SimpleChatConfig`, `ChatThread`, `ChatMessage`, `HostTool`, `ToolContext`, `ToolCall`, `ChatEvent`, `HistoryStore`, `Role`, `createId()`, `normalizeBaseUrl()`, `chatCompletionsUrl()`; `MemoryStore` implementing `HistoryStore`

- [ ] **Step 1: Write the failing test**

```ts
// src/agent/__tests__/types.test.ts
import { describe, expect, it } from 'vitest'
import { chatCompletionsUrl, createId, normalizeBaseUrl } from '../types'
import { MemoryStore } from '../MemoryStore'

describe('chatCompletionsUrl', () => {
  it('appends /chat/completions and strips trailing slash', () => {
    expect(chatCompletionsUrl('https://api.example.com/v1')).toBe(
      'https://api.example.com/v1/chat/completions',
    )
    expect(chatCompletionsUrl('https://api.example.com/v1/')).toBe(
      'https://api.example.com/v1/chat/completions',
    )
  })
})

describe('MemoryStore', () => {
  it('upserts threads and appends messages in order', async () => {
    const store = new MemoryStore()
    const thread = {
      id: 'thread_1',
      title: '新会话',
      createdAt: 1,
      updatedAt: 1,
    }
    await store.upsertThread(thread)
    await store.appendMessage({
      id: 'msg_1',
      threadId: 'thread_1',
      role: 'user',
      content: 'hi',
      createdAt: 2,
      status: 'done',
    })
    expect(await store.listThreads()).toEqual([thread])
    expect((await store.getMessages('thread_1'))[0]?.content).toBe('hi')
  })
})

describe('createId', () => {
  it('prefixes ids', () => {
    expect(createId('thread').startsWith('thread_')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/agent/__tests__/types.test.ts`
Expected: FAIL — cannot resolve `../types` / `../MemoryStore`

- [ ] **Step 3: Write minimal implementation**

```ts
// src/agent/types.ts
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
  handler: (args: any, ctx: ToolContext) => Promise<unknown> | unknown
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
```

```ts
// src/agent/MemoryStore.ts
import type { ChatMessage, ChatThread, HistoryStore } from './types'

export class MemoryStore implements HistoryStore {
  private threads = new Map<string, ChatThread>()
  private messages = new Map<string, ChatMessage[]>()

  async listThreads(): Promise<ChatThread[]> {
    return [...this.threads.values()].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getMessages(threadId: string): Promise<ChatMessage[]> {
    return [...(this.messages.get(threadId) ?? [])]
  }

  async upsertThread(t: ChatThread): Promise<void> {
    this.threads.set(t.id, { ...t })
  }

  async appendMessage(m: ChatMessage): Promise<void> {
    const list = this.messages.get(m.threadId) ?? []
    list.push({ ...m })
    this.messages.set(m.threadId, list)
  }

  async updateMessage(m: ChatMessage): Promise<void> {
    const list = this.messages.get(m.threadId) ?? []
    const idx = list.findIndex((x) => x.id === m.id)
    if (idx >= 0) list[idx] = { ...m }
    else list.push({ ...m })
    this.messages.set(m.threadId, list)
  }

  async deleteThread(id: string): Promise<void> {
    this.threads.delete(id)
    this.messages.delete(id)
  }

  async clearAll(): Promise<void> {
    this.threads.clear()
    this.messages.clear()
  }
}
```

Port verbatim from SimpleChat `packages/core/src/types.ts` + `MemoryStore.ts` (paths above). Prefer copying those files and dropping `.js` extensions for Vite/TS path style used in SimpleTools (`from './types'` not `from './types.js'`).

- [ ] **Step 4: Run test to verify it passes**

Run: `yarn test src/agent/__tests__/types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/agent/types.ts src/agent/MemoryStore.ts src/agent/__tests__/types.test.ts
git commit -m "feat(agent): add chat types and MemoryStore"
```

---

