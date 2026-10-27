import { describe, expect, it } from 'vitest'
import { buildMcpConfig, emptyFormServer, validateMcpJson } from './logic'

describe('mcp-config-builder', () => {
  it('builds stdio config JSON', () => {
    const s = emptyFormServer()
    s.name = 'memory'
    const json = buildMcpConfig([s])
    const parsed = JSON.parse(json) as { mcpServers: Record<string, { command: string; args?: string[] }> }
    expect(parsed.mcpServers.memory?.command).toBe('npx')
    expect(parsed.mcpServers.memory?.args?.[0]).toBe('-y')
  })

  it('builds url config', () => {
    const s = emptyFormServer()
    s.name = 'remote'
    s.transport = 'url'
    s.url = 'https://example.com/mcp'
    s.headersText = 'Authorization=Bearer x'
    const parsed = JSON.parse(buildMcpConfig([s])) as { mcpServers: Record<string, { url: string; headers?: Record<string, string> }> }
    expect(parsed.mcpServers.remote?.url).toBe('https://example.com/mcp')
    expect(parsed.mcpServers.remote?.headers?.Authorization).toBe('Bearer x')
  })

  it('validates good and bad JSON', () => {
    expect(validateMcpJson('{"mcpServers":{"a":{"command":"node","args":["x.js"]}}}')).toEqual([])
    expect(validateMcpJson('{').length).toBeGreaterThan(0)
    expect(validateMcpJson('{"mcpServers":{"a":{}}}').some((i) => i.path.includes('a'))).toBe(true)
    expect(validateMcpJson('{"mcpServers":{"a":{"command":"x","url":"https://a.com"}}}').length).toBeGreaterThan(0)
  })
})
