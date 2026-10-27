import { describe, expect, it } from 'vitest'
import { ALL_CURSORS, cursorCss } from './logic'

describe('css-cursor', () => {
  it('lists unique cursors', () => {
    expect(new Set(ALL_CURSORS).size).toBe(ALL_CURSORS.length)
    expect(ALL_CURSORS).toContain('pointer')
  })
  it('builds css', () => {
    expect(cursorCss('pointer')).toBe('cursor: pointer;')
    expect(cursorCss('auto', { url: 'c.png', x: 4.4, y: 2 })).toBe('cursor: url("c.png") 4 2, auto;')
    expect(cursorCss('auto', { url: 'c.png' })).toBe('cursor: url("c.png"), auto;')
  })
})
