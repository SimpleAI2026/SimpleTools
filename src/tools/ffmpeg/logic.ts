export const FF_FORMATS = [
  { id: 'mp4', ext: 'mp4', mime: 'video/mp4', kind: 'video', label: 'MP4 (H.264)' },
  { id: 'webm', ext: 'webm', mime: 'video/webm', kind: 'video', label: 'WebM (VP9)' },
  { id: 'gif', ext: 'gif', mime: 'image/gif', kind: 'video', label: 'GIF' },
  { id: 'mp3', ext: 'mp3', mime: 'audio/mpeg', kind: 'audio', label: 'MP3' },
  { id: 'aac', ext: 'aac', mime: 'audio/aac', kind: 'audio', label: 'AAC' },
  { id: 'wav', ext: 'wav', mime: 'audio/wav', kind: 'audio', label: 'WAV' },
  { id: 'ogg', ext: 'ogg', mime: 'audio/ogg', kind: 'audio', label: 'OGG' },
] as const

export type FfFormatId = (typeof FF_FORMATS)[number]['id']
export type FfQuality = 'low' | 'medium' | 'high'
export type FfMode = 'convert' | 'extractAudio' | 'stripAudio' | 'concat' | 'frames' | 'probe'

export function formatById(id: string) {
  return FF_FORMATS.find((f) => f.id === id)
}

export function withFormatExt(name: string, format: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'output'
  const fmt = formatById(format)
  return `${base}.${fmt?.ext ?? format}`
}

export function parseSeconds(v: string | number | null | undefined): number | undefined {
  if (v === '' || v == null) return undefined
  const n = typeof v === 'number' ? v : Number(String(v).trim())
  if (!Number.isFinite(n) || n < 0) return undefined
  return n
}

export function memfsName(filename: string, fallback = 'input.bin'): string {
  const base = filename.replace(/[/\\]/g, '_').replace(/[^\w.\-()+ ]+/g, '_') || fallback
  return base.slice(0, 180)
}

export function buildFfmpegArgs(opts: {
  inputName: string
  outputName: string
  format: FfFormatId
  quality: FfQuality
  start?: number
  end?: number
  width?: number
  height?: number
  fps?: number
  videoBitrate?: string
  audioBitrate?: string
  mode?: FfMode
  vf?: string
  extraArgs?: string[]
  subtitleName?: string
  watermarkName?: string
  watermarkXY?: string
  drawtext?: string
  fontName?: string
}): string[] {
  const args: string[] = []
  if (opts.start != null) args.push('-ss', String(opts.start))
  args.push('-i', opts.inputName)
  if (opts.subtitleName) args.push('-i', opts.subtitleName)
  if (opts.watermarkName) args.push('-i', opts.watermarkName)
  if (opts.end != null) {
    if (opts.start != null && opts.end > opts.start) args.push('-t', String(opts.end - opts.start))
    else if (opts.start == null) args.push('-to', String(opts.end))
  }

  if (opts.mode === 'extractAudio') {
    args.push('-vn')
  } else if (opts.mode === 'stripAudio') {
    args.push('-an')
  }

  const filters: string[] = []
  if (opts.width || opts.height) {
    const w = opts.width && opts.width > 0 ? String(opts.width) : '-2'
    const h = opts.height && opts.height > 0 ? String(opts.height) : '-2'
    filters.push(`scale=${w}:${h}`)
  }
  if (opts.fps && opts.fps > 0) filters.push(`fps=${opts.fps}`)
  if (opts.drawtext) {
    const font = opts.fontName ? `fontfile=${opts.fontName}:` : ''
    filters.push(`drawtext=${font}text='${opts.drawtext.replace(/:/g, '\\:').replace(/'/g, "\\'")}':x=20:y=20:fontsize=24:fontcolor=white:box=1:boxcolor=black@0.4`)
  }
  if (opts.vf) filters.push(opts.vf)

  // subtitle burn-in / watermark need filter_complex when multi-input
  if (opts.subtitleName || opts.watermarkName) {
    const parts: string[] = []
    let last = '[0:v]'
    if (opts.subtitleName) {
      parts.push(`${last}[1:s]overlay=0:0[vsub]`)
      // subtitles filter is more common; try subtitles=
      parts.length = 0
      parts.push(`[0:v]subtitles=${opts.subtitleName}[vsub]`)
      last = '[vsub]'
    }
    if (opts.watermarkName) {
      const xy = opts.watermarkXY || '10:10'
      const wmIn = opts.subtitleName ? '[2:v]' : '[1:v]'
      parts.push(`${last}${wmIn}overlay=${xy}[vout]`)
      last = '[vout]'
    }
    if (filters.length) {
      parts.push(`${last}${filters.join(',')}${last === '[vout]' ? '[vout2]' : '[vout]'}`)
      last = last === '[vout]' ? '[vout2]' : '[vout]'
    }
    args.push('-filter_complex', parts.join(';'), '-map', last)
  } else if (filters.length) {
    args.push('-vf', filters.join(','))
  }

  if (opts.mode === 'frames') {
    args.push('-frames:v', '1')
    if (!filters.some((f) => f.startsWith('fps=')) && opts.fps) {
      /* already handled */
    }
  }

  const q = opts.quality
  const fmt = opts.format
  if (opts.mode !== 'extractAudio' && fmt !== 'mp3' && fmt !== 'aac' && fmt !== 'wav' && fmt !== 'ogg') {
    if (fmt === 'mp4') {
      args.push('-c:v', 'libx264', '-preset', q === 'low' ? 'veryfast' : q === 'high' ? 'slow' : 'medium')
      if (opts.videoBitrate) args.push('-b:v', opts.videoBitrate)
      else args.push('-crf', q === 'low' ? '28' : q === 'high' ? '18' : '23')
      if (opts.mode !== 'stripAudio') {
        args.push('-c:a', 'aac')
        args.push('-b:a', opts.audioBitrate || (q === 'low' ? '96k' : q === 'high' ? '192k' : '128k'))
      }
      args.push('-movflags', '+faststart')
    } else if (fmt === 'webm') {
      args.push('-c:v', 'libvpx-vp9')
      if (opts.videoBitrate) args.push('-b:v', opts.videoBitrate)
      else args.push('-crf', q === 'low' ? '40' : q === 'high' ? '28' : '35', '-b:v', '0')
      if (opts.mode !== 'stripAudio') {
        args.push('-c:a', 'libopus', '-b:a', opts.audioBitrate || '96k')
      }
    } else if (fmt === 'gif') {
      if (!args.includes('-vf') && !args.includes('-filter_complex')) {
        args.push(
          '-vf',
          q === 'high'
            ? 'fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'
            : 'fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
        )
      }
      args.push('-an')
    }
  } else {
    // audio formats / extract audio
    if (fmt === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', opts.audioBitrate || (q === 'high' ? '256k' : '192k'))
    else if (fmt === 'aac') args.push('-c:a', 'aac', '-b:a', opts.audioBitrate || '128k')
    else if (fmt === 'wav') args.push('-c:a', 'pcm_s16le')
    else if (fmt === 'ogg') args.push('-c:a', 'libvorbis', '-q:a', q === 'high' ? '6' : '4')
    if (!args.includes('-vn') && (fmt === 'mp3' || fmt === 'aac' || fmt === 'wav' || fmt === 'ogg')) args.push('-vn')
  }

  if (opts.extraArgs?.length) args.push(...opts.extraArgs)
  args.push(opts.outputName)
  return args
}

export function buildConcatArgs(listName: string, outputName: string): string[] {
  // concat demuxer
  return ['-f', 'concat', '-safe', '0', '-i', listName, '-c', 'copy', outputName]
}

export function parseExtraArgs(raw: string): string[] {
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) out.push(m[1] ?? m[2] ?? m[3]!)
  return out
}
