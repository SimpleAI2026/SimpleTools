import { describe, expect, it } from 'vitest'
import { base64ByteLength, base64ToBytes, cssSnippet, htmlSnippet, parseDataUrl, sniffMime } from './logic'

const PNG = 'iVBORw0KGgo='
describe('image-base64', () => {
  it('parses data URLs and bare base64', () => {
    expect(parseDataUrl(`data:image/png;base64,${PNG}`)).toEqual({ mime: 'image/png', base64: PNG })
    expect(parseDataUrl(` ${PNG}\n`)).toEqual({ mime: 'image/png', base64: PNG })
    expect(parseDataUrl('data:image/svg+xml;charset=utf-8;base64,PHN2Zz4=')?.mime).toBe('image/svg+xml')
    expect(parseDataUrl('not base64!')).toBeNull()
    expect(parseDataUrl('')).toBeNull()
  })
  it('sniffs mime and sizes', () => {
    expect(sniffMime('/9j/4AAQ')).toBe('image/jpeg')
    expect(sniffMime('AAAA')).toBe('application/octet-stream')
    expect(base64ByteLength(PNG)).toBe(8)
    expect(base64ToBytes(PNG).slice(0, 4)).toEqual(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))
  })
  it('snippets', () => {
    expect(cssSnippet('data:x')).toBe('background-image: url("data:x");')
    expect(htmlSnippet('data:x', 'a')).toBe('<img src="data:x" alt="a" />')
  })
})
