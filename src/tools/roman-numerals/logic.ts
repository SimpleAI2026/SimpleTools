const TABLE: [number, string][] = [
  [1000, 'M'],
  [900, 'CM'],
  [500, 'D'],
  [400, 'CD'],
  [100, 'C'],
  [90, 'XC'],
  [50, 'L'],
  [40, 'XL'],
  [10, 'X'],
  [9, 'IX'],
  [5, 'V'],
  [4, 'IV'],
  [1, 'I'],
]

export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new Error('Number must be an integer from 1 to 3999')
  let out = ''
  for (const [v, s] of TABLE) while (n >= v) {
    out += s
    n -= v
  }
  return out
}

/** Strictly parses canonical roman numerals (rejects e.g. "IIII" or "VX"). */
export function fromRoman(s: string): number {
  const r = s.trim().toUpperCase()
  if (!/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(r) || !r) throw new Error(`Invalid roman numeral: ${s}`)
  let n = 0
  let i = 0
  for (const [v, sym] of TABLE)
    while (r.startsWith(sym, i)) {
      n += v
      i += sym.length
    }
  return n
}

/** Auto-detect direction. */
export function convertRoman(input: string): string {
  const t = input.trim()
  return /^\d+$/.test(t) ? toRoman(Number(t)) : String(fromRoman(t))
}
