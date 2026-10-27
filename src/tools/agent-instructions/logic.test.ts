import { describe, expect, it } from 'vitest'
import { defaultInstructionsInput, generateInstructions } from './logic'

describe('agent-instructions', () => {
  it('generates all targets with project name', () => {
    const input = defaultInstructionsInput()
    for (const target of ['agents', 'claude', 'cursor', 'windsurf'] as const) {
      const r = generateInstructions(input, target)
      expect(r.content).toContain(input.projectName)
      expect(r.filename.length).toBeGreaterThan(0)
      expect(r.content).toContain('vitest')
    }
  })

  it('bulletizes plain lines', () => {
    const input = { ...defaultInstructionsInput(), dos: 'Always run tests' }
    const r = generateInstructions(input, 'agents')
    expect(r.content).toContain('- Always run tests')
  })
})
