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
