import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { lookupOui, parseOuiTable } from './logic'

describe('oui lookup', () => {
  it('reads a prefix from a small table', () => {
    const table = parseOuiTable('# comment\n286FB9\tNokia Shanghai Bell Co., Ltd.\n')
    expect(lookupOui('28:6F:B9:00:11:22', table)).toEqual({ prefix: '28:6F:B9', vendor: 'Nokia Shanghai Bell Co., Ltd.' })
    expect(lookupOui('00:00', table)).toBeNull()
  })

  it('includes the committed IEEE MA-L snapshot', () => {
    const table = parseOuiTable(readFileSync(new URL('./oui.txt', import.meta.url), 'utf8'))
    expect(table.size).toBeGreaterThan(30000)
    expect(lookupOui('286FB9AABBCC', table)?.vendor).toContain('Nokia')
  })
})
