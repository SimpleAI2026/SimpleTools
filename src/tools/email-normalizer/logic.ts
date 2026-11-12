const GMAIL = new Set(['gmail.com', 'googlemail.com'])

export interface NormalizedEmail {
  original: string
  normalized: string
  local: string
  domain: string
  tag: string
}

export interface EmailOptions {
  lowercase: boolean
  stripPlus: boolean
  gmailDots: boolean
}

export function normalizeEmail(input: string, options: EmailOptions): NormalizedEmail | null {
  const trimmed = input.trim()
  const match = /^([^@\s]+)@([^@\s]+)$/.exec(trimmed)
  if (!match?.[1] || !match[2]) return null
  let local = match[1]
  let domain = match[2]
  if (options.lowercase) {
    local = local.toLowerCase()
    domain = domain.toLowerCase()
  } else domain = domain.toLowerCase()
  let tag = ''
  if (options.stripPlus) {
    const plus = local.indexOf('+')
    if (plus >= 0) {
      tag = local.slice(plus + 1)
      local = local.slice(0, plus)
    }
  }
  if (options.gmailDots && GMAIL.has(domain)) {
    local = local.replace(/\./g, '')
    domain = 'gmail.com'
  }
  return { original: trimmed, normalized: `${local}@${domain}`, local, domain, tag }
}

export function normalizeEmails(text: string, options: EmailOptions): string {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line
      return normalizeEmail(trimmed, options)?.normalized ?? line
    })
    .join('\n')
}
