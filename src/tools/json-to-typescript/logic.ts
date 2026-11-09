export interface JsonToTsOptions {
  rootName: string
  useType: boolean
  exportDecl: boolean
  readonly: boolean
}

const pascal = (s: string) =>
  s
    .replace(/[^A-Za-z0-9]+(.)?/g, (_m, c: string | undefined) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase())
    .replace(/^(\d)/, '_$1') || 'Item'

const singular = (s: string) => (/ies$/i.test(s) ? s.slice(0, -3) + 'y' : /ses$/i.test(s) ? s.slice(0, -2) : /s$/i.test(s) && s.length > 1 ? s.slice(0, -1) : s + 'Item')

const safeKey = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k))

/** Infer TypeScript declarations from a JSON sample; object samples in arrays are merged (missing keys become optional). */
export function jsonToTs(json: string, o: JsonToTsOptions): string {
  const data: unknown = JSON.parse(json)
  const decls: string[] = []
  const used = new Set<string>()
  const signatures = new Map<string, string>()

  const uniqueName = (hint: string) => {
    const base = pascal(hint)
    let n = base
    for (let i = 2; used.has(n); i++) n = base + i
    used.add(n)
    return n
  }

  function objectType(samples: Record<string, unknown>[], hint: string): string {
    const keys: string[] = []
    for (const s of samples) for (const k of Object.keys(s)) if (!keys.includes(k)) keys.push(k)
    const fields = keys.map((k) => {
      const present = samples.filter((s) => k in s).map((s) => s[k])
      const optional = present.length < samples.length
      return `  ${o.readonly ? 'readonly ' : ''}${safeKey(k)}${optional ? '?' : ''}: ${typeOf(present, k)}`
    })
    const body = fields.join('\n')
    const existing = signatures.get(body)
    if (existing) return existing
    const name = uniqueName(hint)
    signatures.set(body, name)
    const ex = o.exportDecl ? 'export ' : ''
    decls.push(o.useType ? `${ex}type ${name} = {\n${body}\n}` : `${ex}interface ${name} {\n${body}\n}`)
    return name
  }

  function typeOf(values: unknown[], hint: string): string {
    const types: string[] = []
    const add = (t: string) => !types.includes(t) && types.push(t)
    const objects = values.filter((v): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v))
    const arrays = values.filter((v): v is unknown[] => Array.isArray(v))
    for (const v of values) {
      if (v === null) add('null')
      else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') add(typeof v)
    }
    if (objects.length) add(objectType(objects, hint))
    if (arrays.length) {
      const items = arrays.flat()
      const inner = items.length ? typeOf(items, singular(hint)) : 'unknown'
      add(inner.includes(' | ') ? `(${inner})[]` : `${inner}[]`)
    }
    return types.length ? types.join(' | ') : 'unknown'
  }

  const root = typeOf([data], o.rootName || 'Root')
  const rootName = pascal(o.rootName || 'Root')
  if (!used.has(rootName) || root !== rootName) {
    const ex = o.exportDecl ? 'export ' : ''
    decls.push(`${ex}type ${used.has(rootName) ? rootName + 'Root' : rootName} = ${root}`)
  }
  // root first, nested declarations after
  return decls.reverse().join('\n\n')
}
