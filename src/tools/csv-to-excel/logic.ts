import { parseCsv } from '@/lib/csv'
import { coerce, type CellInput } from '@/lib/excel'

export interface CsvToExcelOptions {
  delimiter: string // '' = auto
  inferTypes: boolean
  header: boolean
}

export function csvToRows(text: string, o: CsvToExcelOptions): CellInput[][] {
  const { rows } = parseCsv(text, o.delimiter)
  return rows.map((r, i) => (o.inferTypes && !(o.header && i === 0) ? r.map(coerce) : r))
}
