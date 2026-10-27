import { describe, expect, it } from 'vitest'
import { describeDate, detectUnit, parseDateString, parseTimestamp, relativeTime } from './logic'

describe('timestamp-converter', () => {
  it('detects unit', () => {
    expect(detectUnit('1700000000')).toBe('seconds')
    expect(detectUnit('1700000000000')).toBe('milliseconds')
  })
  it('parses timestamps', () => {
    expect(parseTimestamp('0')?.toISOString()).toBe('1970-01-01T00:00:00.000Z')
    expect(parseTimestamp('1700000000')?.toISOString()).toBe('2023-11-14T22:13:20.000Z')
    expect(parseTimestamp('1700000000000')?.toISOString()).toBe('2023-11-14T22:13:20.000Z')
    expect(parseTimestamp('1700000000', 'milliseconds')?.toISOString()).toBe('1970-01-20T16:13:20.000Z')
    expect(parseTimestamp('abc')).toBeNull()
    expect(parseTimestamp('99999999999999999999')).toBeNull()
  })
  it('parses date strings', () => {
    expect(parseDateString('2024-01-02T03:04:05Z')?.getTime()).toBe(1704164645000)
    expect(parseDateString('nope')).toBeNull()
    expect(parseDateString('')).toBeNull()
  })
  it('describes a date in a time zone', () => {
    const d = new Date('2024-01-02T03:04:05Z')
    const v = describeDate(d, 'en-US', 'Asia/Shanghai', new Date('2024-01-02T03:04:15Z'))
    expect(v.seconds).toBe(1704164645)
    expect(v.iso).toBe('2024-01-02T03:04:05.000Z')
    expect(v.local).toContain('11:04:05')
    expect(v.utc).toContain('3:04:05')
    expect(v.relative).toBe('10 seconds ago')
  })
  it('relative time in Chinese', () => {
    expect(relativeTime(new Date(0), new Date(2 * 86400 * 1000), 'zh-CN')).toBe('前天')
  })
})
