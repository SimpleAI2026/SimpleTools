import { describe, expect, it } from 'vitest'
import { buildCron, everyField, fieldToCron, parseCron, previewCron } from './logic'

describe('crontab-generator', () => {
  it('renders every field mode', () => {
    expect(fieldToCron({ mode: 'every', values: [], from: 0, to: 0, step: 1 }, 'minute')).toBe('*')
    expect(fieldToCron({ mode: 'list', values: [5, 1, 5, 99], from: 0, to: 0, step: 1 }, 'minute')).toBe('1,5')
    expect(fieldToCron({ mode: 'list', values: [], from: 0, to: 0, step: 1 }, 'hour')).toBe('*')
    expect(fieldToCron({ mode: 'range', values: [], from: 9, to: 17, step: 1 }, 'hour')).toBe('9-17')
    expect(fieldToCron({ mode: 'range', values: [], from: 5, to: 1, step: 1 }, 'dow')).toBe('1-5')
    expect(fieldToCron({ mode: 'step', values: [], from: 0, to: 0, step: 15 }, 'minute')).toBe('*/15')
  })

  it('builds an expression that cron-parser can schedule', () => {
    const fields = {
      minute: { mode: 'list' as const, values: [0], from: 0, to: 0, step: 1 },
      hour: { mode: 'range' as const, values: [], from: 9, to: 17, step: 1 },
      dom: everyField(),
      month: everyField(),
      dow: { mode: 'range' as const, values: [], from: 1, to: 5, step: 1 },
    }
    const expr = buildCron(fields)
    expect(expr).toBe('0 9-17 * * 1-5')
    const runs = previewCron(expr, 3, new Date('2026-01-05T08:00:00Z'))
    expect(runs).toHaveLength(3)
    expect(runs[0]?.getTime()).toBeGreaterThan(Date.parse('2026-01-05T08:00:00Z'))
    expect(buildCron(parseCron(expr) as typeof fields)).toBe(expr)
    expect(parseCron('* * *')).toBeNull()
  })
})
