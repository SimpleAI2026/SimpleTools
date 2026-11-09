# SimpleTools Agent Chat (Route C′) — BYOK + HostTool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class `/agent` chat page to SimpleTools that ports SimpleChat core (ChatEngine / ToolRegistry / OpenAICompatProvider / SSE / IndexedDB / settings) into `src/agent/`, wires BYOK OpenAI-compatible streaming, and registers three HostTools (`list_tools`, `open_tool`, `run_offline_tool`) — without Shadow DOM or `@simplechat/element`.

**Architecture:** Phase 1 is cloud BYOK only (`provider: 'openai'`). Copy and adapt SimpleChat `packages/core` modules into `src/agent/` as first-party TypeScript (no npm link to SimpleChat, no `@simplechat/*`). A Pinia `agent` store owns one `ChatEngine` + IndexedDB history + settings. Vue UI uses existing shadcn-vue + neutral B&W tokens. HostTools bridge the model to the offline toolbox registry (list / navigate / run whitelisted pure-logic tools). Chrome Gemini Nano is Phase 2 — stub note only.

**Tech Stack:** Vue 3 · Vite · Yarn 4 · Pinia · vue-i18n · Tailwind 4 · shadcn-vue (reka-ui) · Vitest · IndexedDB · `fetch` SSE. Reference source: `/Volumes/my/github/SimpleChat/packages/core/src/*`.

## Global Constraints

- Offline-first toolbox brand; BYOK is an explicit opt-in chat surface, not a registry tool card.
- Do **not** depend on `thirdparty/` (reference-only).
- Do **not** import `@simplechat/element` or use Shadow DOM / web components.
- Do **not** add MCP runtime, multimodal uploads, or Chrome Nano provider tasks in this plan (Nano = Phase 2 stub only).
- UI must reuse `src/components/ui/*` and `src/styles/globals.css` (neutral B&W). Do not port SimpleChat themes.
- Settings (`baseURL`, `apiKey`, `model`, `systemPrompt`) persist in **localStorage only** (key scoped `simpletools-agent:settings`).
- Chat history persists in IndexedDB (`simpletools-agent` DB name / storage key).
- Chrome extension currently has `"permissions": []` and **no** `host_permissions`. P1 must **not** expand permissions unless absolutely required; document that extension BYOK fetch to arbitrary HTTPS APIs will fail until optional host permissions (later). Web build relies on CORS-friendly OpenAI-compat endpoints.
- Commits: author email `zhoulv2000@163.com` (already repo default). Prefer small commits per task.
- Chinese primary user; i18n keys in zh-CN + en at minimum (other locales fall back to `en` via vue-i18n `fallbackLocale`).
- Stack floors: Vue3 / Vite / Yarn4 / Pinia / vue-i18n / Tailwind4 / shadcn-vue as in root `package.json`.

---

## File Structure Map

### Create — agent engine (ported from SimpleChat core)

| Path | Responsibility |
|------|----------------|
| `src/agent/types.ts` | `SimpleChatConfig`, `ChatThread`, `ChatMessage`, `HostTool`, `ChatEvent`, `HistoryStore`, `createId`, `chatCompletionsUrl` |
| `src/agent/ToolRegistry.ts` | Register / list / `toOpenAI` / `run` |
| `src/agent/MemoryStore.ts` | In-memory `HistoryStore` (tests + fallback) |
| `src/agent/IndexedDBStore.ts` | Persistent threads + messages |
| `src/agent/sse.ts` | `parseSSEStream`, `mergeToolCallDeltas` |
| `src/agent/parseToolArgs.ts` | Resilient tool-arguments JSON parse |
| `src/agent/normalizeSecret.ts` | Optional `my-` Base64 key decode |
| `src/agent/providers/types.ts` | `ChatProvider`, stream request/event types; `ChatProviderId` includes `'openai' \| 'chrome-ai'` for future |
| `src/agent/providers/OpenAICompatProvider.ts` | SSE chat.completions client |
| `src/agent/providers/index.ts` | Re-exports (openai only in P1) |
| `src/agent/ChatEngine.ts` | Thread CRUD + `send()` async generator + tool loop |
| `src/agent/settings.ts` | localStorage load/save/merge for BYOK settings |
| `src/agent/index.ts` | Public barrel |
| `src/agent/hostTools/whitelist.ts` | Safe offline slugs for `run_offline_tool` |
| `src/agent/hostTools/createHostTools.ts` | Factory returning the three `HostTool`s |
| `src/agent/hostTools/index.ts` | Re-export |
| `src/agent/__tests__/ChatEngine.test.ts` | Stream + tool-loop tests (TDD) |
| `src/agent/__tests__/ToolRegistry.test.ts` | Registry unit tests |
| `src/agent/__tests__/sse.test.ts` | SSE parse tests |
| `src/agent/__tests__/settings.test.ts` | Settings persistence tests |
| `src/agent/__tests__/hostTools.test.ts` | HostTool behavior tests |
| `src/agent/__tests__/IndexedDBStore.test.ts` | Store tests with `fake-indexeddb` |

### Create — Vue / Pinia / UI

| Path | Responsibility |
|------|----------------|
| `src/stores/agent.ts` | Pinia: engine lifecycle, threads, messages, streaming, settings dialog state |
| `src/pages/AgentPage.vue` | Route page: left threads / right chat |
| `src/components/agent/AgentThreadList.vue` | Thread list + new/delete |
| `src/components/agent/AgentMessageList.vue` | Scrollable messages |
| `src/components/agent/AgentMessage.vue` | Single message bubble (+ tool call/result cards) |
| `src/components/agent/AgentComposer.vue` | Textarea + send/stop |
| `src/components/agent/AgentSettingsDialog.vue` | BYOK settings Dialog |
| `src/components/agent/AgentMarkdown.vue` | marked + DOMPurify render |

### Modify

| Path | Change |
|------|--------|
| `src/router/index.ts` | Add `/agent` route + document title |
| `src/components/layout/AppHeader.vue` | Agent entry button (Bot icon) → `/agent` |
| `src/App.vue` | Full-bleed main for agent route (drop `max-w-6xl` / footer spacing) |
| `src/i18n/locales/zh-CN.ts` | `app.agent*` + `agent.*` message tree |
| `src/i18n/locales/en.ts` | Same keys in English |
| `package.json` (optional) | DevDep `fake-indexeddb` if IndexedDB tests need it |
| `chrome-extension/manifest.json` | **No P1 change** — document constraint only |
| `chrome-extension/README.md` | Note future optional host permissions for BYOK |

### Out of scope (explicit)

- `ChromeAiProvider` / Nano download UI (Phase 2 stub in `src/agent/PHASE2_NANO.md` one-liner)
- MCP runtime, file/image multimodal, Shadow DOM, `@simplechat/element`
- Registering chat itself as a tool card under `src/registry`

### Phase 2 stub (no implementation tasks)

Create `src/agent/PHASE2_NANO.md` with a short note that Gemini Nano (`chrome-ai`) will reuse `ChatProviderId` and `ChatEngine.getProvider()` switch; tools stay disabled on Nano (SimpleChat behavior).

---

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

### Task 2: parseToolArgs + ToolRegistry (TDD)

**Files:**
- Create: `src/agent/parseToolArgs.ts`
- Create: `src/agent/ToolRegistry.ts`
- Create: `src/agent/__tests__/ToolRegistry.test.ts`

**Interfaces:**
- Consumes: `HostTool`, `ToolContext` from Task 1
- Produces: `parseToolArguments(argsJson: string): unknown`; `ToolRegistry` with `register`, `unregister`, `clear`, `has`, `list`, `toOpenAI`, `run`

- [ ] **Step 1: Write the failing test**

```ts
// src/agent/__tests__/ToolRegistry.test.ts
import { describe, expect, it } from 'vitest'
import { ToolRegistry } from '../ToolRegistry'

describe('ToolRegistry', () => {
  it('rejects invalid names and runs handlers', async () => {
    const reg = new ToolRegistry()
    expect(() =>
      reg.register({
        name: 'bad name',
        description: 'x',
        parameters: { type: 'object', properties: {} },
        handler: () => null,
      }),
    ).toThrow(/Invalid tool name/)

    reg.register({
      name: 'echo',
      description: 'Echo',
      parameters: {
        type: 'object',
        properties: { text: { type: 'string' } },
        required: ['text'],
      },
      handler: (args: { text: string }) => ({ text: args.text }),
    })

    const ok = await reg.run('echo', '{"text":"hi"}', {
      threadId: 't1',
      abortSignal: new AbortController().signal,
    })
    expect(ok).toEqual({ ok: true, result: { text: 'hi' } })

    const missing = await reg.run('nope', '{}', {
      threadId: 't1',
      abortSignal: new AbortController().signal,
    })
    expect(missing.ok).toBe(false)

    expect(reg.toOpenAI()[0]?.function.name).toBe('echo')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/agent/__tests__/ToolRegistry.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Port implementation**

Copy from SimpleChat:
- `packages/core/src/parseToolArgs.ts` → `src/agent/parseToolArgs.ts` (keep CSS-repair helpers; harmless)
- `packages/core/src/ToolRegistry.ts` → `src/agent/ToolRegistry.ts`

Adjust imports to `./types` / `./parseToolArgs` (no `.js` suffix).

- [ ] **Step 4: Run tests**

Run: `yarn test src/agent/__tests__/ToolRegistry.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/agent/parseToolArgs.ts src/agent/ToolRegistry.ts src/agent/__tests__/ToolRegistry.test.ts
git commit -m "feat(agent): add ToolRegistry and parseToolArgs"
```

---

### Task 3: SSE + normalizeSecret + OpenAICompatProvider (TDD)

**Files:**
- Create: `src/agent/sse.ts`
- Create: `src/agent/normalizeSecret.ts`
- Create: `src/agent/providers/types.ts`
- Create: `src/agent/providers/OpenAICompatProvider.ts`
- Create: `src/agent/providers/index.ts`
- Create: `src/agent/__tests__/sse.test.ts`
- Create: `src/agent/__tests__/OpenAICompatProvider.test.ts`

**Interfaces:**
- Consumes: `SimpleChatConfig`, `chatCompletionsUrl` from Task 1
- Produces: `parseSSEStream`, `mergeToolCallDeltas`, `OpenAICompatProvider.stream()`, `ChatProvider` interface

- [ ] **Step 1: Write failing SSE test**

```ts
// src/agent/__tests__/sse.test.ts
import { describe, expect, it } from 'vitest'
import { mergeToolCallDeltas, parseSSEStream } from '../sse'

function streamOf(text: string): ReadableStream<Uint8Array> {
  const enc = new TextEncoder()
  return new ReadableStream({
    start(c) {
      c.enqueue(enc.encode(text))
      c.close()
    },
  })
}

describe('parseSSEStream', () => {
  it('yields deltas until [DONE]', async () => {
    const body = streamOf(
      'data: {"choices":[{"delta":{"content":"Hi"},"finish_reason":null}]}\n\n' +
        'data: [DONE]\n\n',
    )
    const chunks = []
    for await (const c of parseSSEStream(body)) chunks.push(c)
    expect(chunks[0]?.delta?.content).toBe('Hi')
  })
})

describe('mergeToolCallDeltas', () => {
  it('accumulates name and arguments by index', () => {
    const acc = new Map()
    mergeToolCallDeltas(acc, [
      { index: 0, id: 'call_1', function: { name: 'list_', arguments: '' } },
      { index: 0, function: { name: 'tools', arguments: '{}' } },
    ])
    expect(acc.get(0)).toEqual({ id: 'call_1', name: 'list_tools', arguments: '{}' })
  })
})
```

- [ ] **Step 2: Run to verify fail**

Run: `yarn test src/agent/__tests__/sse.test.ts`
Expected: FAIL

- [ ] **Step 3: Port SSE, normalizeSecret, provider types + OpenAICompatProvider**

Copy from SimpleChat core:
- `sse.ts`, `normalizeSecret.ts`
- `providers/types.ts` (keep `ChatProviderId` union including `'chrome-ai'` for Phase2 typing only)
- `providers/OpenAICompatProvider.ts`
- `providers/index.ts` — export openai + types only; **do not** port `ChromeAiProvider.ts` in P1

Provider index sketch:

```ts
// src/agent/providers/index.ts
export type {
  ChatProvider,
  ChatProviderId,
  OpenAICompatMessage,
  ProviderStreamEvent,
  ProviderStreamRequest,
} from './types'
export { isChatProviderId } from './types'
export { OpenAICompatProvider } from './OpenAICompatProvider'
```

- [ ] **Step 4: Provider smoke test**

```ts
// src/agent/__tests__/OpenAICompatProvider.test.ts
import { describe, expect, it, vi } from 'vitest'
import { OpenAICompatProvider } from '../providers/OpenAICompatProvider'

function sseResponse(chunks: string[]): Response {
  const enc = new TextEncoder()
  const stream = new ReadableStream({
    start(c) {
      for (const x of chunks) c.enqueue(enc.encode(x))
      c.close()
    },
  })
  return new Response(stream, { status: 200 })
}

describe('OpenAICompatProvider', () => {
  it('POSTs chat.completions and yields text-delta + finish', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      sseResponse([
        'data: {"choices":[{"delta":{"content":"A"},"finish_reason":null}]}\n\n',
        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
        'data: [DONE]\n\n',
      ]),
    )
    const provider = new OpenAICompatProvider(fetchImpl as unknown as typeof fetch)
    const events = []
    for await (const ev of provider.stream({
      config: {
        apiBaseUrl: 'https://api.example.com/v1',
        apiKey: 'sk-test',
        model: 'm',
      },
      messages: [{ role: 'user', content: 'hi' }],
      tools: [],
      signal: new AbortController().signal,
    })) {
      events.push(ev)
    }
    expect(events.some((e) => e.type === 'text-delta' && e.delta === 'A')).toBe(true)
    expect(events.at(-1)).toEqual({ type: 'finish', finishReason: 'stop' })
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.example.com/v1/chat/completions')
  })
})
```

- [ ] **Step 5: Run tests + commit**

```bash
yarn test src/agent/__tests__/sse.test.ts src/agent/__tests__/OpenAICompatProvider.test.ts
git add src/agent/sse.ts src/agent/normalizeSecret.ts src/agent/providers src/agent/__tests__/sse.test.ts src/agent/__tests__/OpenAICompatProvider.test.ts
git commit -m "feat(agent): add SSE parser and OpenAICompatProvider"
```

---

### Task 4: ChatEngine send + tool loop (TDD)

**Files:**
- Create: `src/agent/ChatEngine.ts`
- Create: `src/agent/__tests__/ChatEngine.test.ts`

**Interfaces:**
- Consumes: `ToolRegistry`, `MemoryStore`, `OpenAICompatProvider`, `mergeToolCallDeltas`, types
- Produces: `ChatEngine` with `on`, `updateConfig`, `registerTool`, `stop`, `listThreads`, `getMessages`, `createThread`, `selectThread`, `deleteThread`, `ensureThread`, `send(userText): AsyncGenerator<ChatEvent>`, `createChatClient(opts)`

- [ ] **Step 1: Write failing tests** (adapt SimpleChat `ChatEngine.test.ts`)

```ts
// src/agent/__tests__/ChatEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatEngine } from '../ChatEngine'
import { MemoryStore } from '../MemoryStore'

function sseChunk(obj: unknown): string {
  return `data: ${JSON.stringify(obj)}\n\n`
}

function streamResponse(chunks: string[]): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c))
      controller.close()
    },
  })
  return new Response(stream, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('ChatEngine', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
  })

  it('streams text deltas from mock SSE', async () => {
    fetchMock.mockResolvedValue(
      streamResponse([
        sseChunk({ choices: [{ delta: { content: 'Hello' }, finish_reason: null }] }),
        sseChunk({ choices: [{ delta: { content: ' world' }, finish_reason: null }] }),
        sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
        'data: [DONE]\n\n',
      ]),
    )

    const engine = new ChatEngine({
      config: {
        apiBaseUrl: 'https://api.example.com/v1',
        apiKey: 'sk-test',
        model: 'test-model',
        provider: 'openai',
      },
      store: new MemoryStore(),
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    const deltas: string[] = []
    let doneContent = ''
    for await (const ev of engine.send('hi')) {
      if (ev.type === 'text-delta') deltas.push(ev.delta)
      if (ev.type === 'done') doneContent = ev.message.content
    }

    expect(deltas.join('')).toBe('Hello world')
    expect(doneContent).toBe('Hello world')
  })

  it('runs tool loop and feeds result back', async () => {
    fetchMock
      .mockResolvedValueOnce(
        streamResponse([
          sseChunk({
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      index: 0,
                      id: 'call_1',
                      type: 'function',
                      function: { name: 'echo', arguments: '{"x":1}' },
                    },
                  ],
                },
                finish_reason: null,
              },
            ],
          }),
          sseChunk({ choices: [{ delta: {}, finish_reason: 'tool_calls' }] }),
          'data: [DONE]\n\n',
        ]),
      )
      .mockResolvedValueOnce(
        streamResponse([
          sseChunk({ choices: [{ delta: { content: 'done' }, finish_reason: null }] }),
          sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
          'data: [DONE]\n\n',
        ]),
      )

    const engine = new ChatEngine({
      config: {
        apiBaseUrl: 'https://api.example.com/v1',
        apiKey: 'sk-test',
        model: 'test-model',
        provider: 'openai',
      },
      store: new MemoryStore(),
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    engine.registerTool({
      name: 'echo',
      description: 'Echo args',
      parameters: { type: 'object', properties: { x: { type: 'number' } } },
      handler: async (args) => args,
    })

    const toolResults: unknown[] = []
    let final = ''
    for await (const ev of engine.send('run echo')) {
      if (ev.type === 'tool-result') toolResults.push(ev.result)
      if (ev.type === 'done') final = ev.message.content
    }
    expect(toolResults[0]).toEqual({ x: 1 })
    expect(final).toBe('done')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run to verify fail**

Run: `yarn test src/agent/__tests__/ChatEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Port ChatEngine**

Copy `packages/core/src/ChatEngine.ts` → `src/agent/ChatEngine.ts` with these P1 adaptations:
1. Import paths without `.js`.
2. Remove `ChromeAiProvider` construction; resolve provider as:

```ts
getProvider(): ChatProvider {
  if (this.injectedProvider) return this.injectedProvider
  // Phase2: switch on this.getProviderId() === 'chrome-ai'
  return this.openaiProvider
}
```

3. Keep `getProviderId()` returning `'openai'` by default.
4. Do **not** add `getChromeAiProvider()` (or stub throwing `Error('Phase2 Nano')` if you want API parity — prefer omit).

Reference behavior to preserve: `send()` yields `message` → tool rounds → `done`/`error`; title auto-rename from first user text when title is `新会话` / `New chat`.

- [ ] **Step 4: Run tests + commit**

```bash
yarn test src/agent/__tests__/ChatEngine.test.ts
git add src/agent/ChatEngine.ts src/agent/__tests__/ChatEngine.test.ts
git commit -m "feat(agent): add ChatEngine with streaming tool loop"
```

---

### Task 5: IndexedDBStore + settings persistence (TDD)

**Files:**
- Create: `src/agent/IndexedDBStore.ts`
- Create: `src/agent/settings.ts`
- Create: `src/agent/__tests__/settings.test.ts`
- Create: `src/agent/__tests__/IndexedDBStore.test.ts`
- Modify: `package.json` — add devDependency `fake-indexeddb` if missing
- Create: `src/agent/index.ts` barrel
- Create: `src/agent/PHASE2_NANO.md`

**Interfaces:**
- Consumes: `HistoryStore`, `SimpleChatConfig` types
- Produces:
  - `IndexedDBStore` / `indexedDbStore(storageKey)`
  - `AGENT_STORAGE_KEY = 'simpletools-agent'`
  - `PersistedAgentSettings`, `loadAgentSettings()`, `saveAgentSettings()`, `resolveAgentConfig()`
  - Barrel exports for UI/store

- [ ] **Step 1: Install test helper (if needed)**

```bash
yarn add -D fake-indexeddb
```

- [ ] **Step 2: Write settings failing test**

```ts
// src/agent/__tests__/settings.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import {
  AGENT_STORAGE_KEY,
  loadAgentSettings,
  saveAgentSettings,
  resolveAgentConfig,
  DEFAULT_AGENT_MODEL,
} from '../settings'

describe('agent settings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips settings when rememberKey is true', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: 'gpt-4o-mini',
      systemPrompt: 'You are helpful.',
      rememberKey: true,
    })
    const loaded = loadAgentSettings()
    expect(loaded?.apiKey).toBe('sk-secret')
    expect(loaded?.model).toBe('gpt-4o-mini')

    const cfg = resolveAgentConfig()
    expect(cfg.apiBaseUrl).toBe('https://api.example.com/v1')
    expect(cfg.model).toBe('gpt-4o-mini')
    expect(cfg.provider).toBe('openai')
  })

  it('omits apiKey when rememberKey is false', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: '',
      systemPrompt: '',
      rememberKey: false,
    })
    expect(loadAgentSettings()?.apiKey).toBeUndefined()
    expect(resolveAgentConfig().model).toBe(DEFAULT_AGENT_MODEL)
  })

  it('uses scoped storage key', () => {
    expect(AGENT_STORAGE_KEY).toBe('simpletools-agent')
  })
})
```

Vitest `environment` is `node` today — for `localStorage` / IndexedDB tests, either:
- set file-level `/** @vitest-environment jsdom */`, or
- add `happy-dom`/`jsdom` per-file pragma (jsdom already in package.json).

Use:

```ts
/** @vitest-environment jsdom */
```

at top of settings + IndexedDB test files.

- [ ] **Step 3: Implement settings**

```ts
// src/agent/settings.ts
import type { ChatProviderId, SimpleChatConfig } from './types'

export const AGENT_STORAGE_KEY = 'simpletools-agent'
export const AGENT_SETTINGS_LS_KEY = `${AGENT_STORAGE_KEY}:settings`
/** Sensible default; user overrides in Settings Dialog */
export const DEFAULT_AGENT_MODEL = 'gpt-4o-mini'

export interface PersistedAgentSettings {
  apiBaseUrl?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  rememberKey?: boolean
}

export function loadAgentSettings(): PersistedAgentSettings | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(AGENT_SETTINGS_LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedAgentSettings
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveAgentSettings(settings: PersistedAgentSettings): void {
  try {
    if (typeof localStorage === 'undefined') return
    const payload: PersistedAgentSettings = {
      apiBaseUrl: settings.apiBaseUrl ?? '',
      model: settings.model ?? '',
      systemPrompt: settings.systemPrompt ?? '',
      rememberKey: !!settings.rememberKey,
    }
    if (payload.rememberKey && settings.apiKey) {
      payload.apiKey = settings.apiKey
    }
    localStorage.setItem(AGENT_SETTINGS_LS_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

function nonEmpty(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

export function resolveAgentConfig(
  override?: Partial<PersistedAgentSettings>,
): SimpleChatConfig {
  const stored = loadAgentSettings()
  const apiKey =
    nonEmpty(override?.apiKey) ||
    (stored?.rememberKey ? nonEmpty(stored.apiKey) : '') ||
    ''
  return {
    apiBaseUrl:
      nonEmpty(override?.apiBaseUrl) || nonEmpty(stored?.apiBaseUrl) || '',
    apiKey,
    model:
      nonEmpty(override?.model) ||
      nonEmpty(stored?.model) ||
      DEFAULT_AGENT_MODEL,
    systemPrompt:
      nonEmpty(override?.systemPrompt) || nonEmpty(stored?.systemPrompt) || '',
    provider: 'openai' satisfies ChatProviderId,
    maxToolRounds: 5,
    maxMessages: 40,
  }
}
```

- [ ] **Step 4: Port IndexedDBStore**

Copy SimpleChat `IndexedDBStore.ts` → `src/agent/IndexedDBStore.ts`. Change default DB prefix:

```ts
constructor(storageKey = AGENT_STORAGE_KEY) {
  this.dbPromise = openDb(`simpletools-agent:${storageKey}`)
}
```

Import `AGENT_STORAGE_KEY` from `./settings` or hardcode `'simpletools-agent'` to avoid cycles — prefer hardcoding DB name `'simpletools-agent'` and keep settings key separate.

IndexedDB test sketch:

```ts
/** @vitest-environment jsdom */
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { IndexedDBStore } from '../IndexedDBStore'

describe('IndexedDBStore', () => {
  it('persists threads and messages', async () => {
    const store = new IndexedDBStore('test')
    await store.upsertThread({
      id: 't1',
      title: 'A',
      createdAt: 1,
      updatedAt: 2,
    })
    await store.appendMessage({
      id: 'm1',
      threadId: 't1',
      role: 'user',
      content: 'hi',
      createdAt: 3,
      status: 'done',
    })
    expect((await store.listThreads())[0]?.title).toBe('A')
    expect((await store.getMessages('t1'))[0]?.content).toBe('hi')
    await store.deleteThread('t1')
    expect(await store.listThreads()).toHaveLength(0)
  })
})
```

- [ ] **Step 5: Barrel + Phase2 stub**

```ts
// src/agent/index.ts
export * from './types'
export { MemoryStore } from './MemoryStore'
export { IndexedDBStore, indexedDbStore } from './IndexedDBStore'
export { ToolRegistry } from './ToolRegistry'
export { ChatEngine, createChatClient, type ChatEngineOptions } from './ChatEngine'
export { parseSSEStream, mergeToolCallDeltas } from './sse'
export { parseToolArguments } from './parseToolArgs'
export { normalizeSecret } from './normalizeSecret'
export {
  AGENT_STORAGE_KEY,
  AGENT_SETTINGS_LS_KEY,
  DEFAULT_AGENT_MODEL,
  loadAgentSettings,
  saveAgentSettings,
  resolveAgentConfig,
  type PersistedAgentSettings,
} from './settings'
export { OpenAICompatProvider, isChatProviderId } from './providers'
export type { ChatProvider, ChatProviderId, OpenAICompatMessage } from './providers'
```

```md
<!-- src/agent/PHASE2_NANO.md -->
# Phase 2 — Chrome Built-in AI (Gemini Nano)

Out of scope for BYOK HostTool P1.

Planned reuse:
- `ChatProviderId = 'chrome-ai'`
- Port SimpleChat `ChromeAiProvider` into `src/agent/providers/ChromeAiProvider.ts`
- `ChatEngine.getProvider()` switches when `config.provider === 'chrome-ai'`
- Tools remain disabled on Nano (`supportsTools === false`), matching SimpleChat v1

No tasks in the P1 plan implement this file.
```

- [ ] **Step 6: Run tests + commit**

```bash
yarn test src/agent/__tests__/settings.test.ts src/agent/__tests__/IndexedDBStore.test.ts
git add package.json yarn.lock src/agent/IndexedDBStore.ts src/agent/settings.ts src/agent/index.ts src/agent/PHASE2_NANO.md src/agent/__tests__/settings.test.ts src/agent/__tests__/IndexedDBStore.test.ts
git commit -m "feat(agent): add IndexedDB history and localStorage settings"
```

---

### Task 6: HostTools — list_tools / open_tool / run_offline_tool (TDD)

**Files:**
- Create: `src/agent/hostTools/whitelist.ts`
- Create: `src/agent/hostTools/createHostTools.ts`
- Create: `src/agent/hostTools/index.ts`
- Create: `src/agent/__tests__/hostTools.test.ts`

**Interfaces:**
- Consumes: `HostTool` from types; `TOOLS` / `getTool` from `@/registry`; `analyzeText` from `@/tools/token-counter/logic`; `redactSecrets` from `@/tools/prompt-secret-redactor/logic`; Vue Router instance injected
- Produces: `createHostTools(deps): HostTool[]` with names `list_tools`, `open_tool`, `run_offline_tool`; `OFFLINE_TOOL_WHITELIST`

Design (exact):

```ts
// src/agent/hostTools/whitelist.ts
/** Only pure offline logic tools may be executed by the model in P1. */
export const OFFLINE_TOOL_WHITELIST = [
  'token-counter',
  'prompt-secret-redactor',
] as const

export type OfflineToolSlug = (typeof OFFLINE_TOOL_WHITELIST)[number]

export function isOfflineToolWhitelisted(slug: string): slug is OfflineToolSlug {
  return (OFFLINE_TOOL_WHITELIST as readonly string[]).includes(slug)
}
```

```ts
// src/agent/hostTools/createHostTools.ts
import type { Router } from 'vue-router'
import type { HostTool } from '../types'
import { TOOLS, getTool } from '@/registry'
import { isOfflineToolWhitelisted } from './whitelist'
import { analyzeText } from '@/tools/token-counter/logic'
import {
  DEFAULT_REDACT_OPTIONS,
  redactSecrets,
  type RedactOptions,
} from '@/tools/prompt-secret-redactor/logic'

export interface HostToolDeps {
  router: Router
  /** Localized name/description lookup */
  t: (key: string) => string
}

export function createHostTools(deps: HostToolDeps): HostTool[] {
  const list_tools: HostTool = {
    name: 'list_tools',
    description:
      'List SimpleTools offline toolbox entries (slug, category, name, description, keywords).',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category id filter (e.g. ai, developer, text)',
        },
        query: {
          type: 'string',
          description: 'Optional search string over slug/keywords/name',
        },
      },
    },
    handler: (args: { category?: string; query?: string }) => {
      let tools = TOOLS
      if (args.category) {
        tools = tools.filter((t) => t.category === args.category)
      }
      const q = (args.query ?? '').trim().toLowerCase()
      if (q) {
        tools = tools.filter((t) => {
          const name = deps.t(`tools.${t.slug}.name`).toLowerCase()
          const desc = deps.t(`tools.${t.slug}.description`).toLowerCase()
          const hay = [t.slug, t.category, ...t.keywords, name, desc].join(' ').toLowerCase()
          return hay.includes(q)
        })
      }
      return tools.map((t) => ({
        slug: t.slug,
        category: t.category,
        name: deps.t(`tools.${t.slug}.name`),
        description: deps.t(`tools.${t.slug}.description`),
        keywords: t.keywords,
        runnableOffline: isOfflineToolWhitelisted(t.slug),
      }))
    },
  }

  const open_tool: HostTool = {
    name: 'open_tool',
    description:
      'Navigate the SimpleTools UI to an offline tool page by slug (e.g. token-counter).',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Tool slug from list_tools' },
      },
      required: ['slug'],
    },
    handler: async (args: { slug: string }) => {
      const slug = String(args.slug || '').trim()
      if (!getTool(slug)) {
        return { ok: false, error: `Unknown tool slug: ${slug}` }
      }
      await deps.router.push({ name: 'tool', params: { slug } })
      return { ok: true, slug, path: `/tools/${slug}` }
    },
  }

  const run_offline_tool: HostTool = {
    name: 'run_offline_tool',
    description:
      'Run a whitelisted offline tool purely in-logic (no UI). P1 whitelist: token-counter, prompt-secret-redactor.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          enum: ['token-counter', 'prompt-secret-redactor'],
        },
        input: {
          type: 'object',
          description:
            'Tool-specific payload. token-counter: { text, family?, contextWindow? }. prompt-secret-redactor: { text, options? }.',
        },
      },
      required: ['slug', 'input'],
    },
    handler: (args: { slug: string; input: Record<string, unknown> }) => {
      const slug = String(args.slug || '').trim()
      if (!isOfflineToolWhitelisted(slug)) {
        return {
          ok: false,
          error: `Slug not in offline whitelist: ${slug}. Allowed: token-counter, prompt-secret-redactor`,
        }
      }
      const input = args.input ?? {}
      if (slug === 'token-counter') {
        const text = String(input.text ?? '')
        const family = (input.family as 'o200k' | 'cl100k' | 'claude' | 'gemini' | 'deepseek') || 'o200k'
        const contextWindow = Number(input.contextWindow ?? 128000) as 8000 | 32000 | 128000 | 200000
        return { ok: true, slug, result: analyzeText(text, family, contextWindow) }
      }
      if (slug === 'prompt-secret-redactor') {
        const text = String(input.text ?? '')
        const options = {
          ...DEFAULT_REDACT_OPTIONS,
          ...(input.options as Partial<RedactOptions> | undefined),
        }
        return { ok: true, slug, result: redactSecrets(text, options) }
      }
      return { ok: false, error: 'Unreachable' }
    },
  }

  return [list_tools, open_tool, run_offline_tool]
}
```

- [ ] **Step 1: Write failing hostTools test**

```ts
// src/agent/__tests__/hostTools.test.ts
import { describe, expect, it, vi } from 'vitest'
import { createHostTools } from '../hostTools/createHostTools'
import { OFFLINE_TOOL_WHITELIST } from '../hostTools/whitelist'

describe('createHostTools', () => {
  const router = { push: vi.fn().mockResolvedValue(undefined) }
  const t = (key: string) => key
  const tools = createHostTools({ router: router as never, t })
  const byName = Object.fromEntries(tools.map((x) => [x.name, x]))

  it('exposes the three P1 tools', () => {
    expect(Object.keys(byName).sort()).toEqual([
      'list_tools',
      'open_tool',
      'run_offline_tool',
    ])
    expect(OFFLINE_TOOL_WHITELIST).toContain('token-counter')
  })

  it('list_tools returns registry entries', async () => {
    const list = (await byName.list_tools!.handler({}, {
      threadId: 't',
      abortSignal: new AbortController().signal,
    })) as Array<{ slug: string }>
    expect(list.some((x) => x.slug === 'token-counter')).toBe(true)
  })

  it('open_tool navigates for known slug', async () => {
    const res = await byName.open_tool!.handler(
      { slug: 'token-counter' },
      { threadId: 't', abortSignal: new AbortController().signal },
    )
    expect(res).toMatchObject({ ok: true, slug: 'token-counter' })
    expect(router.push).toHaveBeenCalled()
  })

  it('run_offline_tool redacts secrets', async () => {
    const res = (await byName.run_offline_tool!.handler(
      {
        slug: 'prompt-secret-redactor',
        input: { text: 'key sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCD' },
      },
      { threadId: 't', abortSignal: new AbortController().signal },
    )) as { ok: boolean; result: { total: number } }
    expect(res.ok).toBe(true)
    expect(res.result.total).toBeGreaterThan(0)
  })

  it('run_offline_tool rejects non-whitelist', async () => {
    const res = (await byName.run_offline_tool!.handler(
      { slug: 'ffmpeg', input: {} },
      { threadId: 't', abortSignal: new AbortController().signal },
    )) as { ok: boolean }
    expect(res.ok).toBe(false)
  })
})
```

- [ ] **Step 2–4: Implement, pass tests, commit**

```bash
yarn test src/agent/__tests__/hostTools.test.ts
git add src/agent/hostTools src/agent/__tests__/hostTools.test.ts
git commit -m "feat(agent): add HostTools list_tools open_tool run_offline_tool"
```

Also re-export from `src/agent/index.ts`:

```ts
export { createHostTools, type HostToolDeps } from './hostTools'
export { OFFLINE_TOOL_WHITELIST, isOfflineToolWhitelisted } from './hostTools/whitelist'
```

---

### Task 7: Pinia agent store

**Files:**
- Create: `src/stores/agent.ts`

**Interfaces:**
- Consumes: `ChatEngine`, `indexedDbStore`, `resolveAgentConfig`, `saveAgentSettings`, `createHostTools`, `router`, `i18n`
- Produces: `useAgentStore()` with `init`, `threads`, `messages`, `streaming`, `error`, `settingsOpen`, `draftSettings`, `send`, `stop`, `newThread`, `selectThread`, `deleteThread`, `saveSettings`, `loadSettingsIntoDraft`

- [ ] **Step 1: Implement store**

```ts
// src/stores/agent.ts
import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  ChatEngine,
  createHostTools,
  indexedDbStore,
  loadAgentSettings,
  resolveAgentConfig,
  saveAgentSettings,
  type ChatMessage,
  type ChatThread,
  type PersistedAgentSettings,
} from '@/agent'

export const useAgentStore = defineStore('agent', () => {
  const router = useRouter()
  const { t } = useI18n()

  const engine = shallowRef<ChatEngine | null>(null)
  const threads = ref<ChatThread[]>([])
  const messages = ref<ChatMessage[]>([])
  const currentThreadId = ref<string | null>(null)
  const streaming = ref(false)
  const error = ref<string | null>(null)
  const settingsOpen = ref(false)
  const draftSettings = ref<PersistedAgentSettings>({
    apiBaseUrl: '',
    apiKey: '',
    model: '',
    systemPrompt: '',
    rememberKey: true,
  })
  const ready = ref(false)

  const currentTitle = computed(() => {
    return threads.value.find((x) => x.id === currentThreadId.value)?.title ?? ''
  })

  function ensureEngine(): ChatEngine {
    if (engine.value) return engine.value
    const store = indexedDbStore('simpletools-agent')
    const eng = new ChatEngine({
      config: resolveAgentConfig(),
      store,
    })
    for (const tool of createHostTools({ router, t: (k) => String(t(k)) })) {
      eng.registerTool(tool)
    }
    engine.value = eng
    return eng
  }

  async function refreshThreads(): Promise<void> {
    const eng = ensureEngine()
    threads.value = await eng.listThreads()
  }

  async function refreshMessages(): Promise<void> {
    const eng = ensureEngine()
    if (!eng.currentThreadId) {
      messages.value = []
      currentThreadId.value = null
      return
    }
    currentThreadId.value = eng.currentThreadId
    messages.value = await eng.getMessages(eng.currentThreadId)
  }

  async function init(): Promise<void> {
    if (ready.value) return
    const eng = ensureEngine()
    loadSettingsIntoDraft()
    eng.updateConfig(resolveAgentConfig())
    await refreshThreads()
    if (!threads.value.length) {
      await eng.createThread()
      await refreshThreads()
    } else {
      await eng.selectThread(threads.value[0]!.id)
    }
    await refreshMessages()
    ready.value = true
  }

  function loadSettingsIntoDraft(): void {
    const stored = loadAgentSettings()
    draftSettings.value = {
      apiBaseUrl: stored?.apiBaseUrl ?? '',
      apiKey: stored?.apiKey ?? '',
      model: stored?.model ?? '',
      systemPrompt: stored?.systemPrompt ?? '',
      rememberKey: stored?.rememberKey ?? true,
    }
  }

  function saveSettings(): void {
    saveAgentSettings({ ...draftSettings.value })
    ensureEngine().updateConfig(resolveAgentConfig(draftSettings.value))
    settingsOpen.value = false
  }

  async function newThread(): Promise<void> {
    const eng = ensureEngine()
    await eng.createThread()
    await refreshThreads()
    await refreshMessages()
  }

  async function selectThread(id: string): Promise<void> {
    const eng = ensureEngine()
    await eng.selectThread(id)
    await refreshMessages()
  }

  async function deleteThread(id: string): Promise<void> {
    const eng = ensureEngine()
    await eng.deleteThread(id)
    await refreshThreads()
    if (!threads.value.length) await newThread()
    else {
      await eng.selectThread(threads.value[0]!.id)
      await refreshMessages()
    }
  }

  async function send(text: string): Promise<void> {
    const eng = ensureEngine()
    const cfg = resolveAgentConfig()
    if (!cfg.apiBaseUrl || !cfg.apiKey || !cfg.model) {
      error.value = 'missing-settings'
      settingsOpen.value = true
      return
    }
    eng.updateConfig(cfg)
    streaming.value = true
    error.value = null
    try {
      for await (const ev of eng.send(text)) {
        if (ev.type === 'message' || ev.type === 'text-delta' || ev.type === 'done') {
          await refreshMessages()
        }
        if (ev.type === 'thread') await refreshThreads()
        if (ev.type === 'tool-result' || ev.type === 'tool-call') {
          await refreshMessages()
        }
        if (ev.type === 'error') {
          error.value = ev.error.message
        }
      }
    } finally {
      streaming.value = false
      await refreshThreads()
      await refreshMessages()
    }
  }

  function stop(): void {
    engine.value?.stop()
    streaming.value = false
  }

  return {
    ready,
    threads,
    messages,
    currentThreadId,
    currentTitle,
    streaming,
    error,
    settingsOpen,
    draftSettings,
    init,
    newThread,
    selectThread,
    deleteThread,
    send,
    stop,
    loadSettingsIntoDraft,
    saveSettings,
  }
})
```

Note: Pinia setup stores that call `useRouter`/`useI18n` must be first touched **inside** a component `setup` (AgentPage). Do not import-and-call at module top in `main.ts`.

- [ ] **Step 2: Manual typecheck**

Run: `yarn typecheck`
Expected: PASS (or only pre-existing unrelated errors)

- [ ] **Step 3: Commit**

```bash
git add src/stores/agent.ts
git commit -m "feat(agent): add Pinia agent store wiring ChatEngine"
```

---

### Task 8: Route, AppHeader entry, App layout, i18n

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/components/layout/AppHeader.vue`
- Modify: `src/App.vue`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Create: `src/pages/AgentPage.vue` (shell placeholder OK; full UI in Task 9)

**Interfaces:**
- Consumes: router patterns from existing `src/router/index.ts`
- Produces: named route `agent` at `/agent`; header link; i18n keys under `app.agent` and `agent.*`

- [ ] **Step 1: Add i18n keys (zh-CN)**

Insert into `zh-CN.ts` `app` object:

```ts
agent: 'Agent',
agentTitle: 'SimpleTools Agent',
```

Add sibling top-level key `agent:` (alongside `app`, `categories`, `common`, `tools`):

```ts
agent: {
  newChat: '新会话',
  threads: '会话',
  deleteThread: '删除会话',
  placeholder: '输入消息…（可让模型调用本机工具）',
  send: '发送',
  stop: '停止',
  settings: '模型设置',
  settingsTitle: 'BYOK 设置',
  settingsDesc: '密钥仅保存在本机 localStorage，不会上传到 SimpleTools 服务器。',
  apiBaseUrl: 'API Base URL',
  apiKey: 'API Key',
  model: '模型',
  systemPrompt: '系统提示',
  rememberKey: '在本机记住 API Key',
  save: '保存',
  cancel: '取消',
  empty: '发送一条消息开始对话。HostTools：list_tools / open_tool / run_offline_tool。',
  missingSettings: '请先配置 Base URL、API Key 与模型。',
  toolCall: '调用工具',
  toolResult: '工具结果',
  streaming: '生成中…',
  error: '出错了',
},
```

Mirror English in `en.ts`.

- [ ] **Step 2: Add route**

```ts
// in routes array of src/router/index.ts
{
  path: '/agent',
  name: 'agent',
  component: () => import('@/pages/AgentPage.vue'),
},
```

Update `router.afterEach`:

```ts
router.afterEach((to) => {
  const t = i18n.global.t
  if (to.name === 'tool') {
    const slug = String(to.params.slug)
    useUserStore().addRecent(slug)
    document.title = `${t(`tools.${slug}.name`)} · SimpleTools`
  } else if (to.name === 'agent') {
    document.title = `${t('app.agentTitle')} · SimpleTools`
  } else {
    document.title = 'SimpleTools'
  }
})
```

- [ ] **Step 3: AppHeader entry**

Import `Bot` from `lucide-vue-next`. Add before GitHub button:

```vue
<Button
  variant="ghost"
  size="sm"
  class="hidden sm:inline-flex"
  as-child
  data-testid="agent-entry"
>
  <RouterLink to="/agent" :aria-label="$t('app.agent')">
    <Bot />
    <span>{{ $t('app.agent') }}</span>
  </RouterLink>
</Button>
<Button
  variant="ghost"
  size="icon"
  class="sm:hidden"
  as-child
  data-testid="agent-entry-icon"
>
  <RouterLink to="/agent" :aria-label="$t('app.agent')">
    <Bot />
  </RouterLink>
</Button>
```

- [ ] **Step 4: App.vue full-bleed for agent**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useSettingsStore } from '@/stores/settings'

useSettingsStore()
const route = useRoute()
const isAgent = computed(() => route.name === 'agent')
</script>

<template>
  <div class="min-h-screen" :class="isAgent ? 'flex h-dvh flex-col overflow-hidden' : ''">
    <AppHeader />
    <main
      :class="
        isAgent
          ? 'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-0 sm:px-4'
          : 'mx-auto w-full max-w-6xl px-4 py-6'
      "
    >
      <RouterView />
    </main>
    <footer
      v-if="!isAgent"
      class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs"
    >
      {{ $t('app.privacy') }}
    </footer>
  </div>
</template>
```

- [ ] **Step 5: Minimal AgentPage shell**

```vue
<!-- src/pages/AgentPage.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agent = useAgentStore()
onMounted(() => {
  void agent.init()
})
</script>

<template>
  <div class="text-muted-foreground flex min-h-0 flex-1 items-center justify-center p-8 text-sm" data-testid="agent-page">
    {{ $t('agent.empty') }}
  </div>
</template>
```

- [ ] **Step 6: Commit**

```bash
git add src/router/index.ts src/components/layout/AppHeader.vue src/App.vue src/pages/AgentPage.vue src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts
git commit -m "feat(agent): add /agent route, header entry, and i18n"
```

---

### Task 9: Agent UI — thread list, messages, composer, settings

**Files:**
- Create: `src/components/agent/AgentThreadList.vue`
- Create: `src/components/agent/AgentMessageList.vue`
- Create: `src/components/agent/AgentMessage.vue`
- Create: `src/components/agent/AgentComposer.vue`
- Create: `src/components/agent/AgentSettingsDialog.vue`
- Create: `src/components/agent/AgentMarkdown.vue`
- Modify: `src/pages/AgentPage.vue` — compose full layout

**Interfaces:**
- Consumes: `useAgentStore`, shadcn `Button` `Dialog*` `Input` `Textarea` `Label` `Switch`, `marked`, `DOMPurify`
- Produces: Working chat chrome (left/right), settings dialog, markdown bubbles, tool call cards

- [ ] **Step 1: AgentMarkdown**

```vue
<!-- src/components/agent/AgentMarkdown.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{ content: string }>()
const marked = new Marked({ gfm: true, breaks: true })
const html = computed(() =>
  DOMPurify.sanitize(marked.parse(props.content || '') as string),
)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- sanitized with DOMPurify -->
  <div class="agent-md prose prose-neutral dark:prose-invert max-w-none text-sm" v-html="html" />
</template>
```

(If `prose` classes are unavailable without `@tailwindcss/typography`, use plain stacked styles: `space-y-2 [&_pre]:overflow-x-auto [&_code]:text-xs` — do **not** add a new dependency unless already present.)

- [ ] **Step 2: Thread list / message / composer / settings components**

`AgentThreadList.vue` sketch:

```vue
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/stores/agent'
import { cn } from '@/lib/utils'

const agent = useAgentStore()
</script>

<template>
  <aside class="flex h-full w-56 shrink-0 flex-col border-r sm:w-64">
    <div class="flex items-center gap-2 border-b p-2">
      <Button size="sm" class="w-full" data-testid="agent-new-thread" @click="agent.newThread()">
        <Plus /> {{ $t('agent.newChat') }}
      </Button>
    </div>
    <ul class="min-h-0 flex-1 overflow-y-auto p-2">
      <li v-for="th in agent.threads" :key="th.id" class="group mb-1 flex items-center gap-1">
        <button
          type="button"
          :class="
            cn(
              'hover:bg-accent flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm',
              th.id === agent.currentThreadId && 'bg-accent font-medium',
            )
          "
          @click="agent.selectThread(th.id)"
        >
          {{ th.title || $t('agent.newChat') }}
        </button>
        <Button
          variant="ghost"
          size="icon"
          class="size-7 opacity-0 group-hover:opacity-100"
          :aria-label="$t('agent.deleteThread')"
          @click="agent.deleteThread(th.id)"
        >
          <Trash2 class="size-3.5" />
        </Button>
      </li>
    </ul>
  </aside>
</template>
```

`AgentMessage.vue` — render role label; for assistant use `AgentMarkdown`; for `tool` role show muted JSON card; if `message.toolCalls` show each call name + arguments.

`AgentComposer.vue` — `Textarea` + Send/Stop; Enter-to-send (Shift+Enter newline); disable send when `streaming` or empty.

`AgentSettingsDialog.vue` — bind `agent.settingsOpen` with shadcn Dialog; fields: apiBaseUrl, apiKey (password input), model, systemPrompt, rememberKey Switch; Save calls `agent.saveSettings()`.

- [ ] **Step 3: Wire AgentPage layout**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { Settings } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/stores/agent'
import AgentThreadList from '@/components/agent/AgentThreadList.vue'
import AgentMessageList from '@/components/agent/AgentMessageList.vue'
import AgentComposer from '@/components/agent/AgentComposer.vue'
import AgentSettingsDialog from '@/components/agent/AgentSettingsDialog.vue'

const agent = useAgentStore()
onMounted(() => {
  void agent.init()
})
</script>

<template>
  <div class="bg-background flex min-h-0 flex-1 overflow-hidden rounded-none border-t sm:rounded-lg sm:border" data-testid="agent-page">
    <AgentThreadList />
    <section class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-12 items-center gap-2 border-b px-3">
        <h1 class="truncate text-sm font-semibold">{{ agent.currentTitle || $t('agent.newChat') }}</h1>
        <Button
          class="ml-auto"
          variant="ghost"
          size="icon"
          data-testid="agent-settings"
          :aria-label="$t('agent.settings')"
          @click="agent.settingsOpen = true"
        >
          <Settings />
        </Button>
      </header>
      <AgentMessageList />
      <p v-if="agent.error === 'missing-settings'" class="text-destructive px-3 text-xs">
        {{ $t('agent.missingSettings') }}
      </p>
      <p v-else-if="agent.error" class="text-destructive px-3 text-xs">{{ agent.error }}</p>
      <AgentComposer />
    </section>
    <AgentSettingsDialog />
  </div>
</template>
```

- [ ] **Step 4: Manual UI check**

Run: `yarn dev` → open `#/agent` (or `/agent` on web history) → new thread, open settings, save dummy values, confirm localStorage key `simpletools-agent:settings`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AgentPage.vue src/components/agent
git commit -m "feat(agent): add chat UI threads messages composer settings"
```

---

### Task 10: Chrome constraint docs + end-to-end verification

**Files:**
- Modify: `chrome-extension/README.md` (note only)
- Optionally modify: root `README.md` / `README_EN.md` — one short “Agent (BYOK)” bullet (keep offline brand clear)

**Chrome / fetch constraint (document, do not expand permissions in P1):**

1. **Web build:** Browser enforces CORS. User must point `apiBaseUrl` at an OpenAI-compatible endpoint that allows the SimpleTools origin (or use a local proxy). No manifest change.
2. **Chrome extension build (`chrome-extension/manifest.json`):** Currently `"permissions": []` and no `host_permissions`. Extension pages **cannot** `fetch` arbitrary HTTPS APIs without host permission. P1 leaves manifest unchanged; Agent settings UI should show a short warning when `import.meta.env.VITE_TARGET === 'chrome'` that BYOK may fail until a later release adds `optional_host_permissions` + `chrome.permissions.request` for the configured origin.
3. **Future (not this plan):** `optional_host_permissions: ["https://*/*"]` (or per-origin) requested only after user saves Base URL.

README snippet to append:

```md
## Agent（BYOK，实验）

应用内路由 `/agent` 提供自带密钥的 OpenAI 兼容对话，并可调用 HostTools 打开/运行白名单离线工具。
密钥仅存本机。Chrome 插件版暂未申请 host 权限，扩展内直连云端 API 可能失败；请优先用网页版或等待后续 optional host permissions。
```

- [ ] **Step 1: Update chrome-extension/README.md + root README brief note**

- [ ] **Step 2: Full test suite**

```bash
yarn test
yarn lint
```

Expected: all green (fix any Agent-related type/i18n MessageSchema breakage — zh-CN drives `MessageSchema`, so en must have the same `agent` key shape).

- [ ] **Step 3: Manual E2E checklist**

1. `/agent` loads from header.
2. Settings save → `localStorage['simpletools-agent:settings']` present.
3. With a real CORS-friendly endpoint: stream tokens appear; Stop aborts.
4. Prompt model to `list_tools` → tool card + result.
5. Prompt `open_tool` with `token-counter` → navigates to `/tools/token-counter`.
6. Prompt `run_offline_tool` for redactor → redacted text in tool result.
7. Refresh page → threads restored from IndexedDB.
8. Confirm chat is **not** listed as a registry tool card on Home.

- [ ] **Step 4: Commit**

```bash
git add chrome-extension/README.md README.md README_EN.md
git commit -m "docs(agent): note BYOK chrome host-permission constraint"
```

---

## Self-Review

### 1. Spec coverage

| Requirement | Task |
|-------------|------|
| Phase1 BYOK OpenAI-compat + HostTool | Tasks 3–7, 9 |
| Nano = Phase2 stub only | Task 5 `PHASE2_NANO.md` |
| Port engine into `src/agent/`, no element/Shadow DOM | Tasks 1–5 |
| shadcn-vue + B&W UI | Task 9 |
| Route `/agent` + AppHeader | Task 8 |
| Left threads / right messages+composer | Task 9 |
| HostTools `list_tools` / `open_tool` / `run_offline_tool` whitelist | Task 6 |
| Settings Dialog localStorage | Tasks 5, 7, 9 |
| Chrome permissions constraint documented, not expanded | Task 10 |
| Out of scope MCP/multimodal/tool-card | Global Constraints + File map |
| TDD for engine | Tasks 1–6 |
| Frequent commits | Every task Step commit |
| Commit author email | Global Constraints (`zhoulv2000@163.com`) |

### 2. Placeholder scan

No TBD / “implement later” / “similar to Task N” left in steps. Code sketches are concrete and match SimpleChat real APIs (`HostTool`, `ChatEngine.send`, `ToolRegistry.run`, `ChatEvent` union).

### 3. Type consistency

- Storage key: `simpletools-agent` / `simpletools-agent:settings`
- HostTool names: `list_tools`, `open_tool`, `run_offline_tool`
- Whitelist: `token-counter`, `prompt-secret-redactor`
- Pinia store id: `agent`
- Route name: `agent`, path `/agent`
- Provider P1: always `'openai'`

### Known follow-ups (not blockers)

- Other locales (ja/ko/de/fr/es/pt-BR) inherit English via `fallbackLocale: 'en'` until translated.
- Optional `scroll-area` / typography plugin not required.
- Expanding offline whitelist beyond two tools is a later change to `OFFLINE_TOOL_WHITELIST` + `run_offline_tool` switch.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-04-agent-byok-hosttools.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks (`superpowers:subagent-driven-development`)
2. **Inline Execution** — execute tasks in-session with `superpowers:executing-plans` and checkpoints

Which approach?
