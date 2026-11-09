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

