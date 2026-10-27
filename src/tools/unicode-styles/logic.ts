/** Map ASCII letters/digits to Unicode Mathematical Alphanumeric and other styled blocks. */
type Style = { upper?: number; lower?: number; digit?: number; exceptions?: Record<string, string> }

export const STYLES = {
  bold: { upper: 0x1d400, lower: 0x1d41a, digit: 0x1d7ce },
  italic: { upper: 0x1d434, lower: 0x1d44e, exceptions: { h: 'ℎ' } },
  boldItalic: { upper: 0x1d468, lower: 0x1d482 },
  script: { upper: 0x1d49c, lower: 0x1d4b6, exceptions: { B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ', e: 'ℯ', g: 'ℊ', o: 'ℴ' } },
  boldScript: { upper: 0x1d4d0, lower: 0x1d4ea },
  fraktur: { upper: 0x1d504, lower: 0x1d51e, exceptions: { C: 'ℭ', H: 'ℌ', I: 'ℑ', R: 'ℜ', Z: 'ℨ' } },
  doubleStruck: { upper: 0x1d538, lower: 0x1d552, digit: 0x1d7d8, exceptions: { C: 'ℂ', H: 'ℍ', N: 'ℕ', P: 'ℙ', Q: 'ℚ', R: 'ℝ', Z: 'ℤ' } },
  sansSerif: { upper: 0x1d5a0, lower: 0x1d5ba, digit: 0x1d7e2 },
  sansBold: { upper: 0x1d5d4, lower: 0x1d5ee, digit: 0x1d7ec },
  monospace: { upper: 0x1d670, lower: 0x1d68a, digit: 0x1d7f6 },
  fullwidth: { upper: 0xff21, lower: 0xff41, digit: 0xff10 },
  circled: { upper: 0x24b6, lower: 0x24d0, exceptions: { 0: '⓪', 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥', 7: '⑦', 8: '⑧', 9: '⑨' } },
} satisfies Record<string, Style>

export type StyleName = keyof typeof STYLES | 'smallCaps' | 'strike' | 'underline'
export const STYLE_NAMES: StyleName[] = [...(Object.keys(STYLES) as (keyof typeof STYLES)[]), 'smallCaps', 'strike', 'underline']

const SMALL_CAPS = 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ'

export function stylize(text: string, name: StyleName): string {
  if (name === 'strike') return Array.from(text, (c) => c + '\u0336').join('')
  if (name === 'underline') return Array.from(text, (c) => c + '\u0332').join('')
  if (name === 'smallCaps') return text.replace(/[a-z]/gi, (c) => Array.from(SMALL_CAPS)[c.toLowerCase().charCodeAt(0) - 97] ?? c)
  const s: Style = STYLES[name]
  return Array.from(text, (c) => {
    if (s.exceptions?.[c]) return s.exceptions[c]
    const code = c.charCodeAt(0)
    if (c >= 'A' && c <= 'Z' && s.upper) return String.fromCodePoint(s.upper + code - 65)
    if (c >= 'a' && c <= 'z' && s.lower) return String.fromCodePoint(s.lower + code - 97)
    if (c >= '0' && c <= '9' && s.digit) return String.fromCodePoint(s.digit + code - 48)
    if (name === 'fullwidth' && c === ' ') return '\u3000'
    return c
  }).join('')
}
