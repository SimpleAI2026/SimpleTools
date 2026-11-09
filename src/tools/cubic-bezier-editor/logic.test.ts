import { describe, expect, it } from 'vitest'
import { bezierAt, bezierPoint, formatBezier, parseBezier } from './logic'

describe('cubic-bezier-editor', () => {
  it('formats', () => {
    expect(formatBezier([0.25, 0.1, 0.25, 1])).toBe('ease')
    expect(formatBezier([0.42, 0, 0.58, 1])).toBe('ease-in-out')
    expect(formatBezier([0.123, 1.5, 0.3, 1])).toBe('cubic-bezier(0.12, 1.5, 0.3, 1)')
  })
  it('parses', () => {
    expect(parseBezier('ease-in')).toEqual([0.42, 0, 1, 1])
    expect(parseBezier('cubic-bezier(.1, -0.5, .9, 1.4)')).toEqual([0.1, -0.5, 0.9, 1.4])
    expect(parseBezier('1.2,0,0,1')).toBeNull()
    expect(parseBezier('nope')).toBeNull()
  })
  it('evaluates', () => {
    expect(bezierPoint([0, 0, 1, 1], 0.5)).toEqual([0.5, 0.5])
    expect(bezierAt([0, 0, 1, 1], 0.3)).toBeCloseTo(0.3, 5)
    expect(bezierAt([0.42, 0, 1, 1], 0.5)).toBeLessThan(0.5)
  })
})
