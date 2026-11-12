import { CronExpressionParser } from 'cron-parser'

export type FieldKind = 'minute' | 'hour' | 'dom' | 'month' | 'dow'
export type FieldMode = 'every' | 'list' | 'range' | 'step'

export interface FieldSpec {
  mode: FieldMode
  values: number[]
  from: number
  to: number
  step: number
}

export const FIELD_BOUNDS: Record<FieldKind, { min: number; max: number }> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dom: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dow: { min: 0, max: 7 },
}

export const FIELD_ORDER: FieldKind[] = ['minute', 'hour', 'dom', 'month', 'dow']

export function everyField(): FieldSpec {
  return { mode: 'every', values: [], from: 0, to: 0, step: 1 }
}

export function parseField(token: string, kind: FieldKind): FieldSpec {
  const { min, max } = FIELD_BOUNDS[kind]
  if (token === '*') return { mode: 'every', values: [], from: min, to: max, step: 1 }
  const step = /^\*\/(\d+)$/.exec(token)
  if (step) return { mode: 'step', values: [], from: min, to: max, step: Number(step[1]) }
  const range = /^(\d+)-(\d+)$/.exec(token)
  if (range) return { mode: 'range', values: [], from: Number(range[1]), to: Number(range[2]), step: 1 }
  const values = token.split(',').map(Number)
  if (values.length && values.every((n) => Number.isInteger(n))) return { mode: 'list', values, from: min, to: max, step: 1 }
  return { mode: 'every', values: [], from: min, to: max, step: 1 }
}

export function parseCron(expr: string): Record<FieldKind, FieldSpec> | null {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) return null
  return {
    minute: parseField(parts[0] ?? '*', 'minute'),
    hour: parseField(parts[1] ?? '*', 'hour'),
    dom: parseField(parts[2] ?? '*', 'dom'),
    month: parseField(parts[3] ?? '*', 'month'),
    dow: parseField(parts[4] ?? '*', 'dow'),
  }
}

export function fieldToCron(spec: FieldSpec, kind: FieldKind): string {
  const { min, max } = FIELD_BOUNDS[kind]
  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(Number.isFinite(n) ? n : min)))
  if (spec.mode === 'every') return '*'
  if (spec.mode === 'list') {
    const values = [...new Set(spec.values.map((n) => Math.round(n)).filter((n) => n >= min && n <= max))].sort((a, b) => a - b)
    return values.length ? values.join(',') : '*'
  }
  if (spec.mode === 'range') {
    let from = clamp(spec.from)
    let to = clamp(spec.to)
    if (from > to) [from, to] = [to, from]
    return from === to ? String(from) : `${from}-${to}`
  }
  const step = Math.min(max, Math.max(1, Math.round(Number.isFinite(spec.step) ? spec.step : 1)))
  return `*/${step}`
}

export function buildCron(fields: Record<FieldKind, FieldSpec>): string {
  return FIELD_ORDER.map((kind) => fieldToCron(fields[kind], kind)).join(' ')
}

export function previewCron(expr: string, count = 5, from = new Date()): Date[] {
  const it = CronExpressionParser.parse(expr, { currentDate: from })
  return Array.from({ length: count }, () => it.next().toDate())
}

export const CRON_PRESETS: { id: string; expr: string }[] = [
  { id: 'everyMinute', expr: '* * * * *' },
  { id: 'hourly', expr: '0 * * * *' },
  { id: 'daily', expr: '0 0 * * *' },
  { id: 'weekdays', expr: '0 9 * * 1-5' },
  { id: 'weekly', expr: '0 9 * * 1' },
  { id: 'monthly', expr: '0 0 1 * *' },
]
