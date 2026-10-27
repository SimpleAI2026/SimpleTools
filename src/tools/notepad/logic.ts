export interface Note {
  id: string
  title: string
  body: string
  updatedAt: number
}

export function newNote(now = Date.now(), id: string = crypto.randomUUID()): Note {
  return { id, title: '', body: '', updatedAt: now }
}

/** Display title: explicit title, else first non-empty line (trimmed, max 40 chars). */
export function displayTitle(n: Note, fallback: string): string {
  const t = n.title.trim() || n.body.split('\n').find((l) => l.trim())?.trim() || ''
  return t ? (t.length > 40 ? `${t.slice(0, 40)}…` : t) : fallback
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => b.updatedAt - a.updatedAt)
}

export function sanitizeNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (n): n is Note => !!n && typeof n === 'object' && typeof n.id === 'string' && typeof n.body === 'string' && typeof n.title === 'string' && typeof n.updatedAt === 'number',
  )
}

export function noteFilename(n: Note): string {
  const base = displayTitle(n, 'note').replace(/[\\/:*?"<>|\n…]+/g, '').trim().slice(0, 40) || 'note'
  return `${base}.txt`
}
