import { describe, expect, it } from 'vitest'
import { bytesToBase64, presentResult, sha256Hex } from './core'
import {
  analyzeWav,
  contactSheetPng,
  parseProbeLog,
  runAgentWorkflowPreflight,
  runAudioLevelAuditor,
  runChapterAuthor,
  runDesignTokenAuditor,
  runEditDecisionLog,
  runImageAltReview,
  runProjectHandoffAuditor,
  runVideoDeliveryPreflight,
  runVisualSelectsBoard,
  runVoiceoverTimingPlanner,
} from './b4'

function wav(samples: number[][], bits = 16): Uint8Array {
  const channels = samples[0]?.length ?? 1
  const frames = samples.length
  const block = (bits / 8) * channels
  const dataSize = frames * block
  const buf = new Uint8Array(44 + dataSize)
  const view = new DataView(buf.buffer)
  buf.set([82, 73, 70, 70], 0)
  view.setUint32(4, 36 + dataSize, true)
  buf.set([87, 65, 86, 69, 102, 109, 116, 32], 8)
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, 8000, true)
  view.setUint32(28, 8000 * block, true)
  view.setUint16(32, block, true)
  view.setUint16(34, bits, true)
  buf.set([100, 97, 116, 97], 36)
  view.setUint32(40, dataSize, true)
  samples.forEach((frame, i) => {
    frame.forEach((sample, channel) => {
      view.setInt16(44 + i * block + channel * 2, sample, true)
    })
  })
  return buf
}

describe('batch 4 workflows', () => {
  it('flags an unbounded cycle and an unknown edge', () => {
    const result = runAgentWorkflowPreflight(JSON.stringify({
      nodes: [{ id: 'A', retryLimit: null }, { id: 'B', retryLimit: null }, { id: 'C' }],
      edges: [{ from: 'A', to: 'B' }, { from: 'B', to: 'A' }, { from: 'A', to: 'missing' }],
    }))
    const codes = (result.json as { result: { issues: { code: string }[] } }).result.issues.map((issue) => issue.code)
    expect(codes).toContain('unbounded-cycle')
    expect(codes).toContain('unknown-endpoint')
    expect(codes).toContain('unreachable')
    expect(presentResult(runAgentWorkflowPreflight, '').error).toBe('empty')
  })

  it('fails a 1080 source against a 720 contract and leaves missing audio unknown', () => {
    const log = 'Duration: 00:00:01.00\nStream #0:0: Video: h264, yuv420p, 1920x1080, 30 fps\n'
    expect(parseProbeLog(log).width).toBe(1920)
    const result = runVideoDeliveryPreflight(JSON.stringify({ probe: log, contract: { width: 1280, height: 720, channels: 2 } }))
    const body = result.json as { result: { overall: string; issues: { status: string }[] } }
    expect(body.result.overall).toBe('fail')
    expect(body.result.issues.some((issue) => issue.status === 'unknown')).toBe(true)
    expect(JSON.stringify(body)).not.toContain('transcod')
    expect(presentResult(runVideoDeliveryPreflight, '{"probe":""}').error).toBe('empty')
  })

  it('reports zero rms as negative infinity and counts full-scale samples', () => {
    const silent = analyzeWav(wav([[0], [0]]))
    expect(silent.windows[0]!.rms).toBe(0)
    expect(silent.windows[0]!.db).toBe('-Infinity')
    const hot = analyzeWav(wav([[32767], [0], [-32768]]))
    expect(hot.windows[0]!.fullScale).toBe(2)
    const broken = wav([[0]])
    broken[40] = 255
    expect(() => analyzeWav(broken)).toThrow()
    const rf64 = wav([[0]])
    rf64.set([82, 70, 54, 52], 0)
    expect(() => analyzeWav(rf64)).toThrow()
    const result = runAudioLevelAuditor(JSON.stringify({ wavBase64: bytesToBase64(wav([[0]])) }))
    expect(result.csv).toContain('-Infinity')
    expect(result.summary).not.toMatch(/LUFS/i)
    expect(presentResult(runAudioLevelAuditor, '{}').error).toBe('empty')
  })

  it('adds clip durations and rejects an inverted range', () => {
    const result = runEditDecisionLog(JSON.stringify({
      clips: [
        { id: 'a', start: 0, end: 3, fps: 24, order: 1 },
        { id: 'b', start: 1, end: 4, fps: 24, order: 2 },
        { id: 'c', start: 5, end: 1, fps: 24, order: 3 },
        { id: 'd', start: 0, end: 2, vfr: true, order: 4 },
      ],
    }))
    const body = result.json as { result: { timelineSeconds: number | string; cuts: { status: string }[] } }
    expect(body.result.cuts[0]!.status).toBe('placed')
    expect(body.result.cuts[2]!.status).toBe('rejected')
    expect(body.result.timelineSeconds).toBe('unknown')
    const clean = runEditDecisionLog(JSON.stringify({ clips: [{ id: 'a', start: 0, end: 3, fps: 24 }, { id: 'b', start: 0, end: 3, fps: 24 }] }))
    expect((clean.json as { result: { timelineSeconds: number } }).result.timelineSeconds).toBe(6)
  })

  it('warns about YouTube chapter rules without pretending to upload', () => {
    const result = runChapterAuthor(JSON.stringify({
      mode: 'youtube', duration: 30,
      chapters: [{ start: 5, title: 'Intro', summary: 'open' }],
    }))
    const notes = (result.json as { result: { notes: string[]; rule: string } }).result
    expect(notes.rule).toBe('youtube-chapters-2024')
    expect(notes.notes).toEqual(expect.arrayContaining(['first-chapter-not-zero', 'fewer-than-three']))
    expect(result.files[0]!.text).toContain('00:05')
    expect(result.summary).not.toMatch(/upload/i)
  })

  it('keeps asset ids when reordered and does not treat unrated as reject', () => {
    const result = runVisualSelectsBoard(JSON.stringify({
      order: ['b', 'a'],
      assets: [{ id: 'a', decision: 'unrated' }, { id: 'b', decision: 'pick', reason: 'sharp' }],
    }))
    const rows = (result.json as { result: { rows: { number: number; id: string; status: string }[] } }).result.rows
    expect(rows.map((row) => [row.number, row.id, row.status])).toEqual([[1, 'b', 'pick'], [2, 'a', 'unrated']])
    const png = contactSheetPng(rows.length)
    expect(png[0]).toBe(137)
    expect(png[1]).toBe(80)
    expect(result.csv).toContain('b')
  })

  it('allows an empty decorative alt and asks for a functional purpose', () => {
    const result = runImageAltReview(JSON.stringify({
      images: [
        { id: '1', role: 'decorative', alt: '' },
        { id: '2', role: 'functional', alt: 'icon', purpose: '' },
        { id: '3', role: 'complex', alt: 'chart', textInImage: true, nearbyConfirmed: false },
      ],
    }))
    const rows = (result.json as { result: { reviews: { status: string }[] } }).result.reviews
    expect(rows.map((row) => row.status)).toEqual(['ok', 'missing-purpose', 'human-review'])
    expect(result.summary).not.toMatch(/WCAG compliant/i)
  })

  it('reports a token cycle and a case collision without calling the JSON illegal', () => {
    const cycle = runDesignTokenAuditor(JSON.stringify({ tokens: { color: { a: { $value: '{color.b}', $type: 'color' }, b: { $value: '{color.a}', $type: 'color' } } } }))
    expect((cycle.json as { result: { issues: { code: string }[] } }).result.issues.some((issue) => issue.code === 'cycle')).toBe(true)
    const collision = runDesignTokenAuditor(JSON.stringify({ tokens: { Color: { $value: '#fff', $type: 'color' }, color: { $value: '#000', $type: 'color' } } }))
    expect((collision.json as { result: { issues: { code: string }[] } }).result.issues.some((issue) => issue.code === 'case-collision')).toBe(true)
    expect(presentResult(runDesignTokenAuditor, '{"tokens":{"ok":{"$value":"#fff","$type":"color"}}}').error).toBe('')
  })

  it('reports an unselected file as not provided and rejects parent paths', () => {
    const result = runProjectHandoffAuditor(JSON.stringify({
      required: [{ id: 'brief', path: 'docs/brief.md' }],
      references: [{ from: 'shot', to: 'missing-take' }],
      files: [
        { id: 'brief', path: 'docs/brief.md', provided: false },
        { id: 'a', path: '../secret.txt', sha256: sha256Hex(new Uint8Array([1])), provided: true },
        { id: 'b', path: 'notes.txt', sha256: 'aaa', provided: true },
        { id: 'c', path: 'notes.txt', sha256: 'bbb', provided: true },
      ],
    }))
    const codes = (result.json as { result: { issues: { code: string }[] } }).result.issues.map((issue) => issue.code)
    expect(codes).toContain('not-provided')
    expect(codes).not.toContain('missing-on-disk')
    expect(codes).toContain('path-conflict')
    expect(codes).toContain('content-conflict')
    expect(codes).toContain('missing-reference')
  })

  it('estimates 120 words at 120 per minute plus a pause, and does not guess a rate', () => {
    const result = runVoiceoverTimingPlanner(JSON.stringify({
      unit: 'word', ratePerMin: 120,
      segments: [{ id: 's', text: 'one', count: 120, pauseSec: 5 }],
    }))
    expect((result.json as { result: { cues: { seconds: string }[] } }).result.cues[0]!.seconds).toBe('65')
    const unknown = runVoiceoverTimingPlanner(JSON.stringify({ segments: [{ id: 's', text: 'hello world', pauseSec: 1 }] }))
    expect((unknown.json as { result: { cues: { seconds: string }[] } }).result.cues[0]!.seconds).toBe('unknown')
    expect(presentResult(runVoiceoverTimingPlanner, '{"segments":[]}').error).toBe('empty')
  })
})
