import { describe, expect, it } from 'vitest'
import { boxShadowCss, boxShadowValue, defaultLayer, SHADOW_PRESETS } from './logic'

describe('box-shadow-generator', () => {
  it('single layer', () => {
    expect(boxShadowCss([defaultLayer()])).toBe('box-shadow: 0 8px 24px -4px rgb(0 0 0 / 25%);')
    expect(boxShadowValue([{ ...defaultLayer(), inset: true, opacity: 1, color: '#FFF000' }])).toBe('inset 0 8px 24px -4px #fff000')
  })
  it('multiple and none', () => {
    expect(boxShadowCss(SHADOW_PRESETS.layered!).split('\n')).toHaveLength(4)
    expect(boxShadowValue([])).toBe('none')
  })
})
