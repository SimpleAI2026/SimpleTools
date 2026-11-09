import { describe, expect, it } from 'vitest'
import { STYLE_NAMES, stylize } from './logic'

describe('unicode-styles', () => {
  it('maps letters and digits', () => {
    expect(stylize('Ab1', 'bold')).toBe('𝐀𝐛𝟏')
    expect(stylize('h', 'italic')).toBe('ℎ')
    expect(stylize('CR', 'doubleStruck')).toBe('ℂℝ')
    expect(stylize('Hi 1', 'fullwidth')).toBe('Ｈｉ\u3000１')
    expect(stylize('a1', 'circled')).toBe('ⓐ①')
    expect(stylize('abc', 'smallCaps')).toBe('ᴀʙᴄ')
    expect(stylize('ab', 'strike')).toBe('a\u0336b\u0336')
  })
  it('leaves other chars alone for every style', () => {
    for (const s of STYLE_NAMES) expect(stylize('中!', s).replace(/[\u0332\u0336]/g, '')).toBe('中!')
  })
})
