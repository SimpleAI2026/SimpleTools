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
