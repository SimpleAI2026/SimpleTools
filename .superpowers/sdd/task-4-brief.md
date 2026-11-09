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

