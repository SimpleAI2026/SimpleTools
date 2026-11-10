import { describe, expect, it } from 'vitest'
import { present, run, SAMPLE } from './logic'

describe('redirect-migration-planner', () => {
  it('finds cycles, chains, and unknown statuses', () => {
    const packed = JSON.stringify(run(SAMPLE).json)
    expect(packed).toContain('cycle')
    expect(packed).toContain('chain')
    expect(packed).toContain('unknown-status')
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('redirect-map.csv')
  })

  it('exports the original deployment mapping separately from issues', () => {
    const result = run('from,to,status\nhttps://ex.com/a,https://ex.com/b,301\n')
    expect(result.files[0]!.text).toContain('https://ex.com/a,https://ex.com/b,301')
    expect((result.json as { result: { issues: unknown[] } }).result.issues).toEqual([])
  })

  it('detects self cycles and conflicting targets', () => {
    const packed = JSON.stringify(run(JSON.stringify({ rows: [
      { from: 'a', to: 'a', status: '301' },
      { from: 'b', to: 'c', status: '301' },
      { from: 'b', to: 'd', status: '301' },
    ] })).json)
    expect(packed).toContain('cycle')
    expect(packed).toContain('conflict')
    expect(present('').error).toBe('empty')
  })
})
