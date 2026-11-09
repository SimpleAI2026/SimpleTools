export type McpTarget = 'cursor' | 'claude-desktop' | 'generic'
export type ServerTransport = 'stdio' | 'url'

export interface StdioServer {
  command: string
  args?: string[]
  env?: Record<string, string>
}

export interface UrlServer {
  url: string
  headers?: Record<string, string>
}

export type McpServerConfig = StdioServer | UrlServer

export interface McpFormServer {
  name: string
  transport: ServerTransport
  command: string
  argsText: string
  envText: string
  url: string
  headersText: string
}

export interface ValidationIssue {
  path: string
  message: string
}

export function parseArgs(text: string): string[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseEnvOrHeaders(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split(/\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq <= 0) continue
    out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
  return out
}

export function serverFromForm(s: McpFormServer): McpServerConfig {
  if (s.transport === 'url') {
    const headers = parseEnvOrHeaders(s.headersText)
    return Object.keys(headers).length ? { url: s.url.trim(), headers } : { url: s.url.trim() }
  }
  const args = parseArgs(s.argsText)
  const env = parseEnvOrHeaders(s.envText)
  const cfg: StdioServer = { command: s.command.trim() }
  if (args.length) cfg.args = args
  if (Object.keys(env).length) cfg.env = env
  return cfg
}

export function buildMcpConfig(servers: McpFormServer[]): string {
  const mcpServers: Record<string, McpServerConfig> = {}
  for (const s of servers) {
    const name = s.name.trim()
    if (!name) continue
    mcpServers[name] = serverFromForm(s)
  }
  return JSON.stringify({ mcpServers }, null, 2)
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

export function validateMcpJson(raw: string, lang: 'zh' | 'en' = 'en'): ValidationIssue[] {
  const L = lang === 'zh'
  const issues: ValidationIssue[] = []
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    return [{ path: '$', message: L ? `JSON 解析失败：${(e as Error).message}` : `Invalid JSON: ${(e as Error).message}` }]
  }
  if (!isRecord(parsed)) return [{ path: '$', message: L ? '根节点必须是对象' : 'Root must be an object' }]

  let servers: Record<string, unknown> | null = null
  if (isRecord(parsed.mcpServers)) servers = parsed.mcpServers
  else if (isRecord(parsed.mcp) && isRecord(parsed.mcp.servers)) servers = parsed.mcp.servers
  if (!servers) {
    issues.push({ path: 'mcpServers', message: L ? '缺少 mcpServers 对象（或 mcp.servers）' : 'Missing mcpServers object (or mcp.servers)' })
    return issues
  }
  if (!Object.keys(servers).length) {
    issues.push({ path: 'mcpServers', message: L ? 'mcpServers 为空' : 'mcpServers is empty' })
  }
  for (const [name, cfg] of Object.entries(servers)) {
    const p = `mcpServers.${name}`
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(name)) {
      issues.push({ path: p, message: L ? '服务器名需为字母数字/_/-，最长 64' : 'Server name must be alnum/_/-, max 64 chars' })
    }
    if (!isRecord(cfg)) {
      issues.push({ path: p, message: L ? '服务器配置必须是对象' : 'Server config must be an object' })
      continue
    }
    const hasCmd = typeof cfg.command === 'string' && cfg.command.trim().length > 0
    const hasUrl = typeof cfg.url === 'string' && cfg.url.trim().length > 0
    if (hasCmd === hasUrl) {
      issues.push({ path: p, message: L ? '需提供 command（stdio）或 url（远程）二者之一' : 'Provide either command (stdio) or url (remote), not both/neither' })
    }
    if (hasCmd) {
      if (cfg.args !== undefined && !Array.isArray(cfg.args)) issues.push({ path: `${p}.args`, message: L ? 'args 必须是字符串数组' : 'args must be a string array' })
      else if (Array.isArray(cfg.args) && cfg.args.some((a) => typeof a !== 'string')) issues.push({ path: `${p}.args`, message: L ? 'args 项必须是字符串' : 'args entries must be strings' })
      if (cfg.env !== undefined && !isRecord(cfg.env)) issues.push({ path: `${p}.env`, message: L ? 'env 必须是对象' : 'env must be an object' })
    }
    if (hasUrl) {
      try {
        const _u = new URL(String(cfg.url))
        void _u
      } catch {
        issues.push({ path: `${p}.url`, message: L ? 'url 不是合法 URL' : 'url is not a valid URL' })
      }
      if (cfg.headers !== undefined && !isRecord(cfg.headers)) issues.push({ path: `${p}.headers`, message: L ? 'headers 必须是对象' : 'headers must be an object' })
    }
  }
  return issues
}

export function emptyFormServer(): McpFormServer {
  return { name: 'my-server', transport: 'stdio', command: 'npx', argsText: '-y\n@modelcontextprotocol/server-memory', envText: '', url: '', headersText: '' }
}
