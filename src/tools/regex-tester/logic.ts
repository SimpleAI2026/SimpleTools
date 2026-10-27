export interface RegexMatch {
  index: number
  text: string
  groups: (string | undefined)[]
  named: Record<string, string | undefined>
}
export interface RegexResult {
  matches: RegexMatch[]
  replaced: string | null
  truncated: boolean
}

export const MAX_MATCHES = 1000

export function buildRegex(pattern: string, flags: string): RegExp {
  const f = [...new Set(flags.replace(/[^dgimsuyv]/g, ''))].join('')
  return new RegExp(pattern, f)
}

export function runRegex(pattern: string, flags: string, text: string, replacement: string | null): RegexResult {
  const re = buildRegex(pattern, flags.includes('g') ? flags : flags + 'g')
  const matches: RegexMatch[] = []
  let truncated = false
  for (const m of text.matchAll(re)) {
    if (matches.length >= MAX_MATCHES) {
      truncated = true
      break
    }
    matches.push({ index: m.index ?? 0, text: m[0], groups: m.slice(1), named: { ...(m.groups ?? {}) } })
    if (!flags.includes('g')) break
  }
  const replaced = replacement === null ? null : text.replace(buildRegex(pattern, flags), replacement)
  return { matches, replaced, truncated }
}

/** Split text into highlighted / plain segments for rendering. */
export function segments(text: string, matches: RegexMatch[]): { text: string; match: number | null }[] {
  const out: { text: string; match: number | null }[] = []
  let pos = 0
  matches.forEach((m, i) => {
    if (m.index > pos) out.push({ text: text.slice(pos, m.index), match: null })
    if (m.text) out.push({ text: m.text, match: i })
    pos = Math.max(pos, m.index + m.text.length)
  })
  if (pos < text.length) out.push({ text: text.slice(pos), match: null })
  return out
}
