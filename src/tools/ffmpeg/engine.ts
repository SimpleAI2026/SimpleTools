import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { offlineUrl } from '@/lib/offlineAssets'
import {
  buildConcatArgs,
  buildFfmpegArgs,
  formatById,
  memfsName,
  withFormatExt,
  type FfFormatId,
  type FfMode,
  type FfQuality,
} from './logic'

let ffmpeg: FFmpeg | null = null
let loading: Promise<FFmpeg> | null = null

export async function ensureFfmpeg(): Promise<FFmpeg> {
  if (ffmpeg?.loaded) return ffmpeg
  loading ??= (async () => {
    const ff = new FFmpeg()
    const coreURL = await toBlobURL(offlineUrl('ffmpeg', 'ffmpeg-core.js'), 'text/javascript')
    const wasmURL = await toBlobURL(offlineUrl('ffmpeg', 'ffmpeg-core.wasm'), 'application/wasm')
    const classWorkerURL = (await import('@ffmpeg/ffmpeg/worker?url')).default as string
    await ff.load({ coreURL, wasmURL, classWorkerURL })
    ffmpeg = ff
    return ff
  })()
  try {
    return await loading
  } catch (e) {
    loading = null
    ffmpeg = null
    throw e
  }
}

export async function terminateFfmpeg() {
  if (ffmpeg) {
    try {
      ffmpeg.terminate()
    } catch {
      /* ignore */
    }
    ffmpeg = null
    loading = null
  }
}

async function cleanup(ff: FFmpeg, names: string[]) {
  for (const n of names) {
    try {
      await ff.deleteFile(n)
    } catch {
      /* ignore */
    }
  }
}

export async function runFfmpeg(opts: {
  file: File
  files?: File[]
  format: FfFormatId
  quality: FfQuality
  mode: FfMode
  start?: number
  end?: number
  width?: number
  height?: number
  fps?: number
  videoBitrate?: string
  audioBitrate?: string
  vf?: string
  extraArgs?: string[]
  subtitle?: File | null
  watermark?: File | null
  watermarkXY?: string
  drawtext?: string
  font?: File | null
  onProgress?: (p: number) => void
  onLog?: (line: string) => void
}): Promise<{ blob: Blob; filename: string; log?: string }> {
  const ff = await ensureFfmpeg()
  const logs: string[] = []
  const onProg = ({ progress }: { progress: number }) => {
    opts.onProgress?.(Math.max(0, Math.min(100, Math.round(progress * 100))))
  }
  const onLog = ({ message }: { message: string }) => {
    logs.push(message)
    opts.onLog?.(message)
  }
  ff.on('progress', onProg)
  ff.on('log', onLog)

  const created: string[] = []
  try {
    if (opts.mode === 'probe') {
      const inName = memfsName(opts.file.name)
      await ff.writeFile(inName, await fetchFile(opts.file))
      created.push(inName)
      await ff.ffprobe(['-hide_banner', '-i', inName])
      await ff.exec(['-hide_banner', '-formats'])
      await ff.exec(['-hide_banner', '-encoders'])
      return { blob: new Blob([logs.join('\n')], { type: 'text/plain' }), filename: 'ffmpeg-probe.txt', log: logs.join('\n') }
    }

    if (opts.mode === 'concat') {
      const inputs = opts.files?.length ? opts.files : [opts.file]
      const names: string[] = []
      for (const f of inputs) {
        const n = memfsName(f.name)
        await ff.writeFile(n, await fetchFile(f))
        created.push(n)
        names.push(n)
      }
      const listBody = names.map((n) => `file '${n}'`).join('\n')
      await ff.writeFile('concat.txt', listBody)
      created.push('concat.txt')
      const outName = withFormatExt('concat-out', opts.format)
      const code = await ff.exec(buildConcatArgs('concat.txt', outName))
      if (code !== 0) {
        // Try concat filter re-encode fallback
        const filter = names.map((_, i) => `[${i}:v][${i}:a]`).join('') + `concat=n=${names.length}:v=1:a=1[v][a]`
        const code2 = await ff.exec([
          ...names.flatMap((n) => ['-i', n]),
          '-filter_complex',
          filter,
          '-map',
          '[v]',
          '-map',
          '[a]',
          outName,
        ])
        if (code2 !== 0) throw new Error(`ffmpeg concat failed (${code}/${code2})\n${logs.slice(-20).join('\n')}`)
      }
      created.push(outName)
      const data = await ff.readFile(outName)
      const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
      const copy = new Uint8Array(bytes.byteLength)
      copy.set(bytes)
      const fmt = formatById(opts.format)!
      return { blob: new Blob([copy.buffer], { type: fmt.mime }), filename: outName, log: logs.join('\n') }
    }

    const inName = memfsName(opts.file.name)
    await ff.writeFile(inName, await fetchFile(opts.file))
    created.push(inName)

    let subtitleName: string | undefined
    let watermarkName: string | undefined
    let fontName: string | undefined
    if (opts.subtitle) {
      subtitleName = memfsName(opts.subtitle.name, 'subs.srt')
      await ff.writeFile(subtitleName, await fetchFile(opts.subtitle))
      created.push(subtitleName)
    }
    if (opts.watermark) {
      watermarkName = memfsName(opts.watermark.name, 'wm.png')
      await ff.writeFile(watermarkName, await fetchFile(opts.watermark))
      created.push(watermarkName)
    }
    if (opts.font) {
      fontName = memfsName(opts.font.name, 'font.ttf')
      await ff.writeFile(fontName, await fetchFile(opts.font))
      created.push(fontName)
    }

    const outExt = opts.mode === 'frames' ? 'png' : opts.format
    const outName = opts.mode === 'frames' ? 'frame.png' : withFormatExt('output', opts.format)
    const args = buildFfmpegArgs({
      inputName: inName,
      outputName: outName,
      format: opts.mode === 'frames' ? 'gif' : opts.format, // frames use image; override below
      quality: opts.quality,
      start: opts.start,
      end: opts.end,
      width: opts.width,
      height: opts.height,
      fps: opts.fps,
      videoBitrate: opts.videoBitrate,
      audioBitrate: opts.audioBitrate,
      mode: opts.mode,
      vf: opts.vf,
      extraArgs: opts.extraArgs,
      subtitleName,
      watermarkName,
      watermarkXY: opts.watermarkXY,
      drawtext: opts.drawtext,
      fontName,
    })

    // Fix frames output: force png image2
    if (opts.mode === 'frames') {
      const frameArgs = ['-i', inName]
      if (opts.start != null) frameArgs.unshift('-ss', String(opts.start))
      if (opts.vf) frameArgs.push('-vf', opts.vf)
      else if (opts.width || opts.height) {
        frameArgs.push('-vf', `scale=${opts.width || -2}:${opts.height || -2}`)
      }
      frameArgs.push('-frames:v', '1', outName)
      const code = await ff.exec(frameArgs)
      if (code !== 0) throw new Error(`ffmpeg exited with code ${code}`)
    } else {
      const code = await ff.exec(args)
      if (code !== 0) throw new Error(`ffmpeg exited with code ${code}\n${logs.slice(-30).join('\n')}`)
    }
    created.push(outName)
    const data = await ff.readFile(outName)
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data))
    const copy = new Uint8Array(bytes.byteLength)
    copy.set(bytes)
    const mime =
      opts.mode === 'frames' ? 'image/png' : opts.mode === 'extractAudio' ? formatById(opts.format)?.mime ?? 'application/octet-stream' : formatById(outExt as FfFormatId)?.mime ?? 'application/octet-stream'
    const filename =
      opts.mode === 'frames' ? withFormatExt(opts.file.name, 'png' as FfFormatId).replace(/\.png$/, '-frame.png') : withFormatExt(opts.file.name, opts.format)
    return { blob: new Blob([copy.buffer], { type: mime }), filename, log: logs.join('\n') }
  } finally {
    ff.off('progress', onProg)
    ff.off('log', onLog)
    await cleanup(ff, created)
  }
}
