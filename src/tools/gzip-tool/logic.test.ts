import { describe, expect, it } from 'vitest'
import { gzipSync } from 'fflate'
import { compress, decompress, detectFormat, gzipName, looksLikeText, ratio } from './logic'

const text = new TextEncoder().encode('hello hello hello hello 你好 '.repeat(50))
describe('gzip-tool', () => {
  it('round trips all formats', async () => {
    for (const f of ['gzip', 'zlib', 'deflate-raw'] as const) {
      const c = await compress(text, f, 9)
      expect(c.length).toBeLessThan(text.length)
      const d = await decompress(c)
      expect(d.format).toBe(f)
      expect(new TextDecoder().decode(d.data)).toBe(new TextDecoder().decode(text))
    }
  })
  it('detects and reads names', () => {
    const gz = gzipSync(text, { filename: 'a.txt' })
    expect(detectFormat(gz)).toBe('gzip')
    expect(gzipName(gz)).toBe('a.txt')
    expect(looksLikeText(text)).toBe(true)
    expect(looksLikeText(new Uint8Array([0, 1, 2]))).toBe(false)
    expect(ratio(200, 50)).toBe('25.0%')
  })
  it('rejects garbage', async () => {
    await expect(decompress(new Uint8Array([0x1f, 0x8b, 1, 2, 3]))).rejects.toThrow()
  })
})
