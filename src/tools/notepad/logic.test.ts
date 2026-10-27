import { describe, expect, it } from 'vitest'
import { displayTitle, newNote, noteFilename, sanitizeNotes, sortNotes } from './logic'

describe('notepad', () => {
  it('titles', () => {
    const n = { ...newNote(1, 'x'), body: '\n  First line  \nsecond' }
    expect(displayTitle(n, 'Untitled')).toBe('First line')
    expect(displayTitle(newNote(1, 'y'), 'Untitled')).toBe('Untitled')
    expect(displayTitle({ ...n, title: 'T' }, '')).toBe('T')
    expect(displayTitle({ ...n, body: 'a'.repeat(50) }, '')).toHaveLength(41)
  })
  it('sorts and sanitizes', () => {
    const a = newNote(1, 'a')
    const b = newNote(2, 'b')
    expect(sortNotes([a, b]).map((n) => n.id)).toEqual(['b', 'a'])
    expect(sanitizeNotes([a, { id: 1 }, null])).toEqual([a])
    expect(sanitizeNotes('x')).toEqual([])
  })
  it('filenames', () => {
    expect(noteFilename({ ...newNote(1, 'a'), body: 'a/b:c?' })).toBe('abc.txt')
    expect(noteFilename(newNote(1, 'a'))).toBe('note.txt')
  })
})
