import { CronExpressionParser } from 'cron-parser'

export type Lang = 'zh' | 'en'
const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
}

export function normalizeCron(expr: string): string {
  const e = expr.trim().replace(/\s+/g, ' ')
  return MACROS[e.toLowerCase()] ?? e
}

export function nextRuns(expr: string, count: number, from = new Date(), tz?: string): Date[] {
  const it = CronExpressionParser.parse(normalizeCron(expr), { currentDate: from, tz })
  return Array.from({ length: count }, () => it.next().toDate())
}

type Kind = 'second' | 'minute' | 'hour' | 'dom' | 'month' | 'dow'
const UNIT: Record<Kind, [string, string]> = {
  second: ['秒', 'second'],
  minute: ['分钟', 'minute'],
  hour: ['小时', 'hour'],
  dom: ['天', 'day'],
  month: ['月', 'month'],
  dow: ['周几', 'weekday'],
}
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DOW_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

function label(v: string, kind: Kind, lang: Lang): string {
  const up = v.toUpperCase()
  const mi = MONTHS_EN.findIndex((m) => m.toUpperCase() === up)
  const di = DOW_EN.findIndex((d) => d.toUpperCase() === up)
  if (kind === 'month') {
    const n = mi >= 0 ? mi + 1 : Number(v)
    return lang === 'zh' ? `${n}月` : (MONTHS_EN[n - 1] ?? v)
  }
  if (kind === 'dow') {
    const n = di >= 0 ? di : Number(v)
    return (lang === 'zh' ? DOW_ZH : DOW_EN)[n] ?? v
  }
  return v
}

/** Human readable explanation of a single cron field. */
export function describeField(field: string, kind: Kind, lang: Lang): string {
  const [zhU, enU] = UNIT[kind]
  if (field === '*' || field === '?') return lang === 'zh' ? `每${zhU}` : `every ${enU}`
  return field
    .split(',')
    .map((part) => {
      const [range, step] = part.split('/') as [string, string | undefined]
      let base: string
      if (range === '*') base = ''
      else if (range.includes('-')) {
        const [a, b] = range.split('-') as [string, string]
        base = lang === 'zh' ? `${label(a, kind, lang)} 到 ${label(b, kind, lang)}` : `${label(a, kind, lang)} through ${label(b, kind, lang)}`
      } else base = label(range, kind, lang)
      if (!step) return base
      const every = lang === 'zh' ? `每 ${step} ${zhU}` : `every ${step} ${enU}s`
      return base ? (lang === 'zh' ? `${base}内${every}` : `${every} from ${base}`) : every
    })
    .join(lang === 'zh' ? '、' : ', ')
}

export interface CronExplanation {
  kind: Kind
  value: string
  text: string
}

export function explainCron(expr: string, lang: Lang): CronExplanation[] {
  const parts = normalizeCron(expr).split(' ')
  const kinds: Kind[] = parts.length === 6 ? ['second', 'minute', 'hour', 'dom', 'month', 'dow'] : ['minute', 'hour', 'dom', 'month', 'dow']
  if (parts.length !== kinds.length) throw new Error(lang === 'zh' ? 'Cron 表达式需要 5 或 6 个字段' : 'A cron expression needs 5 or 6 fields')
  return kinds.map((kind, i) => ({ kind, value: parts[i]!, text: describeField(parts[i]!, kind, lang) }))
}
