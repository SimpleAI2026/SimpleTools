import { describe, expect, it } from 'vitest'
import { csvToSql, inferType, quoteIdent } from './logic'

const o = { table: 'people', flavor: 'postgresql' as const, createTable: true, batchSize: 100, emptyAsNull: true }
describe('csv-to-sql', () => {
  it('infers types', () => {
    expect(inferType(['1', '-2', ''])).toBe('integer')
    expect(inferType(['1.5', '2'])).toBe('decimal')
    expect(inferType(['TRUE', 'false'])).toBe('boolean')
    expect(inferType(['2026-01-02', '2026-03-04 10:00'])).toBe('date')
    expect(inferType(['x', '1'])).toBe('text')
  })
  it('quotes identifiers', () => {
    expect(quoteIdent('a`b', 'mysql')).toBe('`a``b`')
    expect(quoteIdent('a]', 'sqlserver')).toBe('[a]]]')
  })
  it('generates create + insert', () => {
    expect(csvToSql("id,name,ok\n1,O'Neil,true\n2,,false", o)).toBe(
      'CREATE TABLE "people" (\n  "id" BIGINT,\n  "name" VARCHAR(6),\n  "ok" BOOLEAN\n);\n\nINSERT INTO "people" ("id", "name", "ok") VALUES\n(1, \'O\'\'Neil\', TRUE),\n(2, NULL, FALSE);',
    )
  })
  it('batches inserts', () => {
    const sql = csvToSql('a\n1\n2\n3', { ...o, createTable: false, batchSize: 2, flavor: 'sqlite' })
    expect(sql.match(/INSERT/g)).toHaveLength(2)
  })
})
