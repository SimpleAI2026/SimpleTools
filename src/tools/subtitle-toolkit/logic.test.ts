import { describe, expect, it } from 'vitest'
import { parseCues, present, run, SAMPLE } from './logic'

describe('subtitle-toolkit', () => {
  it('parses and exports multiple cues without changing them by default', () => {
    const result = run(SAMPLE)
    expect(result.files[0]!.name).toBe('subtitles.srt')
    expect(result.files[0]!.text).toBe(SAMPLE)
    expect(present(SAMPLE).files.map((file) => file.name)).toContain('result.json')
  })

  it('shifts across a minute boundary and converts to VTT', () => {
    const input = JSON.stringify({ text: '1\n00:00:59,900 --> 00:01:00,200\nHello\n', offsetMs: 200, target: 'vtt' })
    const result = run(input)
    expect(result.files[0]!.text).toContain('00:01:00.100 --> 00:01:00.400')
    expect(result.files[0]!.text).toContain('WEBVTT')
  })

  it('supports VTT minute timestamps and reports overlaps and clipping', () => {
    expect(parseCues('WEBVTT\n\n00:01.000 --> 00:02.000\nHi\n').cues[0]!.start).toBe(1000)
    const input = JSON.stringify({ text: '1\n00:00:00,000 --> 00:00:02,000\nA\n\n2\n00:00:01,000 --> 00:00:03,000\nB\n', offsetMs: -1000 })
    const result = (run(input).json as { result: { overlaps: number; clipped: number } }).result
    expect(result).toMatchObject({ overlaps: 1, clipped: 1 })
  })

  it('keeps complex VTT raw instead of converting it', () => {
    const result = run('WEBVTT\n\nSTYLE\n::cue { color: red }\n\n00:00.000 --> 00:01.000\nHi\n')
    expect(result.files[0]!.name).toBe('subtitles.original.txt')
    expect((result.json as { result: { converted: boolean } }).result.converted).toBe(false)
    expect(present('').error).toBe('empty')
  })
})
