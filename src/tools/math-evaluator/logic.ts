export type AngleMode = 'rad' | 'deg'
export type MathErrorCode = 'empty' | 'invalid' | 'div0' | 'unknown' | 'arity' | 'domain'

export type MathResult =
  | { ok: true; value: number; formatted: string }
  | { ok: false; error: MathErrorCode; detail?: string }

class EvalError extends Error {
  constructor(public code: Exclude<MathErrorCode, 'empty'>, public detail?: string) {
    super(code)
  }
}

const PREC: Record<string, number> = {
  '||': 1,
  '&&': 2,
  '==': 3,
  '!=': 3,
  '<': 3,
  '>': 3,
  '<=': 3,
  '>=': 3,
  '+': 4,
  '-': 4,
  '*': 5,
  '/': 5,
  '%': 5,
  '^': 6,
}

function toRad(value: number, deg: boolean) {
  return deg ? (value * Math.PI) / 180 : value
}
function fromRad(value: number, deg: boolean) {
  return deg ? (value * 180) / Math.PI : value
}

const FUNCS: Record<string, (args: number[], deg: boolean) => number> = {
  sin: ([x], deg) => Math.sin(toRad(x ?? Number.NaN, deg)),
  cos: ([x], deg) => Math.cos(toRad(x ?? Number.NaN, deg)),
  tan: ([x], deg) => Math.tan(toRad(x ?? Number.NaN, deg)),
  asin: ([x], deg) => fromRad(Math.asin(x ?? Number.NaN), deg),
  acos: ([x], deg) => fromRad(Math.acos(x ?? Number.NaN), deg),
  atan: ([x], deg) => fromRad(Math.atan(x ?? Number.NaN), deg),
  atan2: ([y, x], deg) => fromRad(Math.atan2(y ?? Number.NaN, x ?? Number.NaN), deg),
  sqrt: ([x]) => Math.sqrt(x ?? Number.NaN),
  cbrt: ([x]) => Math.cbrt(x ?? Number.NaN),
  abs: ([x]) => Math.abs(x ?? Number.NaN),
  floor: ([x]) => Math.floor(x ?? Number.NaN),
  ceil: ([x]) => Math.ceil(x ?? Number.NaN),
  round: ([x]) => Math.round(x ?? Number.NaN),
  trunc: ([x]) => Math.trunc(x ?? Number.NaN),
  sign: ([x]) => Math.sign(x ?? Number.NaN),
  log: ([x]) => Math.log(x ?? Number.NaN),
  ln: ([x]) => Math.log(x ?? Number.NaN),
  log2: ([x]) => Math.log2(x ?? Number.NaN),
  log10: ([x]) => Math.log10(x ?? Number.NaN),
  exp: ([x]) => Math.exp(x ?? Number.NaN),
  min: (args) => Math.min(...args),
  max: (args) => Math.max(...args),
  pow: ([a, b]) => (a ?? Number.NaN) ** (b ?? Number.NaN),
  hypot: (args) => Math.hypot(...args),
}

const ARITY: Record<string, number | 'variadic'> = {
  sin: 1, cos: 1, tan: 1, asin: 1, acos: 1, atan: 1, atan2: 2, sqrt: 1, cbrt: 1, abs: 1,
  floor: 1, ceil: 1, round: 1, trunc: 1, sign: 1, log: 1, ln: 1, log2: 1, log10: 1, exp: 1,
  min: 'variadic', max: 'variadic', pow: 2, hypot: 'variadic',
}

interface Parser {
  s: string
  i: number
  deg: boolean
}

function skip(p: Parser) {
  while (p.i < p.s.length && /\s/.test(p.s[p.i] ?? '')) p.i++
}

function parseNumber(p: Parser): number {
  const match = /^(\d*\.\d+|\d+)(e[+-]?\d+)?/i.exec(p.s.slice(p.i))
  if (!match) throw new EvalError('invalid')
  p.i += match[0].length
  return Number(match[0])
}

function parseIdent(p: Parser): string {
  const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(p.s.slice(p.i))
  if (!match) throw new EvalError('invalid')
  p.i += match[0].length
  return match[0].toLowerCase()
}

function parsePrimary(p: Parser): number {
  skip(p)
  const ch = p.s[p.i]
  if (ch === '(') {
    p.i++
    const value = parseExpr(p, 0)
    skip(p)
    if (p.s[p.i] !== ')') throw new EvalError('invalid')
    p.i++
    return postfix(p, value)
  }
  if (ch && /[\d.]/.test(ch)) return postfix(p, parseNumber(p))
  if (ch && /[A-Za-z_]/.test(ch)) {
    const name = parseIdent(p)
    skip(p)
    if (name === 'pi') return postfix(p, Math.PI)
    if (name === 'e') return postfix(p, Math.E)
    if (name === 'tau') return postfix(p, Math.PI * 2)
    if (p.s[p.i] !== '(') throw new EvalError('unknown', name)
    p.i++
    const args: number[] = []
    skip(p)
    if (p.s[p.i] !== ')') {
      args.push(parseExpr(p, 0))
      skip(p)
      while (p.s[p.i] === ',') {
        p.i++
        args.push(parseExpr(p, 0))
        skip(p)
      }
    }
    if (p.s[p.i] !== ')') throw new EvalError('invalid')
    p.i++
    const fn = FUNCS[name]
    const arity = ARITY[name]
    if (!fn || !arity) throw new EvalError('unknown', name)
    if (arity !== 'variadic' && args.length !== arity) throw new EvalError('arity', name)
    if (arity === 'variadic' && args.length < 1) throw new EvalError('arity', name)
    const value = fn(args, p.deg)
    if (!Number.isFinite(value)) throw new EvalError('domain', name)
    return postfix(p, value)
  }
  throw new EvalError('invalid')
}

function postfix(p: Parser, value: number): number {
  const saved = p.i
  skip(p)
  if (p.s[p.i] !== '%') {
    p.i = saved
    return value
  }
  let j = p.i + 1
  while (j < p.s.length && /\s/.test(p.s[j] ?? '')) j++
  const next = p.s[j] ?? ''
  if (next && /[\d.(A-Za-z_]/.test(next)) {
    p.i = saved
    return value
  }
  p.i += 1
  return postfix(p, value / 100)
}

function parseUnary(p: Parser): number {
  skip(p)
  if (p.s[p.i] === '+') {
    p.i++
    return parseUnary(p)
  }
  if (p.s[p.i] === '-') {
    p.i++
    return -parseUnary(p)
  }
  if (p.s[p.i] === '!') {
    p.i++
    return parseUnary(p) === 0 ? 1 : 0
  }
  return parsePrimary(p)
}

function operator(p: Parser): string | null {
  skip(p)
  const two = p.s.slice(p.i, p.i + 2)
  if (two in PREC) return two
  const one = p.s[p.i] ?? ''
  if (one in PREC) return one
  return null
}

function apply(op: string, left: number, right: number): number {
  switch (op) {
    case '+': return left + right
    case '-': return left - right
    case '*': return left * right
    case '/':
      if (right === 0) throw new EvalError('div0')
      return left / right
    case '%':
      if (right === 0) throw new EvalError('div0')
      return left % right
    case '^': return left ** right
    case '<': return left < right ? 1 : 0
    case '>': return left > right ? 1 : 0
    case '<=': return left <= right ? 1 : 0
    case '>=': return left >= right ? 1 : 0
    case '==': return left === right ? 1 : 0
    case '!=': return left !== right ? 1 : 0
    case '&&': return left !== 0 && right !== 0 ? 1 : 0
    case '||': return left !== 0 || right !== 0 ? 1 : 0
    default: throw new EvalError('invalid')
  }
}

function parseExpr(p: Parser, min: number): number {
  let left = parseUnary(p)
  for (;;) {
    const op = operator(p)
    if (!op) break
    const prec = PREC[op] ?? 0
    if (prec < min) break
    p.i += op.length
    const next = op === '^' ? prec : prec + 1
    const right = parseExpr(p, next)
    left = apply(op, left, right)
  }
  return left
}

export function formatMath(value: number): string {
  if (!Number.isFinite(value)) return String(value)
  if (Object.is(value, -0)) return '0'
  const text = String(value)
  if (text.length < 16) return text
  return String(Number(value.toPrecision(12)))
}

export function evaluateMath(expression: string, angle: AngleMode = 'rad'): MathResult {
  const source = expression.trim()
  if (!source) return { ok: false, error: 'empty' }
  if (source.length > 2000) return { ok: false, error: 'invalid' }
  try {
    const parser: Parser = { s: source, i: 0, deg: angle === 'deg' }
    const value = parseExpr(parser, 0)
    skip(parser)
    if (parser.i !== parser.s.length) throw new EvalError('invalid')
    if (!Number.isFinite(value)) throw new EvalError('domain')
    return { ok: true, value, formatted: formatMath(value) }
  } catch (error) {
    if (error instanceof EvalError) return { ok: false, error: error.code, detail: error.detail }
    return { ok: false, error: 'invalid' }
  }
}
