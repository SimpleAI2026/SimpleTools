import { finish, num, presentResult, rootObject, str, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '{"probe":"Stream #0:0: Video: h264, yuv420p, 1920x1080, 30 fps\\n","contract":{"width":1280,"height":720,"channels":2}}'

export interface ProbeFields {
  width: number | null
  height: number | null
  fps: number | null
  channels: number | null
  videoCodec: string | null
  audioCodec: string | null
}

export function parseProbeLog(log: string): ProbeFields {
  const video = /Video:\s*([^,\s]+)[\s\S]*?(\d{2,5})x(\d{2,5})[\s\S]*?(\d+(?:\.\d+)?)\s*fps/.exec(log)
  const audio = /Audio:\s*([^,\s]+)[\s\S]*?,\s*(mono|stereo|(\d+(?:\.\d+)?)\s*channels)/i.exec(log)
  let channels: number | null = null
  if (audio) {
    const label = audio[2]!.toLowerCase()
    channels = label === 'mono' ? 1 : label === 'stereo' ? 2 : Number(audio[3])
    if (!Number.isFinite(channels)) channels = null
  }
  return {
    width: video ? Number(video[2]) : null,
    height: video ? Number(video[3]) : null,
    fps: video ? Number(video[4]) : null,
    channels,
    videoCodec: video ? video[1]! : null,
    audioCodec: audio ? audio[1]! : null,
  }
}

export function run(input: string) {
  const root = rootObject(input, 'video-delivery-preflight')
  const log = str(root.probe)
  if (!log.trim()) throw new Error('empty')
  const fields = parseProbeLog(log)
  const contract = (root.contract ?? {}) as Record<string, unknown>
  const issues: { code: string; detail: string; status: string }[] = []
  const expect = (name: keyof ProbeFields, code: string) => {
    const wanted = num(contract[name])
    if (wanted == null) return
    const got = fields[name]
    if (typeof got !== 'number') issues.push({ code, detail: 'unknown', status: 'unknown' })
    else if (Math.abs(got - wanted) > 0.001) issues.push({ code, detail: `${got}!=${wanted}`, status: 'fail' })
  }
  expect('width', 'width')
  expect('height', 'height')
  expect('fps', 'fps')
  expect('channels', 'channels')
  const overall = issues.some((issue) => issue.status === 'fail') ? 'fail' : issues.some((issue) => issue.status === 'unknown') ? 'incomplete' : 'pass'
  return finish(
    'video-delivery-preflight',
    root,
    'Compared with the contract you supplied. Unknown fields are not a pass, and the file is left unchanged.',
    { parser: 'ffmpeg-log-1', overall, fields, issues },
    ['code', 'status', 'detail'],
    issues.length ? issues.map((issue) => [issue.code, issue.status, issue.detail]) : [['overall', overall, 'matched']],
    [{ name: 'probe.txt', text: log }],
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
