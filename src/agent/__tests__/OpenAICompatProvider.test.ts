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
    expect(fetchImpl.mock.calls[0]?.[0]).toBe('https://api.example.com/v1/chat/completions')
  })
})
