import { parse, stringify } from 'yaml'

export function jsonToYaml(json: string, indent = 2): string {
  return stringify(JSON.parse(json), { indent, lineWidth: 0 })
}

/** Multi-document YAML becomes a JSON array. */
export function yamlToJson(yamlText: string, indent = 2): string {
  const docs = yamlText.split(/^---\s*$/m).filter((d) => d.trim())
  const values = docs.map((d) => parse(d) as unknown)
  return JSON.stringify(values.length === 1 ? values[0] : values, null, indent)
}
