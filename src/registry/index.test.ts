import { describe, expect, it, vi } from 'vitest'
import { CATEGORIES, getTool, searchTools, TOOLS, toolsInCategory } from './index'
import zhCN from '@/i18n/locales/zh-CN'
import { TOOL_MESSAGES } from '@/i18n'
import { PROGRAMMING_MESSAGES } from '@/i18n/programming'
import { PROGRAMMING_ROUTES, programmingRoute } from './tools/programming'

describe('registry', () => {
  it('has unique tools, each with a valid category and translations', () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(10)
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length)
    for (const t of TOOLS) {
      expect(CATEGORIES).toContain(t.category)
      expect(t.slug in zhCN.tools || t.slug in TOOL_MESSAGES || t.slug in PROGRAMMING_MESSAGES, t.slug).toBe(true)
    }
  })
  it('splits audio and video from images without changing tool slugs', () => {
    expect(CATEGORIES).toContain('audiovisual')
    for (const slug of ['ffmpeg', 'subtitle-toolkit', 'video-delivery-preflight']) {
      expect(getTool(slug)?.slug).toBe(slug)
      expect(getTool(slug)?.category).toBe('audiovisual')
    }
    expect(getTool('image-editor')?.category).toBe('media')
    expect(getTool('audio-level-auditor')).toBeUndefined()
    expect(getTool('visual-selects-board')).toBeUndefined()
  })
  it('looks up and filters', () => {
    expect(getTool('base64')?.category).toBe('encode')
    expect(getTool('nope')).toBeUndefined()
    expect(toolsInCategory('generate').map((t) => t.slug)).toContain('uuid-generator')
  })
  it('registers one fixed-language tool per SimpleCode route', () => {
    expect(CATEGORIES).toContain('programming')
    expect(toolsInCategory('programming').map((tool) => tool.slug)).toEqual(PROGRAMMING_ROUTES.map((route) => route.slug))
    expect(PROGRAMMING_ROUTES).toHaveLength(15)
    expect(getTool('code-playground')).toBeUndefined()
    expect(getTool('code-javascript')?.keywords).toContain('javascript')
    expect(getTool('code-rust')?.keywords).toContain('rust')
    expect(programmingRoute('code-javascript')).toMatchObject({ runtime: 'quickjs', dialect: 'js' })
    expect(programmingRoute('code-typescript')).toMatchObject({ runtime: 'quickjs', dialect: 'ts' })
    expect(programmingRoute('code-python')).toMatchObject({ runtime: 'python', extension: false })
    expect(programmingRoute('code-playground')).toBeUndefined()
  })
  it('limits extension builds to the six whitelisted language cards', async () => {
    vi.stubEnv('VITE_ENABLE_ALL_CODE_RUNTIMES', 'false')
    vi.resetModules()
    try {
      const routes = await import('./tools/programming')
      expect(routes.AVAILABLE_PROGRAMMING_ROUTES.map((route) => route.slug)).toEqual([
        'code-javascript', 'code-typescript', 'code-sqlite', 'code-lua', 'code-shell', 'code-java',
      ])
      expect(routes.programmingRoute('code-python')).toBeUndefined()
      expect(routes.default.map((tool) => tool.slug)).toEqual(routes.AVAILABLE_PROGRAMMING_ROUTES.map((route) => route.slug))
    } finally {
      vi.unstubAllEnvs()
      vi.resetModules()
    }
  })
  it('searches by keyword and localized name', () => {
    const names = (t: { slug: string }) => [String((zhCN.tools as Record<string, { name: string }>)[t.slug]?.name ?? '')]
    expect(searchTools('sha', names).map((t) => t.slug)).toContain('hash-generator')
    expect(searchTools('时间戳', names).map((t) => t.slug)).toEqual(['timestamp-converter'])
    expect(searchTools('  ', names)).toHaveLength(TOOLS.length)
    expect(searchTools('zzzz', names)).toHaveLength(0)
  })
})
