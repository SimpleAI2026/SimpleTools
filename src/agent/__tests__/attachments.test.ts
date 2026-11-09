import { describe, expect, it } from 'vitest'
import {
  formatBytes,
  isImageFile,
  resolveUploadToUrl,
  DEFAULT_MAX_ATTACHMENT_BYTES,
  DEFAULT_MAX_ATTACHMENTS,
} from '../attachments'

describe('attachments helpers', () => {
  it('defaults match Phase A limits', () => {
    expect(DEFAULT_MAX_ATTACHMENTS).toBe(5)
    expect(DEFAULT_MAX_ATTACHMENT_BYTES).toBe(4_000_000)
  })

  it('isImageFile checks mime prefix', () => {
    expect(isImageFile(new File([], 'a.png', { type: 'image/png' }))).toBe(true)
    expect(isImageFile(new File([], 'a.txt', { type: 'text/plain' }))).toBe(false)
  })

  it('formatBytes', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2.0 KB')
  })

  it('resolveUploadToUrl prefers url then base64', () => {
    expect(resolveUploadToUrl({ url: 'https://x/a.png' })).toBe('https://x/a.png')
    expect(resolveUploadToUrl({ base64: 'YWJj', mime: 'image/png' })).toBe(
      'data:image/png;base64,YWJj',
    )
    expect(resolveUploadToUrl({ base64: 'data:image/jpeg;base64,xx' })).toBe(
      'data:image/jpeg;base64,xx',
    )
  })
})
