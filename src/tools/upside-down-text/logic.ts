const PAIRS: [string, string][] = [
  ['a', 'ɐ'], ['b', 'q'], ['c', 'ɔ'], ['d', 'p'], ['e', 'ǝ'], ['f', 'ɟ'], ['g', 'ƃ'], ['h', 'ɥ'], ['i', 'ᴉ'], ['j', 'ɾ'],
  ['k', 'ʞ'], ['l', 'l'], ['m', 'ɯ'], ['n', 'u'], ['r', 'ɹ'], ['t', 'ʇ'], ['v', 'ʌ'], ['w', 'ʍ'], ['y', 'ʎ'],
  ['A', '∀'], ['C', 'Ɔ'], ['E', 'Ǝ'], ['F', 'Ⅎ'], ['G', '⅁'], ['J', 'ſ'], ['L', '˥'], ['M', 'W'], ['P', 'Ԁ'], ['T', '⊥'],
  ['U', '∩'], ['V', 'Λ'], ['Y', '⅄'], ['1', 'Ɩ'], ['2', 'ᄅ'], ['3', 'Ɛ'], ['4', 'ㄣ'], ['5', 'ϛ'], ['6', '9'], ['7', 'ㄥ'],
  ['.', '˙'], [',', "'"], ['?', '¿'], ['!', '¡'], ['"', '„'], ['(', ')'], ['[', ']'], ['{', '}'], ['<', '>'], ['&', '⅋'], ['_', '‾'], [';', '؛'],
]
const FLIP = new Map<string, string>()
for (const [a, b] of PAIRS) {
  FLIP.set(a, b)
  if (!FLIP.has(b)) FLIP.set(b, a)
}

/** Flip text upside down (reversed order + rotated glyphs). Applying twice restores mapped characters. */
export function flipText(text: string): string {
  return Array.from(text)
    .reverse()
    .map((c) => FLIP.get(c) ?? c)
    .join('')
}

export function mirrorText(text: string): string {
  return Array.from(text).reverse().join('')
}
