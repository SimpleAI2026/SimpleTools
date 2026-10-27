/** Rows (after the header row) containing the query, case-insensitive. Header row is always kept. */
export function filterRows(rows: string[][], query: string, keepHeader = true): string[][] {
  const q = query.trim().toLowerCase()
  if (!q) return rows
  const [head, ...rest] = rows
  const hit = (keepHeader ? rest : rows).filter((r) => r.some((c) => c.toLowerCase().includes(q)))
  return keepHeader && head ? [head, ...hit] : hit
}

export function sheetStats(rows: string[][]) {
  return { rows: rows.length, cols: Math.max(0, ...rows.map((r) => r.length)), filled: rows.reduce((s, r) => s + r.filter((c) => c !== '').length, 0) }
}
