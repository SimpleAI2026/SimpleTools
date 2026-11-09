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
      handler: (args) => ({ text: String((args as { text?: string }).text ?? '') }),
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
