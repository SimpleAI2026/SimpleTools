import { describe, expect, it } from 'vitest'
import { buildConcatArgs, buildFfmpegArgs, parseExtraArgs, parseSeconds, withFormatExt } from './logic'

describe('ffmpeg logic', () => {
  it('parses seconds and extra args', () => {
    expect(parseSeconds('1.5')).toBe(1.5)
    expect(parseExtraArgs('-vf "scale=320:240" -an')).toEqual(['-vf', 'scale=320:240', '-an'])
    expect(withFormatExt('a.MOV', 'mp4')).toBe('a.mp4')
  })
  it('builds convert and concat', () => {
    const args = buildFfmpegArgs({
      inputName: 'in.mp4',
      outputName: 'out.mp4',
      format: 'mp4',
      quality: 'medium',
      width: 1280,
      height: 0,
      start: 1,
      end: 5,
    })
    expect(args).toContain('scale=1280:-2')
    expect(args).toContain('-t')
    expect(buildConcatArgs('list.txt', 'out.mp4').slice(0, 3)).toEqual(['-f', 'concat', '-safe'])
  })
  it('extract audio', () => {
    const args = buildFfmpegArgs({
      inputName: 'in.mp4',
      outputName: 'out.mp3',
      format: 'mp3',
      quality: 'high',
      mode: 'extractAudio',
    })
    expect(args).toContain('-vn')
    expect(args).toContain('libmp3lame')
  })
})
