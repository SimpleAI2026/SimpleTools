export const SQL_DIALECTS = ['sql', 'mysql', 'postgresql', 'sqlite', 'mariadb', 'tsql', 'plsql', 'bigquery', 'snowflake', 'spark'] as const
export type SqlDialect = (typeof SQL_DIALECTS)[number]
export type KeywordCase = 'upper' | 'lower' | 'preserve'

export interface SqlOptions {
  dialect: SqlDialect
  keywordCase: KeywordCase
  tabWidth: number
}

export async function formatSql(sql: string, o: SqlOptions): Promise<string> {
  const { format } = await import('sql-formatter')
  return format(sql, { language: o.dialect, keywordCase: o.keywordCase, tabWidth: o.tabWidth })
}

/** Collapse a query to a single line, keeping string literals intact and dropping comments. */
export function minifySql(sql: string): string {
  const re = /('(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`)|(--[^\n]*|\/\*[\s\S]*?\*\/)|([^'"`/-]+|[/-])/g
  const saved: string[] = []
  let out = ''
  let m: RegExpExecArray | null
  while ((m = re.exec(sql))) {
    if (m[1]) out += `\uE000${saved.push(m[1]) - 1}\uE000`
    else if (m[2]) out += ' '
    else out += m[3]!.replace(/\s+/g, ' ')
  }
  return out.replace(/\s*([(),;])\s*/g, (_s, c: string) => (c === ',' ? ', ' : c)).replace(/\s+/g, ' ').trim().replace(/\uE000(\d+)\uE000/g, (_m, i: string) => saved[Number(i)]!)
}
