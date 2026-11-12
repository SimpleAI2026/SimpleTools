import { parseAllDocuments } from 'yaml'
import { jsonStats, searchJson, type JsonStats } from '@/tools/json-viewer/logic'

export function parseYamlValue(text: string): { ok: true; value: unknown; documents: number } | { ok: false; message: string } {
  const trimmed = text.trim()
  if (!trimmed) return { ok: false, message: 'empty' }
  try {
    const docs = parseAllDocuments(text)
    const failure = docs.flatMap((doc) => doc.errors)[0]
    if (failure) return { ok: false, message: failure.message }
    const values = docs.map((doc) => doc.toJS({ maxAliasCount: 100 }) as unknown)
    const value = values.length <= 1 ? values[0] : values
    return { ok: true, value, documents: values.length }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'invalid' }
  }
}

export function yamlStats(value: unknown): JsonStats {
  return jsonStats(value)
}

export function searchYaml(value: unknown, query: string): string[] {
  return searchJson(value, query)
}
