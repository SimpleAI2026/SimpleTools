import { describe, expect, it } from 'vitest'
import { IntakeError, assertTextSize, csvSafeCell, csvToRecords, parseJsonValue, presentResult, readDocument, sha256Hex, toCsv, zipTextFiles, safeZipName, finish, SCHEMA, MAX_TEXT_CHARS } from './core'

describe('workflow intake', () => {
  it('rejects empty, prototype keys, depth, and oversized text', () => {
    expect(() => parseJsonValue('')).toThrow(IntakeError)
    expect(() => parseJsonValue('   ')).toThrowError(expect.objectContaining({ code: 'empty' }))
    expect(() => parseJsonValue('{')).toThrowError(expect.objectContaining({ code: 'invalid-json' }))
    expect(() => parseJsonValue('{"__proto__":{"x":1}}')).toThrowError(expect.objectContaining({ code: 'forbidden-key' }))
    expect(() => parseJsonValue('{"constructor":1}')).toThrowError(expect.objectContaining({ code: 'forbidden-key' }))
    let deep = '0'
    for (let i = 0; i < 40; i++) deep = `{"a":${deep}}`
    expect(() => parseJsonValue(deep)).toThrowError(expect.objectContaining({ code: 'too-deep' }))
    expect(() => assertTextSize('x'.repeat(MAX_TEXT_CHARS + 1))).toThrowError(expect.objectContaining({ code: 'too-large' }))
  })

  it('neutralizes formula prefixes without rewriting numeric literals', () => {
    expect(csvSafeCell('=HYPERLINK("http://evil")')).toBe(`'=HYPERLINK("http://evil")`)
    expect(csvSafeCell('+cmd')).toBe("'+cmd")
    expect(csvSafeCell('-cmd')).toBe("'-cmd")
    expect(csvSafeCell('@sum')).toBe("'@sum")
    expect(csvSafeCell('-12.5')).toBe('-12.5')
    expect(csvSafeCell('+3')).toBe('+3')
    expect(csvSafeCell('100')).toBe('100')
    const csv = toCsv(['id', 'note'], [['1', '=cmd']])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv).toContain("'=cmd")
    expect(csv).not.toMatch(/(^|\n)=cmd/)
  })

  it('parses quoted csv, rejects broken quotes, and reopens an artifact envelope', () => {
    expect(csvToRecords('id,name\n1,"Lee, Ann"\n')).toEqual([{ id: '1', name: 'Lee, Ann' }])
    expect(() => csvToRecords('"unterminated')).toThrowError(expect.objectContaining({ code: 'invalid-csv' }))
    expect(() => csvToRecords('')).toThrowError(expect.objectContaining({ code: 'empty' }))
    const artifact = finish('demo', { rows: [{ id: '1' }] }, 'ok', { n: 1 }, ['id'], [['1']])
    const again = readDocument(JSON.stringify(artifact.json), 'demo')
    expect(again.format).toBe('json')
    expect(again.value).toEqual({ rows: [{ id: '1' }] })
    expect(presentResult(() => { throw new IntakeError('empty') }, '').error).toBe('empty')
  })

  it('hashes known vectors and refuses zip path traversal', () => {
    expect(sha256Hex(new Uint8Array())).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(sha256Hex(new TextEncoder().encode('abc'))).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(safeZipName('a/../b.txt')).toBe('a/b.txt')
    expect(() => safeZipName('..')).toThrow(IntakeError)
    const zipped = zipTextFiles([{ name: '../secret.txt', text: 'no' }, { name: 'ok.txt', text: 'yes' }])
    expect(zipped[0]).toBe(0x50)
    expect(zipped[1]).toBe(0x4b)
    expect(SCHEMA).toContain('simpletools')
  })
})
