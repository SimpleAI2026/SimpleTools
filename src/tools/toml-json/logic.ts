import { parse, stringify } from 'smol-toml'

export function tomlToJson(toml: string, indent = 2): string {
  return JSON.stringify(parse(toml), null, indent)
}

export function jsonToToml(json: string): string {
  const data: unknown = JSON.parse(json)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('TOML root must be an object')
  return stringify(data as Record<string, unknown>)
}
