import { finish, num, presentResult, readDocument, str, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '1\n00:00:59,900 --> 00:01:00,200\nHello\n\n2\n00:01:00,200 --> 00:01:02,000\nWorld\n'

export interface Cue {
  start: number
  end: number
  text: string
}

export function parseTimestamp(value: string): number | null {
  const match = /^(?:(\d{2,}):)?([0-5]\d):([0-5]\d)[,.](\d{1,3})$/.exec(value.trim())
  if (!match) return null
  const milliseconds = Number(match[4]!.padEnd(3, '0'))
  return ((Number(match[1] ?? 0) * 60 + Number(match[2])) * 60 + Number(match[3])) * 1000 + milliseconds
}

export function formatTimestamp(ms: number, comma: boolean): string {
  const clamped = Math.max(0, Math.round(ms))
  const hours = Math.floor(clamped / 3_600_000)
  const minutes = Math.floor((clamped % 3_600_000) / 60_000)
  const seconds = Math.floor((clamped % 60_000) / 1000)
  const milliseconds = clamped % 1000
  const pad = (value: number, width: number) => String(value).padStart(width, '0')
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}${comma ? ',' : '.'}${pad(milliseconds, 3)}`
}

export function parseCues(text: string): { format: 'srt' | 'vtt'; cues: Cue[]; complex: boolean } {
  const raw = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim()
  if (!raw) throw new Error('empty')
  const complex = /(^|\n)(STYLE|REGION)\b/.test(raw) || /<v[\s.]/.test(raw)
  const format = raw.startsWith('WEBVTT') ? 'vtt' : 'srt'
  if (complex) return { format, cues: [], complex: true }
  const body = format === 'vtt' ? raw.replace(/^WEBVTT[^\n]*\n+/, '') : raw
  const blocks = body.split(/\n{2,}/)
  const cues: Cue[] = []
  for (const block of blocks) {
    const lines = block.split('\n').filter((line) => line.trim() !== '')
    const timeLine = lines.find((line) => line.includes('-->'))
    if (!timeLine) continue
    const [from, to] = timeLine.split('-->').map((part) => part.trim().split(/\s/)[0] ?? '')
    const start = parseTimestamp(from ?? '')
    const end = parseTimestamp(to ?? '')
    if (start == null || end == null || end < start) throw new Error('bad-input')
    const textLines = lines.slice(lines.indexOf(timeLine) + 1)
    cues.push({ start, end, text: textLines.join('\n') })
  }
  if (cues.length === 0) throw new Error('bad-input')
  return { format, cues, complex: false }
}

export function renderCues(cues: Cue[], target: 'srt' | 'vtt' | 'txt'): string {
  if (target === 'txt') return cues.map((cue) => cue.text).join('\n\n')
  if (target === 'vtt') return `WEBVTT\n\n${cues.map((cue) => `${formatTimestamp(cue.start, false)} --> ${formatTimestamp(cue.end, false)}\n${cue.text}`).join('\n\n')}\n`
  return `${cues.map((cue, index) => `${index + 1}\n${formatTimestamp(cue.start, true)} --> ${formatTimestamp(cue.end, true)}\n${cue.text}`).join('\n\n')}\n`
}

export function run(input: string) {
  const doc = readDocument(input, 'subtitle-toolkit')
  let source = ''
  let offset = 0
  let target: 'srt' | 'vtt' | 'txt' = 'srt'
  if (doc.format === 'json' && doc.value && typeof doc.value === 'object' && !Array.isArray(doc.value)) {
    const object = doc.value as Record<string, unknown>
    source = str(object.text ?? object.subtitle)
    offset = num(object.offsetMs) ?? 0
    const requested = str(object.target)
    if (requested === 'vtt' || requested === 'txt' || requested === 'srt') target = requested
  } else source = doc.text
  const parsed = parseCues(source)
  if (parsed.complex) {
    return finish('subtitle-toolkit', { text: source, offsetMs: offset, target }, 'STYLE, REGION, or voice cues were kept raw and not converted.', { converted: false, reason: 'complex-style-region-or-voice' }, ['code', 'detail'], [['rejected', 'complex-style-region-or-voice']], [{ name: 'subtitles.original.txt', text: source }])
  }
  const cues = parsed.cues.map((cue) => ({ ...cue, start: Math.max(0, cue.start + offset), end: Math.max(0, cue.end + offset) }))
  const overlaps = cues.slice(1).filter((cue, index) => cue.start < cues[index]!.end).length
  const clipped = parsed.cues.filter((cue, index) => cue.start + offset < 0 || cue.end + offset < 0 || cues[index]!.end <= cues[index]!.start).length
  const rendered = renderCues(cues, target)
  return finish(
    'subtitle-toolkit',
    { text: source, offsetMs: offset, target },
    overlaps ? `${overlaps} overlaps flagged, not treated as hard errors.` : `${cues.length} cues written.`,
    { converted: true, sourceFormat: parsed.format, overlaps, clipped, cues, rendered },
    ['index', 'start', 'end', 'overlap', 'text'],
    cues.map((cue, index) => [index + 1, formatTimestamp(cue.start, false), formatTimestamp(cue.end, false), index > 0 && cue.start < cues[index - 1]!.end ? 'warn' : '', cue.text]),
    [{ name: target === 'txt' ? 'transcript.txt' : target === 'vtt' ? 'subtitles.vtt' : 'subtitles.srt', text: rendered }],
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
