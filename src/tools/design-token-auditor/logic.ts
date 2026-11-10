import { finish, presentResult, rootObject, str, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '{"tokens":{"color":{"a":{"$value":"{color.b}","$type":"color"},"b":{"$value":"{color.a}","$type":"color"}}}}'

interface TokenNode {
  path: string
  type: string
  value: unknown
}

function walkTokens(value: unknown, path: string[], out: TokenNode[]): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  const object = value as Record<string, unknown>
  if ('$value' in object) out.push({ path: path.join('.'), type: str(object.$type), value: object.$value })
  for (const [key, child] of Object.entries(object)) {
    if (key.startsWith('$')) continue
    walkTokens(child, [...path, key], out)
  }
}

export function run(input: string) {
  const root = rootObject(input, 'design-token-auditor')
  const tokens: TokenNode[] = []
  walkTokens(root.tokens ?? root, [], tokens)
  if (tokens.length === 0) throw new Error('empty')
  const byPath = new Map(tokens.map((token) => [token.path, token]))
  const found: { code: string; detail: string }[] = []
  const resolving = new Set<string>()
  const visited = new Set<string>()
  const resolve = (path: string): void => {
    if (resolving.has(path)) {
      found.push({ code: 'cycle', detail: path })
      return
    }
    if (visited.has(path)) return
    const token = byPath.get(path)
    if (!token || typeof token.value !== 'string') return
    const reference = /^\{([^{}]+)\}$/.exec(token.value)
    if (!reference) {
      if (/^https?:\/\//.test(token.value)) found.push({ code: 'remote-ref-not-loaded', detail: path })
      return
    }
    if (!byPath.has(reference[1]!)) found.push({ code: 'missing-ref', detail: `${path}->${reference[1]}` })
    else {
      resolving.add(path)
      resolve(reference[1]!)
      resolving.delete(path)
    }
    visited.add(path)
  }
  for (const token of tokens) resolve(token.path)
  const folded = new Map<string, string[]>()
  for (const token of tokens) {
    const key = token.path.toLowerCase()
    folded.set(key, [...(folded.get(key) ?? []), token.path])
  }
  for (const paths of folded.values()) {
    if (new Set(paths).size > 1) found.push({ code: 'case-collision', detail: paths.join('|') })
  }
  const issues = [...new Map(found.map((issue) => [`${issue.code}:${issue.detail}`, issue])).values()]
  return finish(
    'design-token-auditor',
    root,
    'Limited DTCG subset. A case collision is an output warning. Remote references and CSS are not loaded.',
    { tokenCount: tokens.length, tokens: tokens.map((token) => token.path), issues },
    ['code', 'detail'],
    issues.map((issue) => [issue.code, issue.detail]),
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
