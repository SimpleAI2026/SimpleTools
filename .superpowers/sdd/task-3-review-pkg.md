# Review package Task 3
BASE: fc661a4a5cf88c66fae6287aad7b12d2b0b00302
HEAD: 8dac1709ac875fb7a949487b0211cf5eff125984

## Commits
8dac170 feat(agent): add SSE parser and OpenAICompatProvider

## Stat
 src/agent/__tests__/OpenAICompatProvider.test.ts | 42 +++++++++++++
 src/agent/__tests__/sse.test.ts                  | 35 +++++++++++
 src/agent/__tests__/types.test.ts                |  2 +-
 src/agent/normalizeSecret.ts                     | 30 +++++++++
 src/agent/providers/OpenAICompatProvider.ts      | 70 +++++++++++++++++++++
 src/agent/providers/index.ts                     |  9 +++
 src/agent/providers/types.ts                     | 35 +++++++++++
 src/agent/sse.ts                                 | 77 ++++++++++++++++++++++++
 8 files changed, 299 insertions(+), 1 deletion(-)

## Diff
diff --git a/src/agent/__tests__/OpenAICompatProvider.test.ts b/src/agent/__tests__/OpenAICompatProvider.test.ts
new file mode 100644
index 0000000..410567e
--- /dev/null
+++ b/src/agent/__tests__/OpenAICompatProvider.test.ts
@@ -0,0 +1,42 @@
+import { describe, expect, it, vi } from 'vitest'
+import { OpenAICompatProvider } from '../providers/OpenAICompatProvider'
+
+function sseResponse(chunks: string[]): Response {
+  const enc = new TextEncoder()
+  const stream = new ReadableStream({
+    start(c) {
+      for (const x of chunks) c.enqueue(enc.encode(x))
+      c.close()
+    },
+  })
+  return new Response(stream, { status: 200 })
+}
+
+describe('OpenAICompatProvider', () => {
+  it('POSTs chat.completions and yields text-delta + finish', async () => {
+    const fetchImpl = vi.fn().mockResolvedValue(
+      sseResponse([
+        'data: {"choices":[{"delta":{"content":"A"},"finish_reason":null}]}\n\n',
+        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
+        'data: [DONE]\n\n',
+      ]),
+    )
+    const provider = new OpenAICompatProvider(fetchImpl as unknown as typeof fetch)
+    const events = []
+    for await (const ev of provider.stream({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'm',
+      },
+      messages: [{ role: 'user', content: 'hi' }],
+      tools: [],
+      signal: new AbortController().signal,
+    })) {
+      events.push(ev)
+    }
+    expect(events.some((e) => e.type === 'text-delta' && e.delta === 'A')).toBe(true)
+    expect(events.at(-1)).toEqual({ type: 'finish', finishReason: 'stop' })
+    expect(fetchImpl.mock.calls[0]?.[0]).toBe('https://api.example.com/v1/chat/completions')
+  })
+})
diff --git a/src/agent/__tests__/sse.test.ts b/src/agent/__tests__/sse.test.ts
new file mode 100644
index 0000000..1efa311
--- /dev/null
+++ b/src/agent/__tests__/sse.test.ts
@@ -0,0 +1,35 @@
+import { describe, expect, it } from 'vitest'
+import { mergeToolCallDeltas, parseSSEStream } from '../sse'
+
+function streamOf(text: string): ReadableStream<Uint8Array> {
+  const enc = new TextEncoder()
+  return new ReadableStream({
+    start(c) {
+      c.enqueue(enc.encode(text))
+      c.close()
+    },
+  })
+}
+
+describe('parseSSEStream', () => {
+  it('yields deltas until [DONE]', async () => {
+    const body = streamOf(
+      'data: {"choices":[{"delta":{"content":"Hi"},"finish_reason":null}]}\n\n' +
+        'data: [DONE]\n\n',
+    )
+    const chunks = []
+    for await (const c of parseSSEStream(body)) chunks.push(c)
+    expect(chunks[0]?.delta?.content).toBe('Hi')
+  })
+})
+
+describe('mergeToolCallDeltas', () => {
+  it('accumulates name and arguments by index', () => {
+    const acc = new Map()
+    mergeToolCallDeltas(acc, [
+      { index: 0, id: 'call_1', function: { name: 'list_', arguments: '' } },
+      { index: 0, function: { name: 'tools', arguments: '{}' } },
+    ])
+    expect(acc.get(0)).toEqual({ id: 'call_1', name: 'list_tools', arguments: '{}' })
+  })
+})
diff --git a/src/agent/__tests__/types.test.ts b/src/agent/__tests__/types.test.ts
index a407139..bb9eff9 100644
--- a/src/agent/__tests__/types.test.ts
+++ b/src/agent/__tests__/types.test.ts
@@ -1,12 +1,12 @@
 import { describe, expect, it } from 'vitest'
-import { chatCompletionsUrl, createId, normalizeBaseUrl } from '../types'
+import { chatCompletionsUrl, createId } from '../types'
 import { MemoryStore } from '../MemoryStore'
 
 describe('chatCompletionsUrl', () => {
   it('appends /chat/completions and strips trailing slash', () => {
     expect(chatCompletionsUrl('https://api.example.com/v1')).toBe(
       'https://api.example.com/v1/chat/completions',
     )
     expect(chatCompletionsUrl('https://api.example.com/v1/')).toBe(
       'https://api.example.com/v1/chat/completions',
     )
diff --git a/src/agent/normalizeSecret.ts b/src/agent/normalizeSecret.ts
new file mode 100644
index 0000000..653ba6a
--- /dev/null
+++ b/src/agent/normalizeSecret.ts
@@ -0,0 +1,30 @@
+/**
+ * When secret starts with `my-`, strip the prefix and Base64-decode
+ * (URL-safe alphabet + padding). On decode failure, fall back to the original.
+ */
+export function normalizeSecret(secret: unknown): string {
+  if (!secret) return ''
+  const s = String(secret).trim()
+  if (!s.startsWith('my-')) return s
+
+  const encoded = s.slice(3).replace(/\s+/g, '')
+  // URL-safe Base64 → standard
+  const urlsafe = encoded.replace(/-/g, '+').replace(/_/g, '/')
+  const padded = urlsafe + '='.repeat((4 - (urlsafe.length % 4)) % 4)
+
+  try {
+    if (typeof atob === 'function') {
+      return atob(padded)
+    }
+    const Buf = (globalThis as { Buffer?: { from(data: string, enc: string): { toString(enc: string): string } } })
+      .Buffer
+    if (Buf) {
+      return Buf.from(padded, 'base64').toString('utf-8')
+    }
+  } catch (e) {
+    console.warn('秘钥Base64解码失败，回退原值：', e)
+    return s
+  }
+
+  return s
+}
diff --git a/src/agent/providers/OpenAICompatProvider.ts b/src/agent/providers/OpenAICompatProvider.ts
new file mode 100644
index 0000000..d74e03c
--- /dev/null
+++ b/src/agent/providers/OpenAICompatProvider.ts
@@ -0,0 +1,70 @@
+import { chatCompletionsUrl } from '../types'
+import { normalizeSecret } from '../normalizeSecret'
+import { parseSSEStream } from '../sse'
+import type { ChatProvider, ProviderStreamEvent, ProviderStreamRequest } from './types'
+
+/**
+ * OpenAI-compatible Chat Completions (SSE streaming) provider.
+ * Extracted from the original ChatEngine fetch/SSE path.
+ */
+export class OpenAICompatProvider implements ChatProvider {
+  readonly id = 'openai' as const
+  readonly supportsTools = true
+
+  constructor(private fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis)) {}
+
+  async *stream(req: ProviderStreamRequest): AsyncGenerator<ProviderStreamEvent> {
+    const { config, messages, tools, signal } = req
+    const { apiBaseUrl, apiKey, model, temperature, maxTokens, headers } = config
+
+    if (!apiBaseUrl || !apiKey || !model) {
+      throw new Error('apiBaseUrl, apiKey, and model are required')
+    }
+
+    const body: Record<string, unknown> = {
+      model,
+      messages,
+      stream: true,
+    }
+    if (temperature != null) body.temperature = temperature
+    if (maxTokens != null) body.max_tokens = maxTokens
+    if (tools.length) {
+      body.tools = tools
+      body.tool_choice = 'auto'
+    }
+
+    const res = await this.fetchImpl(chatCompletionsUrl(apiBaseUrl), {
+      method: 'POST',
+      headers: {
+        'Content-Type': 'application/json',
+        Authorization: `Bearer ${normalizeSecret(apiKey)}`,
+        ...headers,
+      },
+      body: JSON.stringify(body),
+      signal,
+    })
+
+    if (!res.ok) {
+      const errText = await res.text().catch(() => res.statusText)
+      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 400)}`)
+    }
+    if (!res.body) throw new Error('No response body')
+
+    let finishReason: string | null = null
+
+    for await (const chunk of parseSSEStream(res.body, signal)) {
+      if (chunk.finish_reason) finishReason = chunk.finish_reason
+      const delta = chunk.delta
+      if (!delta) continue
+
+      if (delta.content) {
+        yield { type: 'text-delta', delta: delta.content }
+      }
+      if (delta.tool_calls?.length) {
+        yield { type: 'tool-call-deltas', deltas: delta.tool_calls }
+      }
+    }
+
+    yield { type: 'finish', finishReason }
+  }
+}
diff --git a/src/agent/providers/index.ts b/src/agent/providers/index.ts
new file mode 100644
index 0000000..1d88f6f
--- /dev/null
+++ b/src/agent/providers/index.ts
@@ -0,0 +1,9 @@
+export type {
+  ChatProvider,
+  ChatProviderId,
+  OpenAICompatMessage,
+  ProviderStreamEvent,
+  ProviderStreamRequest,
+} from './types'
+export { isChatProviderId } from './types'
+export { OpenAICompatProvider } from './OpenAICompatProvider'
diff --git a/src/agent/providers/types.ts b/src/agent/providers/types.ts
new file mode 100644
index 0000000..584becc
--- /dev/null
+++ b/src/agent/providers/types.ts
@@ -0,0 +1,35 @@
+import type { ChatProviderId, SimpleChatConfig } from '../types'
+import type { StreamDelta } from '../sse'
+
+export type { ChatProviderId }
+
+export type OpenAICompatMessage =
+  | { role: 'system' | 'user' | 'assistant'; content: string; tool_calls?: unknown[] }
+  | { role: 'tool'; content: string; tool_call_id: string }
+
+export interface ProviderStreamRequest {
+  config: SimpleChatConfig
+  messages: OpenAICompatMessage[]
+  /** OpenAI tools JSON; chrome-ai ignores (no tools on Nano in v1). */
+  tools: unknown[]
+  signal: AbortSignal
+}
+
+export type ProviderStreamEvent =
+  | { type: 'text-delta'; delta: string }
+  | {
+      type: 'tool-call-deltas'
+      deltas: NonNullable<StreamDelta['tool_calls']>
+    }
+  | { type: 'finish'; finishReason: string | null }
+
+export interface ChatProvider {
+  readonly id: ChatProviderId
+  /** Whether this provider can run OpenAI-style function tools. */
+  readonly supportsTools: boolean
+  stream(req: ProviderStreamRequest): AsyncGenerator<ProviderStreamEvent>
+}
+
+export function isChatProviderId(v: unknown): v is ChatProviderId {
+  return v === 'openai' || v === 'chrome-ai'
+}
diff --git a/src/agent/sse.ts b/src/agent/sse.ts
new file mode 100644
index 0000000..d56d602
--- /dev/null
+++ b/src/agent/sse.ts
@@ -0,0 +1,77 @@
+/** Parse SSE chunks from an OpenAI-compatible chat.completions stream. */
+
+export interface StreamDelta {
+  content?: string
+  tool_calls?: Array<{
+    index: number
+    id?: string
+    type?: string
+    function?: { name?: string; arguments?: string }
+  }>
+  finish_reason?: string | null
+}
+
+export async function* parseSSEStream(
+  body: ReadableStream<Uint8Array>,
+  signal?: AbortSignal,
+): AsyncGenerator<{ delta?: StreamDelta; finish_reason?: string | null; raw?: unknown }> {
+  const reader = body.getReader()
+  const decoder = new TextDecoder()
+  let buffer = ''
+
+  try {
+    while (true) {
+      if (signal?.aborted) break
+      const { done, value } = await reader.read()
+      if (done) break
+      buffer += decoder.decode(value, { stream: true })
+      const parts = buffer.split('\n')
+      buffer = parts.pop() ?? ''
+
+      for (const line of parts) {
+        const trimmed = line.trim()
+        if (!trimmed || trimmed.startsWith(':')) continue
+        if (!trimmed.startsWith('data:')) continue
+        const data = trimmed.slice(5).trim()
+        if (data === '[DONE]') return
+        try {
+          const json = JSON.parse(data)
+          const choice = json.choices?.[0]
+          yield {
+            delta: choice?.delta,
+            finish_reason: choice?.finish_reason ?? null,
+            raw: json,
+          }
+        } catch {
+          // ignore malformed chunks
+        }
+      }
+    }
+  } finally {
+    try {
+      reader.releaseLock()
+    } catch {
+      /* ignore */
+    }
+  }
+}
+
+export interface AccumulatedToolCall {
+  id: string
+  name: string
+  arguments: string
+}
+
+/** Merge incremental tool_calls deltas into a map keyed by index. */
+export function mergeToolCallDeltas(
+  acc: Map<number, AccumulatedToolCall>,
+  deltas: NonNullable<StreamDelta['tool_calls']>,
+): void {
+  for (const d of deltas) {
+    const existing = acc.get(d.index) ?? { id: '', name: '', arguments: '' }
+    if (d.id) existing.id = d.id
+    if (d.function?.name) existing.name += d.function.name
+    if (d.function?.arguments) existing.arguments += d.function.arguments
+    acc.set(d.index, existing)
+  }
+}
