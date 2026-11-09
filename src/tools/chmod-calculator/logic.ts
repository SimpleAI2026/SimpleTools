export type Who = 'owner' | 'group' | 'other'
export type Perm = 'r' | 'w' | 'x'
export type PermMatrix = Record<Who, Record<Perm, boolean>>
export interface Special {
  setuid: boolean
  setgid: boolean
  sticky: boolean
}
export const WHO: Who[] = ['owner', 'group', 'other']
const BITS: Record<Perm, number> = { r: 4, w: 2, x: 1 }

export function emptyMatrix(): PermMatrix {
  return { owner: { r: false, w: false, x: false }, group: { r: false, w: false, x: false }, other: { r: false, w: false, x: false } }
}

export function toOctal(m: PermMatrix, s: Special = { setuid: false, setgid: false, sticky: false }): string {
  const special = (s.setuid ? 4 : 0) + (s.setgid ? 2 : 0) + (s.sticky ? 1 : 0)
  const digits = WHO.map((w) => (['r', 'w', 'x'] as Perm[]).reduce((n, p) => n + (m[w][p] ? BITS[p] : 0), 0)).join('')
  return special ? `${special}${digits}` : digits
}

export function fromOctal(oct: string): { matrix: PermMatrix; special: Special } | null {
  if (!/^[0-7]{3,4}$/.test(oct.trim())) return null
  const s = oct.trim().padStart(4, '0')
  const sp = Number(s[0])
  const matrix = emptyMatrix()
  WHO.forEach((w, i) => {
    const d = Number(s[i + 1])
    matrix[w] = { r: !!(d & 4), w: !!(d & 2), x: !!(d & 1) }
  })
  return { matrix, special: { setuid: !!(sp & 4), setgid: !!(sp & 2), sticky: !!(sp & 1) } }
}

export function toSymbolic(m: PermMatrix, s: Special = { setuid: false, setgid: false, sticky: false }): string {
  const sx = (who: Who, flag: boolean, ch: string) => (flag ? (m[who].x ? ch : ch.toUpperCase()) : m[who].x ? 'x' : '-')
  return (
    (m.owner.r ? 'r' : '-') + (m.owner.w ? 'w' : '-') + sx('owner', s.setuid, 's') +
    (m.group.r ? 'r' : '-') + (m.group.w ? 'w' : '-') + sx('group', s.setgid, 's') +
    (m.other.r ? 'r' : '-') + (m.other.w ? 'w' : '-') + sx('other', s.sticky, 't')
  )
}

export function fromSymbolic(sym: string): { matrix: PermMatrix; special: Special } | null {
  const s = sym.trim().replace(/^[-dlcbps]?(?=[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$)/, '')
  if (!/^[r-][w-][xsS-][r-][w-][xsS-][r-][w-][xtT-]$/.test(s)) return null
  const matrix = emptyMatrix()
  WHO.forEach((w, i) => {
    const part = s.slice(i * 3, i * 3 + 3)
    matrix[w] = { r: part[0] === 'r', w: part[1] === 'w', x: /[xst]/.test(part[2] as string) }
  })
  return { matrix, special: { setuid: /[sS]/.test(s[2] as string), setgid: /[sS]/.test(s[5] as string), sticky: /[tT]/.test(s[8] as string) } }
}
