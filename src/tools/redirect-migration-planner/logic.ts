import { finish, presentResult, rowsOf, str, toCsv, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '{"rows":[{"from":"https://ex.com/a","to":"https://ex.com/b","status":"301"},{"from":"https://ex.com/b","to":"https://ex.com/a","status":"302"},{"from":"https://ex.com/c","to":"https://ex.com/d","status":"999"}]}'

export function run(input: string) {
  const { rows } = rowsOf(input, 'redirect-migration-planner', ['rows', 'redirects'])
  if (rows.length === 0) throw new Error('empty')
  const edges = rows.map((row) => ({ from: str(row.from).trim(), to: str(row.to).trim(), status: str(row.status).trim() }))
  const issues: { from: string; code: string; detail: string }[] = []
  const byFrom = new Map<string, string[]>()
  for (const edge of edges) {
    if (!edge.from) issues.push({ from: edge.from, code: 'missing-source', detail: edge.from })
    if (!edge.to) issues.push({ from: edge.from, code: 'missing-target', detail: edge.from })
    if (!['301', '302', '307', '308'].includes(edge.status)) issues.push({ from: edge.from, code: 'unknown-status', detail: edge.status || 'blank' })
    byFrom.set(edge.from, [...(byFrom.get(edge.from) ?? []), edge.to])
  }
  for (const [from, targets] of byFrom) {
    if (new Set(targets.filter(Boolean)).size > 1) issues.push({ from, code: 'conflict', detail: targets.join('|') })
  }
  const known = new Set(edges.map((edge) => edge.from))
  for (const edge of edges) {
    if (edge.to && known.has(edge.to) && edge.to !== edge.from) issues.push({ from: edge.from, code: 'chain', detail: edge.to })
    if (edge.to && edge.to === edge.from) issues.push({ from: edge.from, code: 'cycle', detail: edge.from })
  }
  const color = new Map<string, number>()
  const cyclic = new Set<string>()
  const visit = (id: string): void => {
    const state = color.get(id) ?? 0
    if (state === 2) return
    if (state === 1) {
      cyclic.add(id)
      return
    }
    color.set(id, 1)
    for (const next of new Set((byFrom.get(id) ?? []).filter(Boolean))) {
      if ((color.get(next) ?? 0) === 1) {
        cyclic.add(id)
        cyclic.add(next)
      }
      visit(next)
    }
    color.set(id, 2)
  }
  for (const from of byFrom.keys()) visit(from)
  for (const from of cyclic) {
    if (!issues.some((issue) => issue.from === from && issue.code === 'cycle')) issues.push({ from, code: 'cycle', detail: from })
  }
  const deploymentMap = toCsv(['from', 'to', 'status'], edges.map((edge) => [edge.from, edge.to, edge.status]))
  return finish(
    'redirect-migration-planner',
    { rows },
    'This is a review table, not a server config. Cycles, chains, and unknown status codes stay visible. No request was sent.',
    { redirects: edges.length, issues },
    ['from', 'code', 'detail'],
    issues.map((issue) => [issue.from, issue.code, issue.detail]),
    [{ name: 'redirect-map.csv', text: deploymentMap }],
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
