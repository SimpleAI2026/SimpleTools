import { describe, expect, it } from 'vitest'
import { filenameFor, parseDataUrl, toDataUrl } from './logic'

describe('base64-file', () => {
  it('round-trips arbitrary bytes through a data URL', () => {
    const bytes = Uint8Array.from([0, 255, 10, 65])
    const url = toDataUrl(bytes, 'application/octet-stream')
    const parsed = parseDataUrl(url)
    expect(parsed?.mime).toBe('application/octet-stream')
    expect(parsed?.bytes).toEqual(bytes)
    expect(parseDataUrl('data:text/plain,hello')).toBeNull()
    expect(filenameFor('image/png')).toBe('file.png')
  })
})
