import { describe, expect, it } from 'vitest'
import { parseProbeLog, present, run, SAMPLE } from './logic'

describe('video-delivery-preflight', () => {
  it('reports a dimensions mismatch and preserves the raw probe', () => {
    const result = run(SAMPLE)
    expect(JSON.stringify(result.json)).toContain('1920!=1280')
    expect(result.files.map((file) => file.name)).toContain('probe.txt')
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('passes a matching media contract', () => {
    const probe = 'Stream #0:0: Video: h264, yuv420p, 1280x720, 30 fps\nStream #0:1: Audio: aac, 48000 Hz, stereo'
    const input = JSON.stringify({ probe, contract: { width: 1280, height: 720, fps: 30, channels: 2 } })
    const result = (run(input).json as { result: { overall: string; fields: { channels: number } } }).result
    expect(result).toMatchObject({ overall: 'pass', fields: { channels: 2 } })
  })

  it('marks unreadable requested fields as incomplete rather than passed', () => {
    const input = JSON.stringify({ probe: 'Stream #0:0: Video: h264, 1280x720, 30 fps', contract: { channels: 2 } })
    expect((run(input).json as { result: { overall: string } }).result.overall).toBe('incomplete')
    expect(parseProbeLog('').width).toBeNull()
    expect(present('').error).toBe('empty')
  })
})
