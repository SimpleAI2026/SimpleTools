import { parseCsv } from '@/lib/csv'

export type SqlFlavor = 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver'
export interface CsvToSqlOptions {
  table: string
  flavor: SqlFlavor
  createTable: boolean
  batchSize: number
  emptyAsNull: boolean
}

export function quoteIdent(name: string, f: SqlFlavor): string {
  if (f === 'mysql') return `\`${name.replace(/`/g, '``')}\``
  if (f === 'sqlserver') return `[${name.replace(/]/g, ']]')}]`
  return `"${name.replace(/"/g, '""')}"`
}

export type ColType = 'integer' | 'decimal' | 'boolean' | 'date' | 'text'

export function inferType(values: string[]): ColType {
  const v = values.filter((x) => x !== '')
  if (!v.length) return 'text'
  if (v.every((x) => /^-?\d{1,18}$/.test(x))) return 'integer'
  if (v.every((x) => /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(x))) return 'decimal'
  if (v.every((x) => /^(true|false)$/i.test(x))) return 'boolean'
  if (v.every((x) => /^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/.test(x))) return 'date'
  return 'text'
}

function sqlType(t: ColType, f: SqlFlavor, maxLen: number): string {
  switch (t) {
    case 'integer':
      return f === 'sqlite' ? 'INTEGER' : 'BIGINT'
    case 'decimal':
      return f === 'sqlite' ? 'REAL' : f === 'mysql' ? 'DOUBLE' : f === 'sqlserver' ? 'FLOAT' : 'DOUBLE PRECISION'
    case 'boolean':
      return f === 'sqlserver' ? 'BIT' : f === 'sqlite' ? 'INTEGER' : 'BOOLEAN'
    case 'date':
      return f === 'sqlite' ? 'TEXT' : f === 'sqlserver' ? 'DATETIME2' : 'TIMESTAMP'
    default:
      return maxLen > 255 || f === 'sqlite' ? 'TEXT' : `VARCHAR(${Math.max(1, maxLen)})`
  }
}

function literal(v: string, t: ColType, f: SqlFlavor, emptyAsNull: boolean): string {
  if (v === '' && (emptyAsNull || t !== 'text')) return 'NULL'
  if (t === 'integer' || t === 'decimal') return v
  if (t === 'boolean') return f === 'sqlite' || f === 'sqlserver' ? (/^true$/i.test(v) ? '1' : '0') : v.toUpperCase()
  return `'${v.replace(/'/g, "''")}'`
}

export function csvToSql(text: string, o: CsvToSqlOptions): string {
  const { rows } = parseCsv(text)
  if (rows.length < 1) return ''
  const header = rows[0]!.map((h, i) => h.trim() || `column_${i + 1}`)
  const data = rows.slice(1).map((r) => header.map((_, i) => r[i] ?? ''))
  const types = header.map((_, i) => inferType(data.map((r) => r[i]!)))
  const table = quoteIdent(o.table || 'my_table', o.flavor)
  const cols = header.map((h) => quoteIdent(h, o.flavor)).join(', ')
  const out: string[] = []
  if (o.createTable) {
    const defs = header.map((h, i) => `  ${quoteIdent(h, o.flavor)} ${sqlType(types[i]!, o.flavor, Math.max(0, ...data.map((r) => r[i]!.length)))}`)
    out.push(`CREATE TABLE ${table} (\n${defs.join(',\n')}\n);`)
  }
  const size = Math.max(1, o.batchSize)
  for (let i = 0; i < data.length; i += size) {
    const values = data.slice(i, i + size).map((r) => `(${r.map((v, j) => literal(v, types[j]!, o.flavor, o.emptyAsNull)).join(', ')})`)
    out.push(`INSERT INTO ${table} (${cols}) VALUES\n${values.join(',\n')};`)
  }
  return out.join('\n\n')
}
