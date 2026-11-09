import { zlibSync } from 'fflate'
import {
  IntakeError,
  asRecords,
  base64ToBytes,
  bytesToBase64,
  finish,
  listFrom,
  num,
  readDocument,
  sha256Hex,
  str,
  type WorkflowResult,
} from './core'

function rootObject(text: string, kind: string): Record<string, unknown> {
  const doc = readDocument(text, kind)
  if (doc.format === 'csv') throw new IntakeError('bad-input')
  if (!doc.value || typeof doc.value !== 'object' || Array.isArray(doc.value)) throw new IntakeError('bad-input')
  return doc.value as Record<string, unknown>
}

function rowsOf(text: string, kind: string, keys: string[]): { rows: Record<string, unknown>[]; extra: Record<string, unknown> } {
  const doc = readDocument(text, kind)
  if (doc.format === 'csv') return { rows: asRecords(doc.value), extra: {} }
  if (Array.isArray(doc.value)) return { rows: asRecords(doc.value), extra: {} }
  if (doc.value && typeof doc.value === 'object') {
    const extra = doc.value as Record<string, unknown>
    return { rows: listFrom(extra, keys), extra }
  }
  throw new IntakeError('bad-input')
}

export function runAgentWorkflowPreflight(input: string): WorkflowResult {
  const root = rootObject(input, 'agent-workflow-preflight')
  const nodes = listFrom(root.nodes ?? [], ['nodes'])
  const edges = Array.isArray(root.edges) ? asRecords(root.edges) : []
  if (nodes.length === 0) throw new IntakeError('empty')
  const ids = new Set(nodes.map((node) => str(node.id)))
  const outgoing = new Map<string, string[]>()
  const inbound = new Set<string>()
  const issues: { code: string; detail: string }[] = []
  for (const edge of edges) {
    const from = str(edge.from)
    const to = str(edge.to)
    if (!ids.has(to) || !ids.has(from)) issues.push({ code: 'unknown-endpoint', detail: `${from}->${to}` })
    outgoing.set(from, [...(outgoing.get(from) ?? []), to])
    inbound.add(to)
  }
  const color = new Map<string, number>()
  const cycleNodes = new Set<string>()
  const dfs = (id: string): void => {
    const state = color.get(id) ?? 0
    if (state === 1) { cycleNodes.add(id); return }
    if (state === 2 || !ids.has(id)) return
    color.set(id, 1)
    for (const next of outgoing.get(id) ?? []) {
      if ((color.get(next) ?? 0) === 1) { cycleNodes.add(id); cycleNodes.add(next) }
      dfs(next)
    }
    color.set(id, 2)
  }
  for (const id of ids) dfs(id)
  if (cycleNodes.size) {
    const unbounded = [...cycleNodes].some((id) => nodes.find((node) => str(node.id) === id)?.retryLimit == null)
    issues.push({ code: unbounded ? 'unbounded-cycle' : 'bounded-cycle', detail: [...cycleNodes].join('|') })
  }
  const roots = [...ids].filter((id) => !inbound.has(id))
  const seen = new Set<string>()
  const queue = roots.length ? [...roots] : []
  while (queue.length) {
    const id = queue.shift()!
    if (seen.has(id)) continue
    seen.add(id)
    for (const next of outgoing.get(id) ?? []) if (ids.has(next)) queue.push(next)
  }
  for (const id of ids) if (roots.length && !seen.has(id)) issues.push({ code: 'unreachable', detail: id })
  if (nodes.some((node) => 'when' in node || 'expression' in node)) issues.push({ code: 'not-evaluated', detail: 'conditions-are-not-executed' })
  return finish(
    'agent-workflow-preflight',
    root,
    'Only the declared graph is checked. Conditions are not executed and this is not a safety proof.',
    { issues },
    ['code', 'detail'],
    issues.map((issue) => [issue.code, issue.detail]),
  )
}

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

export function runVideoDeliveryPreflight(input: string): WorkflowResult {
  const root = rootObject(input, 'video-delivery-preflight')
  const log = str(root.probe)
  if (!log.trim()) throw new IntakeError('empty')
  const fields = parseProbeLog(log)
  const contract = (root.contract ?? {}) as Record<string, unknown>
  const issues: { code: string; detail: string; status: string }[] = []
  const expect = (name: keyof ProbeFields, code: string) => {
    const wanted = num(contract[name])
    if (wanted == null) return
    const got = fields[name]
    if (typeof got !== 'number') issues.push({ code, detail: 'unknown', status: 'unknown' })
    else if (got !== wanted) issues.push({ code, detail: `${got}!=${wanted}`, status: 'fail' })
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
  )
}

export interface LevelWindow { channel: number; peak: number; rms: number; dc: number; fullScale: number; db: string }

export function analyzeWav(bytes: Uint8Array, windowSize = 0): { sampleRate: number; channels: number; bits: number; format: string; windows: LevelWindow[] } {
  if (bytes.length < 12) throw new IntakeError('bad-input')
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const tag = (at: number) => String.fromCharCode(bytes[at]!, bytes[at + 1]!, bytes[at + 2]!, bytes[at + 3]!)
  if (tag(0) === 'RF64') throw new IntakeError('bad-input')
  if (tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new IntakeError('bad-input')
  let format = 0
  let channels = 0
  let sampleRate = 0
  let bits = 0
  let dataAt = -1
  let dataSize = 0
  let offset = 12
  while (offset + 8 <= bytes.length) {
    const id = tag(offset)
    const size = dv.getUint32(offset + 4, true)
    const start = offset + 8
    if (size < 0 || start + size > bytes.length) throw new IntakeError('bad-input')
    if (id === 'fmt ') {
      if (size < 16) throw new IntakeError('bad-input')
      format = dv.getUint16(start, true)
      channels = dv.getUint16(start + 2, true)
      sampleRate = dv.getUint32(start + 4, true)
      bits = dv.getUint16(start + 14, true)
    } else if (id === 'data') {
      dataAt = start
      dataSize = size
    }
    offset = start + size + (size % 2)
  }
  if (format !== 1 && format !== 3) throw new IntakeError('bad-input')
  if (channels < 1 || sampleRate < 1) throw new IntakeError('bad-input')
  if (format === 1 && ![16, 24, 32].includes(bits)) throw new IntakeError('bad-input')
  if (format === 3 && bits !== 32) throw new IntakeError('bad-input')
  if (dataAt < 0) throw new IntakeError('bad-input')
  const bytesPer = bits / 8
  const frame = bytesPer * channels
  if (dataSize % frame !== 0) throw new IntakeError('bad-input')
  const frames = dataSize / frame
  const read = (at: number, channel: number): number => {
    const pos = dataAt + at * frame + channel * bytesPer
    if (bits === 16) return dv.getInt16(pos, true) / 32768
    if (bits === 24) {
      const v = bytes[pos]! | (bytes[pos + 1]! << 8) | (bytes[pos + 2]! << 16)
      const signed = v & 0x800000 ? v - 0x1000000 : v
      return signed / 8388608
    }
    if (format === 3) return dv.getFloat32(pos, true)
    return dv.getInt32(pos, true) / 2147483648
  }
  const fullAt = (sample: number) => Math.abs(sample) >= 0.999
  const size = windowSize > 0 ? windowSize : frames
  const windows: LevelWindow[] = []
  for (let channel = 0; channel < channels; channel++) {
    for (let start = 0; start < frames; start += size) {
      const end = Math.min(frames, start + size)
      let peak = 0
      let sum = 0
      let sq = 0
      let full = 0
      const n = end - start
      for (let i = start; i < end; i++) {
        const sample = read(i, channel)
        peak = Math.max(peak, Math.abs(sample))
        sum += sample
        sq += sample * sample
        if (fullAt(sample)) full++
      }
      const rms = n === 0 ? 0 : Math.sqrt(sq / n)
      windows.push({ channel, peak, rms, dc: n === 0 ? 0 : sum / n, fullScale: full, db: rms === 0 ? '-Infinity' : String(Math.round(20 * Math.log10(rms) * 1000) / 1000) })
    }
  }
  return { sampleRate, channels, bits, format: format === 3 ? 'float' : 'pcm', windows }
}

export function runAudioLevelAuditor(input: string): WorkflowResult {
  const root = rootObject(input, 'audio-level-auditor')
  const b64 = str(root.wavBase64)
  if (!b64) throw new IntakeError('empty')
  if (b64.length > 12_000_000) throw new IntakeError('too-large')
  const report = analyzeWav(base64ToBytes(b64), num(root.window) ?? 0)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="${Math.max(40, report.windows.length * 24)}">${report.windows.map((w, i) => `<rect x="0" y="${i * 24}" width="${Math.min(300, w.peak * 300)}" height="16" fill="#444"/><text x="4" y="${i * 24 + 12}" font-size="10">${inert(w.db)}</text>`).join('')}</svg>`
  return finish(
    'audio-level-auditor',
    { window: root.window ?? 0, wavBytes: base64ToBytes(b64).length },
    'Peak, RMS, DC, and full-scale counts for PCM WAV only. This is not integrated loudness or a listening judgment.',
    report,
    ['channel', 'peak', 'rms', 'dc', 'fullScale', 'db'],
    report.windows.map((w) => [w.channel, w.peak, w.rms, w.dc, w.fullScale, w.db]),
    [{ name: 'levels.svg', text: svg }],
  )
}

function inert(value: string): string {
  return value.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] ?? ch)
}

export function runEditDecisionLog(input: string): WorkflowResult {
  const { rows } = rowsOf(input, 'edit-decision-log', ['clips', 'rows'])
  if (rows.length === 0) throw new IntakeError('empty')
  let cursor = 0
  let known = true
  const cuts = rows
    .map((row, index) => ({ row, index, order: num(row.order) ?? index }))
    .sort((a, b) => a.order - b.order)
    .map(({ row }) => {
      const start = num(row.start)
      const end = num(row.end)
      const fps = num(row.fps)
      const vfr = row.vfr === true || str(row.vfr).toLowerCase() === 'true'
      if (start == null || end == null) throw new IntakeError('bad-input')
      if (start > end) return { id: str(row.id), status: 'rejected', reason: 'in-after-out', duration: '', timeline: '' }
      if (vfr || fps == null) {
        known = false
        return { id: str(row.id), status: 'unknown-duration', reason: vfr ? 'vfr' : 'missing-fps', duration: 'unknown', timeline: 'unknown' }
      }
      const duration = end - start
      const inAt = cursor
      cursor += duration
      return { id: str(row.id), status: 'placed', reason: '', duration: String(duration), timeline: `${inAt}->${cursor}` }
    })
  return finish(
    'edit-decision-log',
    { clips: rows },
    known ? `Timeline length ${cursor} seconds from constant frame rates.` : 'A variable or missing frame rate stays unknown and is not treated as constant.',
    { timelineSeconds: known ? cursor : 'unknown', cuts },
    ['id', 'status', 'reason', 'duration', 'timeline'],
    cuts.map((cut) => [cut.id, cut.status, cut.reason, cut.duration, cut.timeline]),
  )
}

export function runChapterAuthor(input: string): WorkflowResult {
  const root = rootObject(input, 'chapter-author')
  const chapters = listFrom(root.chapters ?? [], ['chapters']).map((row) => ({ start: num(row.start), title: str(row.title), summary: str(row.summary) })).sort((a, b) => (a.start ?? 0) - (b.start ?? 0))
  if (chapters.length === 0) throw new IntakeError('empty')
  if (chapters.some((chapter) => chapter.start == null)) throw new IntakeError('bad-input')
  const mode = str(root.mode || 'generic')
  const notes: string[] = []
  if (mode === 'youtube') {
    if ((chapters[0]?.start ?? 0) !== 0) notes.push('first-chapter-not-zero')
    if (chapters.length < 3) notes.push('fewer-than-three')
    for (let i = 0; i < chapters.length; i++) {
      const next = chapters[i + 1]?.start ?? num(root.duration)
      if (next != null && next - (chapters[i]!.start ?? 0) < 10) notes.push(`short:${chapters[i]!.title}`)
    }
  }
  const stamp = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds))
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }
  const txt = chapters.map((chapter) => `${stamp(chapter.start ?? 0)} ${chapter.title}`).join('\n')
  return finish(
    'chapter-author',
    root,
    mode === 'youtube' ? 'YouTube-style hints use rule youtube-chapters-2024. Nothing was sent or transcribed.' : 'Chapter order and gaps only. Nothing was sent.',
    { rule: mode === 'youtube' ? 'youtube-chapters-2024' : 'generic', notes, chapters },
    ['start', 'title', 'summary'],
    chapters.map((chapter) => [stamp(chapter.start ?? 0), chapter.title, chapter.summary]),
    [{ name: 'chapters.txt', text: txt }],
  )
}

const DIGIT = ['111101101101111', '001001001001001', '111001111100111', '111001111001111', '101101111001001', '111100111001111', '111100111101111', '111001001001001', '111101111101111', '111101111001111']

function crc32(data: Uint8Array): number {
  let c = ~0
  for (const byte of data) {
    c ^= byte
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length)
  const view = new DataView(out.buffer)
  view.setUint32(0, data.length)
  out.set([type.charCodeAt(0)!, type.charCodeAt(1)!, type.charCodeAt(2)!, type.charCodeAt(3)!], 4)
  out.set(data, 8)
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)))
  return out
}

export function contactSheetPng(count: number): Uint8Array {
  const cols = Math.min(5, Math.max(1, count))
  const rows = Math.ceil(count / cols)
  const tw = 40
  const th = 28
  const width = cols * tw
  const height = rows * th
  const raw = new Uint8Array((width * 3 + 1) * height)
  for (let y = 0; y < height; y++) {
    const row = y * (width * 3 + 1)
    raw[row] = 0
    for (let x = 0; x < width; x++) {
      const index = Math.floor(y / th) * cols + Math.floor(x / tw)
      const on = index < count && digitOn(index + 1, x % tw, y % th)
      const o = row + 1 + x * 3
      raw[o] = on ? 20 : 230
      raw[o + 1] = on ? 20 : 230
      raw[o + 2] = on ? 20 : 230
    }
  }
  const ihdr = new Uint8Array(13)
  const view = new DataView(ihdr.buffer)
  view.setUint32(0, width)
  view.setUint32(4, height)
  ihdr[8] = 8
  ihdr[9] = 2
  const sig = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])
  const idat = zlibSync(raw, { level: 0 })
  return concat([sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', new Uint8Array())])
}

function digitOn(n: number, x: number, y: number): boolean {
  const text = String(n)
  const scale = 2
  const glyphW = 3 * scale
  const total = text.length * (glyphW + scale)
  const originX = Math.floor((40 - total) / 2)
  const originY = 6
  if (x < originX || y < originY) return false
  const lx = x - originX
  const ly = y - originY
  const glyph = Math.floor(lx / (glyphW + scale))
  if (glyph < 0 || glyph >= text.length) return false
  const gx = lx % (glyphW + scale)
  const gy = ly
  if (gx >= glyphW || gy >= 5 * scale) return false
  const pattern = DIGIT[Number(text[glyph])] ?? DIGIT[0]!
  return pattern[Math.floor(gy / scale) * 3 + Math.floor(gx / scale)] === '1'
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, part) => n + part.length, 0))
  let at = 0
  for (const part of parts) { out.set(part, at); at += part.length }
  return out
}

export function runVisualSelectsBoard(input: string): WorkflowResult {
  const root = rootObject(input, 'visual-selects-board')
  const assets = listFrom(root.assets ?? [], ['assets'])
  if (assets.length === 0) throw new IntakeError('empty')
  const order = Array.isArray(root.order) ? root.order.map(str) : assets.map((asset) => str(asset.id))
  const byId = new Map(assets.map((asset) => [str(asset.id), asset]))
  const rows = order.filter((id) => byId.has(id)).map((id, index) => {
    const asset = byId.get(id)!
    const decision = str(asset.decision || 'unrated')
    return { number: index + 1, id, decision, reason: str(asset.reason), status: decision === 'reject' ? 'reject' : decision === 'pick' ? 'pick' : 'unrated' }
  })
  const png = contactSheetPng(rows.length)
  return finish(
    'visual-selects-board',
    root,
    'Numbers follow the current order and stay tied to the asset id. Unrated is not a reject.',
    { rows },
    ['number', 'asset_id', 'status', 'reason'],
    rows.map((row) => [row.number, row.id, row.status, row.reason]),
    [{ name: 'contact-sheet.png.b64', text: bytesToBase64(png) }],
  )
}

export function runImageAltReview(input: string): WorkflowResult {
  const { rows } = rowsOf(input, 'image-alt-review', ['images', 'rows'])
  if (rows.length === 0) throw new IntakeError('empty')
  const reviews = rows.map((row) => {
    const role = str(row.role)
    const alt = str(row.alt)
    const purpose = str(row.purpose)
    let status = 'recorded'
    let note = ''
    if (role === 'decorative') {
      status = alt.trim() ? 'warning' : 'ok'
      note = alt.trim() ? 'decorative-should-be-empty' : 'empty-alt-allowed'
    } else if (role === 'functional') {
      status = purpose.trim() ? 'ok' : 'missing-purpose'
      note = purpose.trim() ? 'purpose-recorded' : 'functional-needs-purpose'
    } else if (role === 'informative' || role === 'complex') {
      status = alt.trim() ? 'ok' : 'missing-alt'
      if (row.textInImage === true && row.nearbyConfirmed !== true) {
        status = 'human-review'
        note = 'nearby-text-not-confirmed'
      }
    } else status = 'unknown-role'
    return { id: str(row.id), role, status, note }
  })
  return finish(
    'image-alt-review',
    { images: rows },
    'Decision record only. This does not certify WCAG and does not write an alt for you.',
    { reviews },
    ['id', 'role', 'status', 'note'],
    reviews.map((row) => [row.id, row.role, row.status, row.note]),
  )
}

interface TokenNode { path: string; type: string; value: unknown }

function walkTokens(value: unknown, path: string[], out: TokenNode[]) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return
  const obj = value as Record<string, unknown>
  if ('$value' in obj) out.push({ path: path.join('.'), type: str(obj.$type), value: obj.$value })
  for (const [key, child] of Object.entries(obj)) {
    if (key.startsWith('$')) continue
    walkTokens(child, [...path, key], out)
  }
}

export function runDesignTokenAuditor(input: string): WorkflowResult {
  const root = rootObject(input, 'design-token-auditor')
  const tokens: TokenNode[] = []
  walkTokens(root.tokens ?? root, [], tokens)
  if (tokens.length === 0) throw new IntakeError('empty')
  const byPath = new Map(tokens.map((token) => [token.path, token]))
  const issues: { code: string; detail: string }[] = []
  const resolving = new Set<string>()
  const resolve = (path: string): void => {
    if (resolving.has(path)) { issues.push({ code: 'cycle', detail: path }); return }
    const token = byPath.get(path)
    if (!token || typeof token.value !== 'string') return
    const ref = /^\{([^{}]+)\}$/.exec(token.value)
    if (!ref) {
      if (/^https?:\/\//.test(token.value)) issues.push({ code: 'remote-ref-not-loaded', detail: path })
      return
    }
    if (!byPath.has(ref[1]!)) issues.push({ code: 'missing-ref', detail: `${path}->${ref[1]}` })
    else {
      resolving.add(path)
      resolve(ref[1]!)
      resolving.delete(path)
    }
  }
  for (const token of tokens) resolve(token.path)
  const folded = new Map<string, string[]>()
  for (const token of tokens) {
    const key = token.path.toLowerCase()
    folded.set(key, [...(folded.get(key) ?? []), token.path])
  }
  for (const paths of folded.values()) if (new Set(paths).size > 1) issues.push({ code: 'case-collision', detail: paths.join('|') })
  return finish(
    'design-token-auditor',
    root,
    'Limited DTCG subset. A case collision is an output warning. Remote references and CSS are not loaded.',
    { tokens: tokens.map((token) => token.path), issues },
    ['code', 'detail'],
    issues.map((issue) => [issue.code, issue.detail]),
  )
}

export function runProjectHandoffAuditor(input: string): WorkflowResult {
  const root = rootObject(input, 'project-handoff-auditor')
  const required = Array.isArray(root.required) ? asRecords(root.required) : []
  const references = Array.isArray(root.references) ? asRecords(root.references) : []
  const files = Array.isArray(root.files) ? asRecords(root.files) : []
  if (required.length === 0 && files.length === 0) throw new IntakeError('empty')
  const issues: { code: string; detail: string }[] = []
  const byPath = new Map<string, string[]>()
  for (const file of files) {
    const path = str(file.path)
    if (path.split('/').includes('..')) issues.push({ code: 'path-conflict', detail: path })
    const hash = str(file.sha256) || (str(file.bytes) ? sha256Hex(new TextEncoder().encode(str(file.bytes))) : '')
    if (file.provided === false) issues.push({ code: 'not-provided', detail: str(file.id || path) })
    if (path) byPath.set(path, [...(byPath.get(path) ?? []), hash])
  }
  for (const [path, hashes] of byPath) if (new Set(hashes.filter(Boolean)).size > 1) issues.push({ code: 'content-conflict', detail: path })
  for (const item of required) {
    const path = str(item.path)
    const file = files.find((candidate) => str(candidate.path) === path || str(candidate.id) === str(item.id))
    if (!file || file.provided === false) issues.push({ code: 'not-provided', detail: path || str(item.id) })
  }
  const ids = new Set(files.filter((file) => file.provided !== false).map((file) => str(file.id)))
  for (const ref of references) if (!ids.has(str(ref.to))) issues.push({ code: 'missing-reference', detail: `${str(ref.from)}->${str(ref.to)}` })
  return finish(
    'project-handoff-auditor',
    root,
    'A file you did not select is not-provided, not missing from disk. Paths are not executed.',
    { issues },
    ['code', 'detail'],
    issues.map((issue) => [issue.code, issue.detail]),
  )
}

export function runVoiceoverTimingPlanner(input: string): WorkflowResult {
  const root = rootObject(input, 'voiceover-timing-planner')
  const segments = listFrom(root.segments ?? [], ['segments'])
  if (segments.length === 0) throw new IntakeError('empty')
  const unit = str(root.unit)
  const rate = num(root.ratePerMin)
  let cursor = 0
  const cues = segments.map((segment) => {
    const pause = num(segment.pauseSec) ?? 0
    let count = num(segment.count)
    if (count == null && unit === 'word') count = str(segment.text).trim() ? str(segment.text).trim().split(/\s+/).length : 0
    if (count == null && unit === 'char') count = [...str(segment.text).replace(/\s/g, '')].length
    if (!unit || rate == null || count == null) return { id: str(segment.id), count: count ?? 'unknown', seconds: 'unknown', start: 'unknown' }
    const seconds = (count / rate) * 60 + pause
    const start = cursor
    cursor += seconds
    return { id: str(segment.id), count, seconds: String(Math.round(seconds * 1000) / 1000), start: String(Math.round(start * 1000) / 1000) }
  })
  return finish(
    'voiceover-timing-planner',
    root,
    'Duration is an estimate from the unit and rate you entered. Missing unit or rate stays unknown. No speech is synthesized.',
    { cues },
    ['id', 'count', 'start', 'seconds'],
    cues.map((cue) => [cue.id, cue.count, cue.start, cue.seconds]),
  )
}
