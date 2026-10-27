import Papa from 'papaparse'

export interface CsvParseResult {
  rows: string[][]
  delimiter: string
}

/** Parse CSV/TSV text; delimiter '' means auto-detect. Throws on malformed quoting. */
export function parseCsv(text: string, delimiter = ''): CsvParseResult {
  const r = Papa.parse<string[]>(text.replace(/^\uFEFF/, ''), { delimiter, skipEmptyLines: 'greedy' })
  const fatal = r.errors.find((e) => e.type === 'Quotes')
  if (fatal) throw new Error(`Row ${(fatal.row ?? 0) + 1}: ${fatal.message}`)
  return { rows: r.data, delimiter: r.meta.delimiter }
}

export function stringifyCsv(rows: string[][], delimiter = ',', quoteAll = false): string {
  return Papa.unparse(rows, { delimiter, quotes: quoteAll, newline: '\n' })
}
