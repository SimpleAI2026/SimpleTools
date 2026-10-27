export type ToolFormat = 'mcp' | 'openai' | 'anthropic'
export type ParamType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'

export interface ParamRow {
  name: string
  type: ParamType
  description: string
  required: boolean
}

export interface ToolDefInput {
  name: string
  description: string
  params: ParamRow[]
}

export const MCP_NAME_RE = /^[a-zA-Z0-9_-]{1,64}$/

export function validateToolName(name: string): string | null {
  const n = name.trim()
  if (!n) return 'empty'
  if (!MCP_NAME_RE.test(n)) return 'pattern'
  return null
}

export function rowsToJsonSchema(params: ParamRow[]): Record<string, unknown> {
  const properties: Record<string, unknown> = {}
  const required: string[] = []
  for (const p of params) {
    const key = p.name.trim()
    if (!key) continue
    const prop: Record<string, unknown> = { type: p.type }
    if (p.description.trim()) prop.description = p.description.trim()
    if (p.type === 'array') prop.items = { type: 'string' }
    properties[key] = prop
    if (p.required) required.push(key)
  }
  const schema: Record<string, unknown> = { type: 'object', properties }
  if (required.length) schema.required = required
  return schema
}

export function toMcpTool(input: ToolDefInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    inputSchema: rowsToJsonSchema(input.params),
  }
}

export function toOpenAiTool(input: ToolDefInput): Record<string, unknown> {
  return {
    type: 'function',
    function: {
      name: input.name.trim(),
      description: input.description.trim(),
      parameters: rowsToJsonSchema(input.params),
    },
  }
}

/** OpenAI Chat Completions tools[] entry (type:function) — also emit tools API shape alias. */
export function toOpenAiFunction(input: ToolDefInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    parameters: rowsToJsonSchema(input.params),
  }
}

export function toAnthropicTool(input: ToolDefInput): Record<string, unknown> {
  return {
    name: input.name.trim(),
    description: input.description.trim(),
    input_schema: rowsToJsonSchema(input.params),
  }
}

export function exportTool(input: ToolDefInput, format: ToolFormat): string {
  const obj = format === 'mcp' ? toMcpTool(input) : format === 'openai' ? toOpenAiTool(input) : toAnthropicTool(input)
  return JSON.stringify(obj, null, 2)
}

function schemaToRows(schema: unknown): ParamRow[] {
  if (!schema || typeof schema !== 'object') return []
  const s = schema as Record<string, unknown>
  const props = (s.properties && typeof s.properties === 'object' ? s.properties : {}) as Record<string, unknown>
  const req = new Set(Array.isArray(s.required) ? s.required.filter((x): x is string => typeof x === 'string') : [])
  return Object.entries(props).map(([name, raw]) => {
    const p = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
    const type = (typeof p.type === 'string' ? p.type : 'string') as ParamType
    return {
      name,
      type: (['string', 'number', 'integer', 'boolean', 'array', 'object'] as ParamType[]).includes(type) ? type : 'string',
      description: typeof p.description === 'string' ? p.description : '',
      required: req.has(name),
    }
  })
}

export interface ParsedTool {
  name: string
  description: string
  params: ParamRow[]
  source: ToolFormat
}

export function parseToolJson(raw: string): ParsedTool {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('json')
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('shape')
  const o = parsed as Record<string, unknown>

  // OpenAI tools[] entry
  if (o.type === 'function' && o.function && typeof o.function === 'object') {
    const fn = o.function as Record<string, unknown>
    return {
      name: String(fn.name ?? ''),
      description: String(fn.description ?? ''),
      params: schemaToRows(fn.parameters),
      source: 'openai',
    }
  }
  // OpenAI bare function
  if (typeof o.name === 'string' && o.parameters && !o.inputSchema && !o.input_schema) {
    return {
      name: o.name,
      description: String(o.description ?? ''),
      params: schemaToRows(o.parameters),
      source: 'openai',
    }
  }
  // Anthropic
  if (typeof o.name === 'string' && o.input_schema) {
    return {
      name: o.name,
      description: String(o.description ?? ''),
      params: schemaToRows(o.input_schema),
      source: 'anthropic',
    }
  }
  // MCP
  if (typeof o.name === 'string' && o.inputSchema) {
    return {
      name: o.name,
      description: String(o.description ?? ''),
      params: schemaToRows(o.inputSchema),
      source: 'mcp',
    }
  }
  throw new Error('shape')
}

export function convertToolJson(raw: string): { mcp: string; openai: string; anthropic: string; source: ToolFormat } {
  const p = parseToolJson(raw)
  const input: ToolDefInput = { name: p.name, description: p.description, params: p.params }
  return {
    source: p.source,
    mcp: exportTool(input, 'mcp'),
    openai: exportTool(input, 'openai'),
    anthropic: exportTool(input, 'anthropic'),
  }
}

export function emptyParam(): ParamRow {
  return { name: '', type: 'string', description: '', required: false }
}

export function sampleTool(): ToolDefInput {
  return {
    name: 'get_weather',
    description: 'Get current weather for a city',
    params: [
      { name: 'city', type: 'string', description: 'City name', required: true },
      { name: 'unit', type: 'string', description: 'celsius or fahrenheit', required: false },
    ],
  }
}
