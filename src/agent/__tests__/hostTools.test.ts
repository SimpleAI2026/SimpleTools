import { describe, expect, it, vi } from 'vitest'
import { createHostTools } from '../hostTools/createHostTools'
import { OFFLINE_TOOL_WHITELIST } from '../hostTools/whitelist'
import * as tokenCounterLogic from '@/tools/token-counter/logic'
import * as secretRedactorLogic from '@/tools/prompt-secret-redactor/logic'

describe('createHostTools', () => {
  const router = { push: vi.fn().mockResolvedValue(undefined) }
  const t = (key: string) => key
  const tools = createHostTools({ router: router as never, t })
  const byName = Object.fromEntries(tools.map((x) => [x.name, x]))
  const ctx = { threadId: 't', abortSignal: new AbortController().signal }

  it('exposes the three P1 tools', () => {
    expect(Object.keys(byName).sort()).toEqual([
      'list_tools',
      'open_tool',
      'run_offline_tool',
    ])
    expect([...OFFLINE_TOOL_WHITELIST]).toEqual([
      'token-counter',
      'prompt-secret-redactor',
    ])
  })

  it('list_tools returns registry entries', async () => {
    const list = (await byName.list_tools!.handler({}, ctx)) as Array<{ slug: string }>
    expect(list.some((x) => x.slug === 'token-counter')).toBe(true)
  })

  it('open_tool navigates for known slug', async () => {
    router.push.mockClear()
    const res = await byName.open_tool!.handler({ slug: 'token-counter' }, ctx)
    expect(res).toMatchObject({ ok: true, slug: 'token-counter' })
    expect(router.push).toHaveBeenCalled()
  })

  it('open_tool rejects unknown slug without navigating or running offline logic', async () => {
    router.push.mockClear()
    const analyzeSpy = vi.spyOn(tokenCounterLogic, 'analyzeText')
    const redactSpy = vi.spyOn(secretRedactorLogic, 'redactSecrets')
    try {
      const res = (await byName.open_tool!.handler(
        { slug: 'definitely-unknown-slug-xyz' },
        ctx,
      )) as { ok: boolean; error?: string }
      expect(res.ok).toBe(false)
      expect(res.error).toMatch(/unknown/i)
      expect(router.push).not.toHaveBeenCalled()
      expect(analyzeSpy).not.toHaveBeenCalled()
      expect(redactSpy).not.toHaveBeenCalled()
    } finally {
      analyzeSpy.mockRestore()
      redactSpy.mockRestore()
    }
  })

  it('run_offline_tool redacts secrets', async () => {
    const res = (await byName.run_offline_tool!.handler(
      {
        slug: 'prompt-secret-redactor',
        input: { text: 'key sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCD' },
      },
      ctx,
    )) as { ok: boolean; result: { total: number } }
    expect(res.ok).toBe(true)
    expect(res.result.total).toBeGreaterThan(0)
  })

  it('run_offline_tool token-counter analyzes text', async () => {
    const res = (await byName.run_offline_tool!.handler(
      {
        slug: 'token-counter',
        input: { text: 'hello world', family: 'o200k', contextWindow: 128000 },
      },
      ctx,
    )) as {
      ok: boolean
      slug: string
      result: { tokens: number; chars: number; words: number; accurate: boolean; contextWindow: number }
    }
    expect(res.ok).toBe(true)
    expect(res.slug).toBe('token-counter')
    expect(res.result.tokens).toBeGreaterThan(0)
    expect(res.result.chars).toBeGreaterThan(0)
    expect(res.result.words).toBeGreaterThan(0)
    expect(res.result.accurate).toBe(true)
    expect(res.result.contextWindow).toBe(128000)
  })

  it('run_offline_tool rejects non-whitelist', async () => {
    const res = (await byName.run_offline_tool!.handler(
      { slug: 'ffmpeg', input: {} },
      ctx,
    )) as { ok: boolean }
    expect(res.ok).toBe(false)
  })
})
