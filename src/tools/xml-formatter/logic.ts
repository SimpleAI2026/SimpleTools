const TOKEN = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[^>[]*(?:\[[\s\S]*?\])?\s*>|<\/?[A-Za-z_][^>]*>|[^<]+|</gi

type Kind = 'open' | 'close' | 'self' | 'text' | 'other'
interface Tok {
  kind: Kind
  raw: string
  name?: string
}

function tokenize(xml: string): Tok[] {
  const out: Tok[] = []
  for (const raw of xml.match(TOKEN) ?? []) {
    if (raw === '<') throw new Error('Unexpected "<"')
    if (!raw.startsWith('<')) {
      if (raw.trim()) out.push({ kind: 'text', raw: raw.trim() })
      continue
    }
    if (/^<(!|\?)/.test(raw)) {
      out.push({ kind: 'other', raw })
      continue
    }
    const name = /^<\/?([^\s/>]+)/.exec(raw)![1]!
    if (raw.startsWith('</')) out.push({ kind: 'close', raw: `</${name}>`, name })
    else if (raw.endsWith('/>')) out.push({ kind: 'self', raw, name })
    else out.push({ kind: 'open', raw, name })
  }
  return out
}

/** Throws a descriptive error when tags are unbalanced. */
function check(tokens: Tok[]) {
  const stack: string[] = []
  for (const t of tokens) {
    if (t.kind === 'open') stack.push(t.name!)
    else if (t.kind === 'close') {
      const top = stack.pop()
      if (top !== t.name) throw new Error(top ? `Mismatched </${t.name}>, expected </${top}>` : `Unexpected </${t.name}>`)
    }
  }
  if (stack.length) throw new Error(`Unclosed <${stack[stack.length - 1]}>`)
}

export interface XmlFormatOptions {
  indent: string
  removeComments?: boolean
}

export function formatXml(xml: string, o: XmlFormatOptions = { indent: '  ' }): string {
  let tokens = tokenize(xml)
  check(tokens)
  if (o.removeComments) tokens = tokens.filter((t) => !t.raw.startsWith('<!--'))
  const lines: string[] = []
  let level = 0
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!
    const pad = o.indent.repeat(level)
    if (t.kind === 'close') {
      level--
      lines.push(o.indent.repeat(level) + t.raw)
    } else if (t.kind === 'open') {
      const a = tokens[i + 1]
      const b = tokens[i + 2]
      if (a?.kind === 'close' && a.name === t.name) {
        lines.push(pad + t.raw + a.raw)
        i += 1
      } else if (a?.kind === 'text' && b?.kind === 'close' && b.name === t.name) {
        lines.push(pad + t.raw + a.raw + b.raw)
        i += 2
      } else {
        lines.push(pad + t.raw)
        level++
      }
    } else lines.push(pad + t.raw)
  }
  return lines.join('\n')
}

export function minifyXml(xml: string, removeComments = true): string {
  let tokens = tokenize(xml)
  check(tokens)
  if (removeComments) tokens = tokens.filter((t) => !t.raw.startsWith('<!--'))
  return tokens.map((t) => (t.kind === 'open' || t.kind === 'self' ? t.raw.replace(/\s+/g, ' ').replace(/\s+(\/?>)$/, '$1') : t.raw)).join('')
}

export function validateXml(xml: string): string | null {
  try {
    check(tokenize(xml))
    return null
  } catch (e) {
    return (e as Error).message
  }
}
