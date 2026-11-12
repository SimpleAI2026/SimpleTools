import { describe, expect, it } from 'vitest'
import { describePkcs7, extractPdfSignatures } from './logic'

describe('pdf signatures', () => {
  it('ignores a contents blob that is not PKCS#7', () => {
    const pdf = new TextEncoder().encode('/ByteRange [0 10 30 4] /Contents <00010203>')
    expect(extractPdfSignatures(pdf)).toEqual([])
    expect(describePkcs7(new Uint8Array([0, 1, 2, 3]))).toBeNull()
  })
})
