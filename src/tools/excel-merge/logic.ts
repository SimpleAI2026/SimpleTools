import type { CellInput, SheetData, SheetInput } from '@/lib/excel'

export type MergeMode = 'sheets' | 'stack'

export interface MergeSource {
  file: string
  sheets: SheetData[]
}

/**
 * sheets: every source sheet becomes its own sheet (named "file - sheet" when needed).
 * stack: all rows go into one sheet; with `header`, only the first header is kept and later sources' first rows are skipped.
 */
export function mergeSheets(sources: MergeSource[], mode: MergeMode, header: boolean, addSourceColumn: boolean): SheetInput[] {
  if (mode === 'sheets') {
    return sources.flatMap((src) =>
      src.sheets.map((s) => ({ name: src.sheets.length > 1 ? `${src.file} - ${s.name}` : src.file, rows: s.rows as CellInput[][], header })),
    )
  }
  const rows: CellInput[][] = []
  let first = true
  for (const src of sources)
    for (const s of src.sheets) {
      s.rows.forEach((r, i) => {
        if (header && i === 0) {
          if (!first) return
          rows.push(addSourceColumn ? ['source', ...r] : r)
          return
        }
        rows.push(addSourceColumn ? [`${src.file}${src.sheets.length > 1 ? `/${s.name}` : ''}`, ...r] : r)
      })
      if (s.rows.length) first = false
    }
  return [{ name: 'Merged', rows, header }]
}
