import { describe, expect, it } from 'vitest'
import { formatSql, minifySql } from './logic'

describe('sql-formatter', () => {
  it('formats', async () => {
    const out = await formatSql('select a,b from t where x=1', { dialect: 'sql', keywordCase: 'upper', tabWidth: 2 })
    expect(out).toBe('SELECT\n  a,\n  b\nFROM\n  t\nWHERE\n  x = 1')
  })
  it('minifies keeping strings', () => {
    expect(minifySql("SELECT a ,  b -- c\nFROM t\nWHERE s = 'x  -- y' /* z */ ;")).toBe("SELECT a, b FROM t WHERE s = 'x  -- y';")
  })
})
