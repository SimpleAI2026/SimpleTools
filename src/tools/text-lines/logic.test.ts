import { describe, expect, it } from 'vitest'
import { processLines, type LineOptions } from './logic'

const o: LineOptions = { caseInsensitive: false, prefix: '', suffix: '', filter: '', invertFilter: false }
describe('text-lines', () => {
  it('sorts', () => {
    expect(processLines('b\na\nc', 'sortAsc', o)).toBe('a\nb\nc')
    expect(processLines('b\na\nc', 'sortDesc', o)).toBe('c\nb\na')
    expect(processLines('item10\nitem2\nitem1', 'sortNatural', o)).toBe('item1\nitem2\nitem10')
    expect(processLines('ccc\na\nbb', 'sortLength', o)).toBe('a\nbb\nccc')
  })
  it('transforms', () => {
    expect(processLines('a\nb', 'reverse', o)).toBe('b\na')
    expect(processLines('a\nA\na', 'dedupe', o)).toBe('a\nA')
    expect(processLines('a\nA\na', 'dedupe', { ...o, caseInsensitive: true })).toBe('a')
    expect(processLines('a\n \nb', 'removeEmpty', o)).toBe('a\nb')
    expect(processLines(' a ', 'trim', o)).toBe('a')
    expect(processLines('a\nb', 'number', o)).toBe('1. a\n2. b')
    expect(processLines('a', 'addPrefix', { ...o, prefix: '- ', suffix: ';' })).toBe('- a;')
    expect(processLines('apple\nbanana', 'filter', { ...o, filter: 'an' })).toBe('banana')
    expect(processLines('apple\nbanana', 'filter', { ...o, filter: 'an', invertFilter: true })).toBe('apple')
    expect(processLines('a\nb\nc', 'shuffle', o, () => 0).split('\n').sort()).toEqual(['a', 'b', 'c'])
  })
})
