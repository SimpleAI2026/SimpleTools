import { describe, expect, it } from 'vitest'
import { extensionForMime, preferredRecorderMime } from './logic'

describe('camera recorder', () => {
  it('picks the first supported mime and a file extension', () => {
    expect(preferredRecorderMime((mime) => mime === 'video/webm')).toBe('video/webm')
    expect(preferredRecorderMime(() => false)).toBe('')
    expect(extensionForMime('video/mp4')).toBe('mp4')
    expect(extensionForMime('video/webm;codecs=vp9')).toBe('webm')
  })
})
