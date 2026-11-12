import { describe, expect, it } from 'vitest'
import { placeholderSvg, safeColor } from './logic'

describe('svg-placeholder-generator', () => {
  it('builds an escaped svg and a data url', () => {
    const result = placeholderSvg({ width: 320, height: 180, background: 'red', foreground: '#fff', text: 'A & B' })
    expect(result.svg).toContain('width="320"')
    expect(result.svg).toContain('A &amp; B')
    expect(result.svg).toContain('fill="#e5e7eb"')
    expect(result.svg).toContain('fill="#fff"')
    expect(result.dataUrl.startsWith('data:image/svg+xml')).toBe(true)
    expect(safeColor('#abc', '#000')).toBe('#abc')
  })
})
