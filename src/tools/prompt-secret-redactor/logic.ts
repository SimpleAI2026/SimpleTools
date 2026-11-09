export type RedactCategory = 'openai' | 'anthropic' | 'google' | 'github' | 'slack' | 'aws' | 'bearer' | 'jwt' | 'email' | 'pem'

export interface RedactOptions {
  openai: boolean
  anthropic: boolean
  google: boolean
  github: boolean
  slack: boolean
  aws: boolean
  bearer: boolean
  jwt: boolean
  email: boolean
  pem: boolean
}

export const DEFAULT_REDACT_OPTIONS: RedactOptions = {
  openai: true,
  anthropic: true,
  google: true,
  github: true,
  slack: true,
  aws: true,
  bearer: true,
  jwt: true,
  email: false,
  pem: true,
}

export interface RedactionHit {
  category: RedactCategory
  count: number
}

export interface RedactResult {
  text: string
  total: number
  byCategory: RedactionHit[]
}

interface Rule {
  category: RedactCategory
  re: RegExp
  replace: string
}

const RULES: Rule[] = [
  { category: 'openai', re: /\bsk-[A-Za-z0-9_\-]{20,}\b/g, replace: '[REDACTED_OPENAI_KEY]' },
  { category: 'openai', re: /\bsk-proj-[A-Za-z0-9_\-]{20,}\b/g, replace: '[REDACTED_OPENAI_KEY]' },
  { category: 'anthropic', re: /\bsk-ant-[A-Za-z0-9_\-]{20,}\b/g, replace: '[REDACTED_ANTHROPIC_KEY]' },
  { category: 'google', re: /\bAIza[0-9A-Za-z_\-]{20,}\b/g, replace: '[REDACTED_GOOGLE_KEY]' },
  { category: 'github', re: /\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, replace: '[REDACTED_GITHUB_TOKEN]' },
  { category: 'github', re: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, replace: '[REDACTED_GITHUB_PAT]' },
  { category: 'slack', re: /\bxox[baprs]-[A-Za-z0-9\-]{10,}\b/g, replace: '[REDACTED_SLACK_TOKEN]' },
  { category: 'aws', re: /\bAKIA[0-9A-Z]{16}\b/g, replace: '[REDACTED_AWS_KEY_ID]' },
  { category: 'aws', re: /(?<![A-Za-z0-9/+=])(?:ASIA)[0-9A-Z]{16}\b/g, replace: '[REDACTED_AWS_KEY_ID]' },
  { category: 'bearer', re: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi, replace: 'Bearer [REDACTED_TOKEN]' },
  { category: 'jwt', re: /\beyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_|]+/g, replace: '[REDACTED_JWT]' },
  { category: 'email', re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, replace: '[REDACTED_EMAIL]' },
  {
    category: 'pem',
    re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    replace: '[REDACTED_PRIVATE_KEY_PEM]',
  },
]

export function redactSecrets(input: string, options: RedactOptions = DEFAULT_REDACT_OPTIONS): RedactResult {
  let text = input ?? ''
  const counts = new Map<RedactCategory, number>()
  for (const rule of RULES) {
    if (!options[rule.category]) continue
    const re = new RegExp(rule.re.source, rule.re.flags)
    let n = 0
    text = text.replace(re, () => {
      n += 1
      return rule.replace
    })
    if (n) counts.set(rule.category, (counts.get(rule.category) ?? 0) + n)
  }
  const byCategory = [...counts.entries()].map(([category, count]) => ({ category, count }))
  const total = byCategory.reduce((s, x) => s + x.count, 0)
  return { text, total, byCategory }
}

export const SAMPLE_SECRET_TEXT = `Contact me at alice@example.com
OpenAI: sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCD
Anthropic: sk-ant-api03-abcdefghijklmnopqrstuvwxyz012345
Google: AIzaSyA-abcdefghijklmnopqrstuvwx
GitHub: ghp_abcdefghijklmnopqrstuvwxyz012345
Slack: xoxb-1234567890-abcdefghijklmnop
AWS: AKIAIOSFODNN7EXAMPLE
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.signature
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7
-----END PRIVATE KEY-----
`
