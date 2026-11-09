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
