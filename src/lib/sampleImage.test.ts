import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSampleImage } from './sampleImage'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('loadSampleImage', () => {
  it('fetches /samples and returns a File', async () => {
    const blob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' })
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(blob, { status: 200, headers: { 'Content-Type': 'image/png' } })),
    )
    const file = await loadSampleImage()
    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('simpletools.png')
    expect(file.type).toBe('image/png')
    expect(fetch).toHaveBeenCalledWith('/samples/simpletools.png')
  })

  it('throws when sample is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })))
    await expect(loadSampleImage('missing.png')).rejects.toThrow(/missing/)
  })
})
