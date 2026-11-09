import { describe, expect, it } from 'vitest'
import { prepareSvg, svgSize } from './logic'

describe('svg-to-png', () => {
  it('reads size', () => {
    expect(svgSize('<svg width="24" height="12px">')).toEqual({ width: 24, height: 12 })
    expect(svgSize('<svg viewBox="0 0 100 50">')).toEqual({ width: 100, height: 50 })
    expect(svgSize('<svg width="1in" viewBox="0 0 2 1">')).toEqual({ width: 96, height: 48 })
    expect(svgSize('<svg width="100%">')).toEqual({ width: 300, height: 150 })
    expect(() => svgSize('<div/>')).toThrow()
  })
  it('prepares', () => {
    expect(prepareSvg('<svg width="1" viewBox="0 0 1 1"><g/></svg>', 64, 64)).toBe('<svg viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" width="64" height="64"><g/></svg>')
  })
})
