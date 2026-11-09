export interface RegexHit {
  status: 'match' | 'nomatch' | 'timeout' | 'invalid' | 'too-long'
  match: string
}

const MAX_PATTERN = 200
const MAX_SUBJECT = 20_000
const DEFAULT_STEPS = 100_000

type Ast =
  | { op: 'empty' }
  | { op: 'lit'; s: string }
  | { op: 'dot' }
  | { op: 'class'; neg: boolean; chars: string; ranges: [string, string][] }
  | { op: 'anchor'; which: '^' | '$' }
  | { op: 'cat'; xs: Ast[] }
  | { op: 'alt'; xs: Ast[] }
  | { op: 'rep'; x: Ast; min: number; max: number }

interface Steps {
  n: number
  max: number
}

/**
 * Match a user pattern with an explicit step budget.
 * Native RegExp is not used: a catastrophic pattern returns `timeout`
 * instead of running unbounded V8 backtracking. Lookaround and backreferences
 * are rejected (`invalid`) rather than executed.
 */
export function testRegex(pattern: string, flags: string, text: string, stepBudget = DEFAULT_STEPS): RegexHit {
  if (pattern.length > MAX_PATTERN || text.length > MAX_SUBJECT) return { status: 'too-long', match: '' }
  if (!/^[im]*$/.test(flags) || flags.length > 2) return { status: 'invalid', match: '' }
  if (pattern.includes('(?') || /\\[1-9]/.test(pattern)) return { status: 'invalid', match: '' }
  let ast: Ast
  try {
    const [node, i] = parseAlt(pattern, 0)
    if (i !== pattern.length) return { status: 'invalid', match: '' }
    ast = node
  } catch {
    return { status: 'invalid', match: '' }
  }
  const ignoreCase = flags.includes('i')
  const multiline = flags.includes('m')
  if (ignoreCase) ast = foldCase(ast)
  const subject = ignoreCase ? text.toLowerCase() : text
  const steps: Steps = { n: 0, max: stepBudget }
  const starts = astStartsAnchored(ast) ? lineStarts(subject, multiline) : indexStarts(subject.length)
  for (const start of starts) {
    const end = exec(ast, subject, start, (pos) => pos, steps, multiline)
    if (end === 'timeout') return { status: 'timeout', match: '' }
    if (typeof end === 'number') return { status: 'match', match: text.slice(start, end) }
  }
  if (steps.n > steps.max) return { status: 'timeout', match: '' }
  return { status: 'nomatch', match: '' }
}

type Cont = (end: number) => number | null | 'timeout'

function exec(ast: Ast, text: string, i: number, cont: Cont, steps: Steps, multiline: boolean): number | null | 'timeout' {
  if (steps.n++ > steps.max) return 'timeout'
  if (ast.op === 'empty') return cont(i)
  if (ast.op === 'lit') return text.startsWith(ast.s, i) ? cont(i + ast.s.length) : null
  if (ast.op === 'dot') return i < text.length && text[i] !== '\n' ? cont(i + 1) : null
  if (ast.op === 'class' || ast.op === 'anchor') {
    const n = matchOne(ast, text, i, multiline)
    return n == null ? null : cont(n)
  }
  if (ast.op === 'cat') return execList(ast.xs, 0, text, i, cont, steps, multiline)
  if (ast.op === 'alt') {
    for (const branch of ast.xs) {
      const result = exec(branch, text, i, cont, steps, multiline)
      if (result === 'timeout' || result != null) return result
    }
    return null
  }
  return execRep(ast, text, i, cont, steps, multiline, 0)
}

function execList(xs: Ast[], index: number, text: string, i: number, cont: Cont, steps: Steps, multiline: boolean): number | null | 'timeout' {
  if (index >= xs.length) return cont(i)
  const item = xs[index]
  if (!item) return cont(i)
  return exec(item, text, i, (end) => execList(xs, index + 1, text, end, cont, steps, multiline), steps, multiline)
}

function execRep(ast: Extract<Ast, { op: 'rep' }>, text: string, i: number, cont: Cont, steps: Steps, multiline: boolean, count: number): number | null | 'timeout' {
  if (steps.n++ > steps.max) return 'timeout'
  const more = (): number | null | 'timeout' => {
    if (count >= ast.max) return null
    return exec(ast.x, text, i, (end) => (end === i ? null : execRep(ast, text, end, cont, steps, multiline, count + 1)), steps, multiline)
  }
  if (count >= ast.min) {
    const taken = more()
    if (taken === 'timeout' || taken != null) return taken
    return cont(i)
  }
  return more()
}

function foldCase(ast: Ast): Ast {
  if (ast.op === 'lit') return { op: 'lit', s: ast.s.toLowerCase() }
  if (ast.op === 'class') return { op: 'class', neg: ast.neg, chars: ast.chars.toLowerCase(), ranges: ast.ranges.map(([a, b]) => [a.toLowerCase(), b.toLowerCase()]) }
  if (ast.op === 'cat') return { op: 'cat', xs: ast.xs.map(foldCase) }
  if (ast.op === 'alt') return { op: 'alt', xs: ast.xs.map(foldCase) }
  if (ast.op === 'rep') return { ...ast, x: foldCase(ast.x) }
  return ast
}

function astStartsAnchored(ast: Ast): boolean {
  if (ast.op === 'anchor' && ast.which === '^') return true
  if (ast.op === 'cat') return astStartsAnchored(ast.xs[0] ?? { op: 'empty' })
  return false
}

function lineStarts(text: string, multiline: boolean): number[] {
  if (!multiline) return [0]
  const out = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === '\n' && i + 1 <= text.length) out.push(i + 1)
  return out
}

function indexStarts(n: number): number[] {
  const out: number[] = []
  for (let i = 0; i <= n; i++) out.push(i)
  return out
}

function parseAlt(s: string, i: number): [Ast, number] {
  const xs: Ast[] = []
  let cur: [Ast, number] = parseConcat(s, i)
  xs.push(cur[0])
  i = cur[1]
  while (s[i] === '|') {
    cur = parseConcat(s, i + 1)
    xs.push(cur[0])
    i = cur[1]
  }
  return [xs.length === 1 ? xs[0]! : { op: 'alt', xs }, i]
}

function parseConcat(s: string, i: number): [Ast, number] {
  const xs: Ast[] = []
  while (i < s.length && s[i] !== '|' && s[i] !== ')') {
    const atom = parseQuantified(s, i)
    xs.push(atom[0])
    i = atom[1]
  }
  if (xs.length === 0) return [{ op: 'empty' }, i]
  return [xs.length === 1 ? xs[0]! : { op: 'cat', xs }, i]
}

function parseQuantified(s: string, i: number): [Ast, number] {
  const atom = parseAtom(s, i)
  i = atom[1]
  let min = 1
  let max = 1
  let quantified = false
  if (s[i] === '*') { min = 0; max = 1_000_000_000; quantified = true; i++ }
  else if (s[i] === '+') { min = 1; max = 1_000_000_000; quantified = true; i++ }
  else if (s[i] === '?') { min = 0; max = 1; quantified = true; i++ }
  else if (s[i] === '{') {
    const m = /^\{(\d+)(,(\d+)?)?\}/.exec(s.slice(i))
    if (!m) throw new Error('bad-quant')
    min = Number(m[1])
    max = m[2] == null ? min : m[3] == null ? 1_000_000_000 : Number(m[3])
    if (max < min || max > 1_000_000) throw new Error('bad-quant')
    quantified = true
    i += m[0].length
  }
  if (quantified && s[i] === '?') i++
  return [quantified ? { op: 'rep', x: atom[0], min, max } : atom[0], i]
}

function parseAtom(s: string, i: number): [Ast, number] {
  const c = s[i]
  if (c == null || c === '|' || c === ')' || c === '*' || c === '+' || c === '?' || c === '{') throw new Error('bad-atom')
  if (c === '(') {
    if (s[i + 1] === '?') throw new Error('unsupported')
    const inner = parseAlt(s, i + 1)
    if (s[inner[1]] !== ')') throw new Error('unclosed')
    return [inner[0], inner[1] + 1]
  }
  if (c === '.') return [{ op: 'dot' }, i + 1]
  if (c === '^' || c === '$') return [{ op: 'anchor', which: c }, i + 1]
  if (c === '[') return parseClass(s, i + 1)
  if (c === '\\') {
    const e = escapeAtom(s[i + 1])
    if (!e) throw new Error('bad-escape')
    return [e, i + 2]
  }
  if (c === ']' || c === '}') throw new Error('stray')
  return [{ op: 'lit', s: c }, i + 1]
}

function escapeAtom(c: string | undefined): Ast | null {
  if (!c) return null
  if (c === 'd' || c === 'D' || c === 'w' || c === 'W' || c === 's' || c === 'S') return classFromShorthand(c)
  if (c === 'n') return { op: 'lit', s: '\n' }
  if (c === 't') return { op: 'lit', s: '\t' }
  if (c === 'r') return { op: 'lit', s: '\r' }
  if ('\\.*+?()[]{}|^$'.includes(c) || c === '/') return { op: 'lit', s: c }
  return null
}

function classFromShorthand(kind: string): Ast {
  const neg = kind === kind.toUpperCase()
  const base = kind.toLowerCase()
  if (base === 'd') return { op: 'class', neg, chars: '0123456789', ranges: [] }
  if (base === 's') return { op: 'class', neg, chars: ' \t\n\r\f', ranges: [] }
  return { op: 'class', neg, chars: '', ranges: [['0', '9'], ['A', 'Z'], ['a', 'z'], ['_', '_']] }
}

function parseClass(s: string, i: number): [Ast, number] {
  let neg = false
  if (s[i] === '^') { neg = true; i++ }
  let chars = ''
  const ranges: [string, string][] = []
  let closed = false
  while (i < s.length) {
    if (s[i] === ']' && (chars.length > 0 || ranges.length > 0 || neg)) { closed = true; i++; break }
    let ch = s[i]!
    i++
    if (ch === '\\') {
      const n = s[i]
      if (!n) throw new Error('bad-class')
      i++
      ch = n === 'n' ? '\n' : n === 't' ? '\t' : n === 'r' ? '\r' : n
    }
    if (s[i] === '-' && s[i + 1] && s[i + 1] !== ']') {
      i++
      let end = s[i]!
      i++
      if (end === '\\') {
        const n = s[i]
        if (!n) throw new Error('bad-class')
        i++
        end = n
      }
      ranges.push([ch, end])
    } else chars += ch
  }
  if (!closed) throw new Error('unclosed-class')
  return [{ op: 'class', neg, chars, ranges }, i]
}

function matchOne(ast: Extract<Ast, { op: 'class' | 'anchor' }>, text: string, i: number, multiline: boolean): number | null {
  if (ast.op === 'anchor') {
    if (ast.which === '^') return i === 0 || (multiline && text[i - 1] === '\n') ? i : null
    return i === text.length || (multiline && text[i] === '\n') ? i : null
  }
  const ch = text[i]
  if (ch == null) return null
  let ok = ast.chars.includes(ch)
  if (!ok) ok = ast.ranges.some(([a, b]) => ch >= a && ch <= b)
  if (ast.neg) ok = !ok
  return ok ? i + 1 : null
}
