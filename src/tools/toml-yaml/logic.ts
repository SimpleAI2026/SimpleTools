import { parse as parseToml, stringify as stringifyToml } from 'smol-toml'
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

export function tomlToYaml(input: string): string {
  const value = parseToml(input)
  return stringifyYaml(value, { lineWidth: 0 })
}

export function yamlToToml(input: string): string {
  const value = parseYaml(input) as unknown
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('root-object')
  return stringifyToml(value as Record<string, unknown>)
}
