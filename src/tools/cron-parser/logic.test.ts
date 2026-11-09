import { describe, expect, it } from 'vitest'
import { describeField, explainCron, nextRuns, normalizeCron } from './logic'

describe('cron-parser', () => {
  it('expands macros', () => expect(normalizeCron(' @daily ')).toBe('0 0 * * *'))
  it('computes next runs', () => {
    const runs = nextRuns('*/30 9 * * MON-FRI', 3, new Date('2026-10-17T00:00:00Z'), 'UTC')
    expect(runs.map((d) => d.toISOString())).toEqual(['2026-10-19T09:00:00.000Z', '2026-10-19T09:30:00.000Z', '2026-10-20T09:00:00.000Z'])
  })
  it('rejects invalid', () => expect(() => nextRuns('61 * * * *', 1)).toThrow())
  it('describes fields', () => {
    expect(describeField('*/15', 'minute', 'en')).toBe('every 15 minutes')
    expect(describeField('1-5', 'dow', 'zh')).toBe('周一 到 周五')
    expect(describeField('JAN,6', 'month', 'en')).toBe('Jan, Jun')
    expect(describeField('9-17/2', 'hour', 'zh')).toBe('9 到 17内每 2 小时')
    expect(explainCron('0 0 * * * *', 'en')).toHaveLength(6)
    expect(() => explainCron('* *', 'en')).toThrow()
  })
})
