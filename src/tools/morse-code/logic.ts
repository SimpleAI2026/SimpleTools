export const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-', 5: '.....', 6: '-....', 7: '--...',
  8: '---..', 9: '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.',
  '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
  _: '..--.-', '"': '.-..-.', $: '...-..-', '@': '.--.-.',
}
const REVERSE = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]))

/** Letters separated by spaces, words by " / ". Unknown characters are returned in `unknown`. */
export function toMorse(text: string): { output: string; unknown: string[] } {
  const unknown = new Set<string>()
  const words = text.trim().toUpperCase().split(/\s+/).filter(Boolean)
  const output = words
    .map((w) =>
      Array.from(w)
        .map((c) => MORSE[c] ?? (unknown.add(c), ''))
        .filter(Boolean)
        .join(' '),
    )
    .join(' / ')
  return { output, unknown: [...unknown] }
}

export function fromMorse(code: string): string {
  return code
    .trim()
    .replace(/[•·]/g, '.')
    .replace(/[—–_]/g, '-')
    .split(/\s*(?:\/|\|| {3,})\s*/)
    .map((w) => w.split(/\s+/).filter(Boolean).map((s) => REVERSE[s] ?? '?').join(''))
    .join(' ')
}
