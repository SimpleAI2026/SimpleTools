import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatEngine } from '../ChatEngine'
import { MemoryStore } from '../MemoryStore'
import type { ChatEvent } from '../types'

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

  it('yields thread event when title updates on send', async () => {
    fetchMock.mockResolvedValue(
      streamResponse([
        sseChunk({ choices: [{ delta: { content: 'ok' }, finish_reason: null }] }),
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

    const types: string[] = []
    let threadTitle = ''
    for await (const ev of engine.send('hello there')) {
      types.push(ev.type)
      if (ev.type === 'thread') threadTitle = ev.thread.title
    }

    expect(types).toContain('thread')
    expect(types.indexOf('thread')).toBeGreaterThan(types.indexOf('message'))
    expect(threadTitle.startsWith('hello there')).toBe(true)
  })

  it('yields Aborted error when stop() aborts in-flight send', async () => {
    let release!: () => void
    const gate = new Promise<void>((r) => {
      release = r
    })
    let fetchStarted!: () => void
    const fetchStartedP = new Promise<void>((r) => {
      fetchStarted = r
    })

    fetchMock.mockImplementation(async (_url: unknown, init?: RequestInit) => {
      fetchStarted()
      await gate
      if (init?.signal?.aborted) {
        const err = new Error('The operation was aborted')
        err.name = 'AbortError'
        throw err
      }
      return streamResponse([
        sseChunk({ choices: [{ delta: { content: 'late' }, finish_reason: null }] }),
        sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
        'data: [DONE]\n\n',
      ])
    })

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

    const eventsPromise = (async () => {
      const collected: ChatEvent[] = []
      for await (const ev of engine.send('abort me')) {
        collected.push(ev)
      }
      return collected
    })()

    await fetchStartedP
    engine.stop()
    release()

    const collected = await eventsPromise
    const errEv = collected.find((e) => e.type === 'error')
    expect(errEv).toBeTruthy()
    expect(errEv && errEv.type === 'error' ? errEv.error.message : '').toBe('Aborted')

    const threadId = engine.currentThreadId
    expect(threadId).toBeTruthy()
    const msgs = await engine.getMessages(threadId!)
    const assistant = msgs.filter((m) => m.role === 'assistant').at(-1)
    expect(assistant).toBeTruthy()
    // Must leave streaming so UI does not show "生成中" forever.
    expect(assistant?.status).toBe('done')
  })
})

describe('multimodal attachments (Phase A)', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
  })

  function okStream() {
    return streamResponse([
      sseChunk({ choices: [{ delta: { content: 'seen' }, finish_reason: 'stop' }] }),
      'data: [DONE]\n\n',
    ])
  }

  it('toOpenAIMessages: string-only legacy messages stay string content', async () => {
    fetchMock.mockResolvedValue(okStream())
    const store = new MemoryStore()
    const engine = new ChatEngine({
      config: { apiBaseUrl: 'https://api.example.com/v1', apiKey: 'sk', model: 'm' },
      store,
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    for await (const ev of engine.send('hello only')) {
      void ev
    }
    const thread = (await engine.listThreads())[0]!
    const msgs = await engine.getMessages(thread.id)
    const wire = engine.toOpenAIMessagesPublic(msgs)
    const user = wire.find((m) => m.role === 'user')
    expect(user && typeof user.content === 'string').toBe(true)
    expect(user && (user as { content: string }).content).toBe('hello only')
  })

  it('toOpenAIMessages: parts produce image_url array content', async () => {
    fetchMock.mockResolvedValue(okStream())
    const store = new MemoryStore()
    const engine = new ChatEngine({
      config: { apiBaseUrl: 'https://api.example.com/v1', apiKey: 'sk', model: 'm' },
      store,
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    for await (const ev of engine.send('what is this?', {
      attachments: [
        {
          url: 'data:image/png;base64,abc',
          mime: 'image/png',
          name: 'a.png',
          detail: 'auto',
        },
      ],
    })) {
      void ev
    }
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body as string)
    const user = body.messages.find((m: { role: string }) => m.role === 'user')
    expect(Array.isArray(user.content)).toBe(true)
    expect(user.content[0]).toEqual({ type: 'text', text: 'what is this?' })
    expect(user.content[1]).toEqual({
      type: 'image_url',
      image_url: { url: 'data:image/png;base64,abc', detail: 'auto' },
    })
  })

  it('send: image-only uses [image] placeholder and stores parts', async () => {
    fetchMock.mockResolvedValue(okStream())
    const store = new MemoryStore()
    const engine = new ChatEngine({
      config: { apiBaseUrl: 'https://api.example.com/v1', apiKey: 'sk', model: 'm' },
      store,
      fetchImpl: fetchMock as unknown as typeof fetch,
    })
    for await (const ev of engine.send('', {
      attachments: [{ url: 'data:image/jpeg;base64,xx', name: 'x.jpg', mime: 'image/jpeg' }],
    })) {
      void ev
    }
    const thread = (await engine.listThreads())[0]!
    const msgs = await engine.getMessages(thread.id)
    const user = msgs.find((m) => m.role === 'user')!
    expect(user.parts?.length).toBe(2)
    expect(user.parts?.[0]).toEqual({ type: 'text', text: '[image]' })
    expect(user.content).toContain('x.jpg')
    const body = JSON.parse(fetchMock.mock.calls[0]![1].body as string)
    const wireUser = body.messages.find((m: { role: string }) => m.role === 'user')
    expect(wireUser.content.some((p: { type: string }) => p.type === 'image_url')).toBe(true)
  })
})

