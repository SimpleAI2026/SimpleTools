import { describe, expect, it } from 'vitest'
import { XLSX_MIME, readSpreadsheet } from './excel'
import { loadSampleExcel } from './sampleExcel'

describe('loadSampleExcel', () => {
  it('returns a non-empty xlsx File with Demo sheet', async () => {
    const file = await loadSampleExcel()
    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('simpletools-sample.xlsx')
    expect(file.type).toBe(XLSX_MIME)
    expect(file.size).toBeGreaterThan(100)
    const sheets = await readSpreadsheet(await file.arrayBuffer(), file.name)
    expect(sheets[0]?.name).toBe('Demo')
    expect(sheets[0]?.rows[0]).toEqual(['Name', 'Category', 'Offline', 'Notes'])
    expect(sheets[0]?.rows.length).toBeGreaterThanOrEqual(4)
  })
})
