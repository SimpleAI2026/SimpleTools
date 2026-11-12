import { stringify } from 'yaml'

export type WarningCode = 'ignored-rm' | 'env-file' | 'publish-all' | 'bare-env' | 'unknown-flag'

export interface DockerWarning {
  code: WarningCode
  detail: string
}

export interface DockerService {
  key: string
  spec: Record<string, unknown>
  warnings: DockerWarning[]
}

const VALUE_FLAGS = new Set([
  'name', 'publish', 'p', 'volume', 'v', 'env', 'e', 'env-file', 'workdir', 'w', 'user', 'u',
  'entrypoint', 'restart', 'network', 'net', 'hostname', 'h', 'memory', 'm', 'cpus', 'label', 'l',
  'add-host', 'mount', 'pull', 'platform',
])
const BOOL_FLAGS = new Set(['d', 'detach', 't', 'tty', 'i', 'interactive', 'rm', 'privileged', 'read-only', 'P', 'publish-all', 'init'])

export function tokenizeCommand(input: string): string[] {
  const source = input.replace(/\\\r?\n/g, ' ')
  const out: string[] = []
  let i = 0
  while (i < source.length) {
    const current = source[i]
    if (current === ' ' || current === '\t' || current === '\n' || current === '\r') {
      i++
      continue
    }
    if (current === '"' || current === "'") {
      const quote = current
      i++
      let buf = ''
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\' && quote === '"' && i + 1 < source.length) {
          i++
          buf += source[i] ?? ''
        } else buf += source[i] ?? ''
        i++
      }
      i++
      out.push(buf)
      continue
    }
    let buf = ''
    while (i < source.length && !/\s/.test(source[i] ?? '')) buf += source[i++] ?? ''
    if (buf) out.push(buf)
  }
  return out
}

function serviceKey(name: string, index: number): string {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return cleaned || `app${index + 1}`
}

function pushList(spec: Record<string, unknown>, key: string, value: string) {
  const list = (spec[key] as string[] | undefined) ?? []
  list.push(value)
  spec[key] = list
}

function setEnv(spec: Record<string, unknown>, raw: string, warnings: DockerWarning[]) {
  const eq = raw.indexOf('=')
  if (eq <= 0) {
    warnings.push({ code: 'bare-env', detail: raw })
    return
  }
  const env = (spec.environment as Record<string, string> | undefined) ?? {}
  env[raw.slice(0, eq)] = raw.slice(eq + 1)
  spec.environment = env
}

function setLabel(spec: Record<string, unknown>, raw: string) {
  const eq = raw.indexOf('=')
  const labels = (spec.labels as Record<string, string> | undefined) ?? {}
  if (eq <= 0) labels[raw] = ''
  else labels[raw.slice(0, eq)] = raw.slice(eq + 1)
  spec.labels = labels
}

function applyFlag(name: string, value: string | undefined, spec: Record<string, unknown>, warnings: DockerWarning[]) {
  switch (name) {
    case 'name':
      spec.container_name = value
      break
    case 'p':
    case 'publish':
      if (value) pushList(spec, 'ports', value)
      break
    case 'v':
    case 'volume':
    case 'mount':
      if (value) pushList(spec, 'volumes', value)
      break
    case 'e':
    case 'env':
      if (value) setEnv(spec, value, warnings)
      break
    case 'env-file':
      warnings.push({ code: 'env-file', detail: value ?? '' })
      break
    case 'w':
    case 'workdir':
      spec.working_dir = value
      break
    case 'u':
    case 'user':
      spec.user = value
      break
    case 'entrypoint':
      spec.entrypoint = value
      break
    case 'restart':
      spec.restart = value
      break
    case 'network':
    case 'net':
      if (value === 'host' || value === 'bridge' || value === 'none') spec.network_mode = value
      else if (value) pushList(spec, 'networks', value)
      break
    case 'h':
    case 'hostname':
      spec.hostname = value
      break
    case 'm':
    case 'memory':
      spec.mem_limit = value
      break
    case 'cpus':
      spec.cpus = value
      break
    case 'l':
    case 'label':
      if (value) setLabel(spec, value)
      break
    case 'add-host':
      if (value) pushList(spec, 'extra_hosts', value)
      break
    case 't':
    case 'tty':
      spec.tty = true
      break
    case 'i':
    case 'interactive':
      spec.stdin_open = true
      break
    case 'privileged':
      spec.privileged = true
      break
    case 'read-only':
      spec.read_only = true
      break
    case 'init':
      spec.init = true
      break
    case 'rm':
      warnings.push({ code: 'ignored-rm', detail: '' })
      break
    case 'P':
    case 'publish-all':
      warnings.push({ code: 'publish-all', detail: '' })
      break
    case 'd':
    case 'detach':
    case 'pull':
    case 'platform':
      break
    default:
      warnings.push({ code: 'unknown-flag', detail: name })
  }
}

function readFlag(tokens: string[], index: number): { next: number; names: string[]; value?: string } | null {
  const token = tokens[index] ?? ''
  if (!token.startsWith('-') || token === '-') return null
  if (token.startsWith('--')) {
    const body = token.slice(2)
    const eq = body.indexOf('=')
    const name = eq >= 0 ? body.slice(0, eq) : body
    if (!name) return null
    if (eq >= 0) return { next: index + 1, names: [name], value: body.slice(eq + 1) }
    if (VALUE_FLAGS.has(name)) return { next: index + 2, names: [name], value: tokens[index + 1] }
    return { next: index + 1, names: [name] }
  }
  const cluster = token.slice(1)
  const first = cluster[0] ?? ''
  if (cluster.length > 1 && VALUE_FLAGS.has(first)) return { next: index + 1, names: [first], value: cluster.slice(1) }
  const names = [...cluster]
  const takes = names.length === 1 && VALUE_FLAGS.has(names[0] ?? '')
  return { next: takes ? index + 2 : index + 1, names, value: takes ? tokens[index + 1] : undefined }
}

export function parseDockerRun(line: string, index = 0): DockerService | { error: 'empty' | 'not-run' | 'no-image' } {
  const tokens = tokenizeCommand(line)
  if (!tokens.length) return { error: 'empty' }
  let cursor = 0
  if (tokens[cursor] === 'docker' || tokens[cursor] === 'podman') cursor++
  if (tokens[cursor] !== 'run') return { error: 'not-run' }
  cursor++
  const spec: Record<string, unknown> = {}
  const warnings: DockerWarning[] = []
  while (cursor < tokens.length) {
    const flag = readFlag(tokens, cursor)
    if (!flag) break
    if (flag.value === undefined && flag.names.length === 1 && VALUE_FLAGS.has(flag.names[0] ?? '')) return { error: 'no-image' }
    for (const name of flag.names) {
      if (!VALUE_FLAGS.has(name) && !BOOL_FLAGS.has(name)) warnings.push({ code: 'unknown-flag', detail: name })
      else if (flag.names.length === 1 || BOOL_FLAGS.has(name)) applyFlag(name, flag.names.length === 1 ? flag.value : undefined, spec, warnings)
    }
    cursor = flag.next
  }
  const image = tokens[cursor]
  if (!image || image.startsWith('-')) return { error: 'no-image' }
  spec.image = image
  const command = tokens.slice(cursor + 1)
  if (command.length) spec.command = command
  const named = typeof spec.container_name === 'string' ? spec.container_name : image.split('/').at(-1)?.split(':')[0] ?? ''
  return { key: serviceKey(named, index), spec, warnings }
}

export function dockerRunToCompose(input: string): { yaml: string; warnings: DockerWarning[]; error: '' | 'empty' | 'not-run' | 'no-image' } {
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
  if (!lines.length) return { yaml: '', warnings: [], error: 'empty' }
  const services: Record<string, Record<string, unknown>> = {}
  const warnings: DockerWarning[] = []
  lines.forEach((line, index) => {
    const parsed = parseDockerRun(line, index)
    if ('error' in parsed) throw new Error(parsed.error)
    let key = parsed.key
    let n = 2
    while (services[key]) key = `${parsed.key}-${n++}`
    services[key] = parsed.spec
    warnings.push(...parsed.warnings)
  })
  return { yaml: stringify({ services }).trimEnd() + '\n', warnings, error: '' }
}

export function convertDockerRun(input: string): { yaml: string; warnings: DockerWarning[]; error: '' | 'empty' | 'not-run' | 'no-image' } {
  try {
    return dockerRunToCompose(input)
  } catch (error) {
    const code = error instanceof Error && (error.message === 'not-run' || error.message === 'no-image') ? error.message : 'not-run'
    return { yaml: '', warnings: [], error: code }
  }
}
