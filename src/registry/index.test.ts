import { describe, expect, it } from 'vitest'
import { CATEGORIES, getTool, searchTools, TOOLS, toolsInCategory } from './index'
import zhCN from '@/i18n/locales/zh-CN'
import { TOOL_MESSAGES } from '@/i18n'

describe('registry', () => {
  it('has unique tools, each with a valid category and translations', () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(10)
    expect(new Set(TOOLS.map((t) => t.slug)).size).toBe(TOOLS.length)
    for (const t of TOOLS) {
      expect(CATEGORIES).toContain(t.category)
      expect(t.slug in zhCN.tools || t.slug in TOOL_MESSAGES, t.slug).toBe(true)
    }
  })
  it('looks up and filters', () => {
    expect(getTool('base64')?.category).toBe('encode')
    expect(getTool('nope')).toBeUndefined()
    expect(toolsInCategory('generate').map((t) => t.slug)).toContain('uuid-generator')
  })
  it('searches by keyword and localized name', () => {
    const names = (t: { slug: string }) => [String((zhCN.tools as Record<string, { name: string }>)[t.slug]?.name ?? '')]
    expect(searchTools('sha', names).map((t) => t.slug)).toContain('hash-generator')
    expect(searchTools('时间戳', names).map((t) => t.slug)).toEqual(['timestamp-converter'])
    expect(searchTools('  ', names)).toHaveLength(TOOLS.length)
    expect(searchTools('zzzz', names)).toHaveLength(0)
  })
})
