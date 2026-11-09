export type TsUnit = 'seconds' | 'milliseconds'

/** Guess unit: values with more than 11 digits are treated as milliseconds. */
export function detectUnit(value: string): TsUnit {
  const digits = value.trim().replace(/^-/, '').split('.')[0] ?? ''
  return digits.length > 11 ? 'milliseconds' : 'seconds'
}

export function parseTimestamp(value: string, unit: TsUnit | 'auto' = 'auto'): Date | null {
  const v = value.trim()
  if (!/^-?\d+(\.\d+)?$/.test(v)) return null
  const u = unit === 'auto' ? detectUnit(v) : unit
  const ms = u === 'seconds' ? Number(v) * 1000 : Number(v)
  const d = new Date(ms)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Parse a date string (ISO 8601 or anything Date understands). */
export function parseDateString(value: string): Date | null {
  if (!value.trim()) return null
  const d = new Date(value.trim())
  return Number.isNaN(d.getTime()) ? null : d
}

export interface TimestampView {
  seconds: number
  milliseconds: number
  iso: string
  utc: string
  local: string
  relative: string
}

export function relativeTime(date: Date, now: Date, locale: string): string {
  const diff = (date.getTime() - now.getTime()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs || unit === 'second') return rtf.format(Math.round(diff / secs), unit)
  }
  return ''
}

export function describeDate(date: Date, locale: string, timeZone?: string, now: Date = new Date()): TimestampView {
  const fmt = (tz?: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'long', timeZone: tz }).format(date)
  return {
    seconds: Math.floor(date.getTime() / 1000),
    milliseconds: date.getTime(),
    iso: date.toISOString(),
    utc: fmt('UTC'),
    local: fmt(timeZone),
    relative: relativeTime(date, now, locale),
  }
}
