import { describe, expect, it } from 'vitest'
import { searchStatuses, statusClass, STATUSES } from './logic'

describe('http-status', () => {
  it('has unique codes', () => {
    expect(new Set(STATUSES.map((s) => s.code)).size).toBe(STATUSES.length)
  })
  it('searches', () => {
    expect(searchStatuses('404').map((s) => s.code)).toEqual([404])
    expect(searchStatuses('teapot')[0]?.code).toBe(418)
    expect(searchStatuses('重定向').length).toBeGreaterThanOrEqual(4)
    expect(searchStatuses('5xx').every((s) => statusClass(s.code) === '5xx')).toBe(true)
    expect(searchStatuses('')).toHaveLength(STATUSES.length)
  })
})
