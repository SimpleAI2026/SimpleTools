import { describe, expect, it } from 'vitest'
import { fromOctal, fromSymbolic, toOctal, toSymbolic } from './logic'

describe('chmod-calculator', () => {
  it('octal round-trip', () => {
    const r = fromOctal('755')
    expect(r && toSymbolic(r.matrix, r.special)).toBe('rwxr-xr-x')
    expect(r && toOctal(r.matrix, r.special)).toBe('755')
    expect(fromOctal('789')).toBeNull()
  })
  it('special bits', () => {
    const r = fromOctal('4755')
    expect(r && toSymbolic(r.matrix, r.special)).toBe('rwsr-xr-x')
    const t = fromOctal('1777')
    expect(t && toSymbolic(t.matrix, t.special)).toBe('rwxrwxrwt')
    const s = fromSymbolic('rw-r-Sr-T')
    expect(s && toOctal(s.matrix, s.special)).toBe('3644')
  })
  it('symbolic parsing with file type prefix', () => {
    const r = fromSymbolic('-rw-r--r--')
    expect(r && toOctal(r.matrix, r.special)).toBe('644')
    expect(fromSymbolic('rwx')).toBeNull()
  })
})
