import { describe, expect, it } from 'vitest'
import { convertToolJson, exportTool, sampleTool, validateToolName } from './logic'

describe('agent-tool-def', () => {
  it('validates names', () => {
    expect(validateToolName('get_weather')).toBeNull()
    expect(validateToolName('')).toBe('empty')
    expect(validateToolName('bad name')).toBe('pattern')
  })

  it('exports mcp / openai / anthropic shapes', () => {
    const s = sampleTool()
    const mcp = JSON.parse(exportTool(s, 'mcp')) as { inputSchema: { required: string[] } }
    const oa = JSON.parse(exportTool(s, 'openai')) as { type: string; function: { name: string } }
    const an = JSON.parse(exportTool(s, 'anthropic')) as { input_schema: { type: string } }
    expect(mcp.inputSchema.required).toContain('city')
    expect(oa.type).toBe('function')
    expect(oa.function.name).toBe('get_weather')
    expect(an.input_schema.type).toBe('object')
  })

  it('converts between formats', () => {
    const openai = exportTool(sampleTool(), 'openai')
    const c = convertToolJson(openai)
    expect(c.source).toBe('openai')
    expect(JSON.parse(c.mcp).name).toBe('get_weather')
    expect(JSON.parse(c.anthropic).input_schema).toBeTruthy()
  })
})
