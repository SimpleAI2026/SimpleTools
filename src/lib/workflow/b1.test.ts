import { describe, expect, it } from 'vitest'
import { presentResult } from './core'
import {
  formatTimestamp,
  parseTimestamp,
  runAgentEvalCases,
  runAiAnswerSnapshot,
  runAiPanelObservations,
  runClaimEvidenceLedger,
  runEvidenceAnswerBrief,
  runGenerationTakeLedger,
  runGeoQuestionPanel,
  runStoryboardVariants,
  runSubtitleToolkit,
  runUtmBuilder,
} from './b1'

describe('geo question panel', () => {
  const v1 = 'question,language,audience,source,id\nHow does it work?,en,dev,interview,\n它怎么运行,zh-CN,dev,ticket,q-keep\n=cmd,en,dev,sheet,\n'
  it('freezes ids, keeps wording apart, and round-trips', () => {
    const first = runGeoQuestionPanel(v1)
    const ids = (first.json as { result: { questions: { id: string; source: string; question: string }[] } }).result.questions
    expect(ids.map((row) => row.id)).toEqual(['q_59ab6821', 'q-keep', 'q_c7407396'])
    expect(ids[0]!.id).not.toBe(ids[2]!.id)
    expect(ids[1]!.source).toBe('ticket')
    expect(first.csv).toContain("'=cmd")
    const again = runGeoQuestionPanel(JSON.stringify(first.json))
    expect((again.json as { result: { questions: { id: string }[] } }).result.questions.map((row) => row.id)).toEqual(ids.map((row) => row.id))
    const v2 = runGeoQuestionPanel(`${v1}A new question?,en,dev,added,\n`)
    const next = (v2.json as { result: { questions: { id: string }[] } }).result.questions
    expect(next.slice(0, 3).map((row) => row.id)).toEqual(ids.map((row) => row.id))
    expect(next).toHaveLength(4)
  })
  it('rejects empty and broken csv', () => {
    expect(presentResult(runGeoQuestionPanel, '').error).toBe('empty')
    expect(presentResult(runGeoQuestionPanel, '"open').error).toBe('invalid-csv')
    expect(presentResult(runGeoQuestionPanel, 'x'.repeat(1_500_001)).error).toBe('too-large')
  })
})

describe('answer snapshot and observations', () => {
  it('separates mention, citation-only, and unknown', () => {
    const result = runAiAnswerSnapshot(JSON.stringify({
      aliases: ['Acme'],
      answers: [
        { id: 'm', text: 'Acme is fine', citations: [] },
        { id: 'c', text: 'no brand here', citations: ['https://other.example/a'] },
        { id: 'u', text: '', citations: [] },
        { id: 'b', text: 'See Acme', citations: ['https://acme.example/a'] },
      ],
    }))
    const verdicts = (result.json as { result: { answers: { verdict: string }[] } }).result.answers.map((row) => row.verdict)
    expect(verdicts).toEqual(['mention_without_citation', 'citation_without_mention', 'unknown', 'both'])
  })
  it('keeps planned, answered, and mentioned denominators apart', () => {
    const observations = [
      ...Array.from({ length: 4 }, (_, i) => ({ question_id: `q${i}`, product: 'app', mode: 'ui', outcome: 'answered', mentioned: true })),
      ...Array.from({ length: 4 }, (_, i) => ({ question_id: `q${i + 4}`, product: 'app', mode: 'ui', outcome: 'answered', mentioned: false })),
      ...Array.from({ length: 2 }, (_, i) => ({ question_id: `q${i + 8}`, product: 'app', mode: 'ui', outcome: 'failed', mentioned: true })),
    ]
    const result = runAiPanelObservations(JSON.stringify({ planned: 10, observations }))
    const row = (result.json as { result: { strata: { coverage: string; mention_rate: string }[] } }).result.strata[0]!
    expect(row.coverage).toBe('8/10')
    expect(row.mention_rate).toBe('4/8')
    expect(presentResult(runAiPanelObservations, '').error).toBe('empty')
    expect(presentResult(runAiAnswerSnapshot, '{').error).toBe('invalid-json')
  })
})

describe('claim ledger, brief, eval, utm', () => {
  it('does not mark stale support as true', () => {
    const result = runClaimEvidenceLedger(JSON.stringify({
      claims: [{ id: 'c1', text: 'Price is 99', year: 2026 }],
      links: [{ claim_id: 'c1', excerpt: 'was 99', source_id: 's', file_id: 'f', evidence_year: 2023, relation: 'supports' }],
    }))
    const status = (result.json as { result: { ledger: { status: string }[] } }).result.ledger[0]!.status
    expect(status).toBe('needs_review')
    expect(JSON.stringify(result.json)).not.toContain('"status":"true"')
    expect(presentResult(runClaimEvidenceLedger, '{"claims":[]}').error).toBe('empty')
  })
  it('keeps a gap and flips a deleted evidence id to pending', () => {
    const withEvidence = runEvidenceAnswerBrief(JSON.stringify({
      question_id: 'q', audience: 'editors',
      requirements: [{ id: 'r1', text: 'Need a source <script>', evidence_ids: ['e1'] }, { id: 'r2', text: 'No source', evidence_ids: [] }],
      ledger: [{ id: 'e1', source: 'manual', excerpt: 'fact' }],
    }))
    const rows = (withEvidence.json as { result: { requirements: { status: string }[] } }).result.requirements
    expect(rows.map((row) => row.status)).toEqual(['covered', 'gap'])
    expect(withEvidence.files.find((file) => file.name === 'brief.md')!.text).toContain('&lt;script&gt;')
    expect(withEvidence.files.find((file) => file.name === 'brief.md')!.text).not.toContain('<script>')
    const removed = runEvidenceAnswerBrief(JSON.stringify({
      question_id: 'q', audience: 'editors',
      requirements: [{ id: 'r1', text: 'Need a source', evidence_ids: ['e1'] }],
      ledger: [],
    }))
    expect((removed.json as { result: { requirements: { status: string }[] } }).result.requirements[0]!.status).toBe('pending')
  })
  it('marks bad json, missing material, failures, and regex timeout', () => {
    const result = runAgentEvalCases(JSON.stringify({
      cases: [
        { id: 'ok', output: '{"a":1}', rules: [{ path: 'a', equals: 1 }] },
        { id: 'bad', output: '{', rules: [{ path: 'a', equals: 1 }] },
        { id: 'miss', rules: [{ contains: 'x' }] },
        { id: 'fail', output: 'hello', rules: [{ contains: 'x' }] },
        { id: 'slow', output: `${'a'.repeat(24)}c`, rules: [{ regex: '(a+)+b' }] },
      ],
    }))
    const statuses = (result.json as { result: { results: { status: string }[] } }).result.results.map((row) => row.status)
    expect(statuses).toEqual(['pass', 'invalid', 'unknown', 'fail', 'incomplete'])
    expect(result.files.some((file) => file.name.endsWith('.b64'))).toBe(true)
    expect(presentResult(runAgentEvalCases, '{"__proto__":1}').error).toBe('forbidden-key')
  })
  it('preserves hash and query, encodes once, and flags case conflicts', () => {
    const result = runUtmBuilder(JSON.stringify({
      onDuplicate: 'overwrite',
      links: [
        { id: '1', url: 'https://ex.com/a?x=1&utm_source=old#hero', utm_source: 'newsletter', utm_medium: 'email', utm_campaign: '春促' },
        { id: '2', url: 'https://ex.com/b', utm_source: 'Email', utm_medium: 'email', utm_campaign: 'Spring' },
        { id: '3', url: 'https://ex.com/c', utm_source: 'email', utm_medium: 'email', utm_campaign: 'spring' },
        { id: '4', url: 'https://ex.com/d', utm_medium: 'email', utm_campaign: 'fall' },
      ],
    }))
    const links = (result.json as { result: { links: { id: string; url: string; issues: string }[]; issues: { code: string }[] } }).result
    const first = new URL(links.links[0]!.url)
    expect(first.searchParams.get('x')).toBe('1')
    expect(first.searchParams.get('utm_source')).toBe('newsletter')
    expect(first.searchParams.get('utm_campaign')).toBe('春促')
    expect(first.hash).toBe('#hero')
    expect(links.links[0]!.url).not.toContain('%25')
    expect(links.issues.some((issue) => issue.code === 'source-case-conflict')).toBe(true)
    expect(links.links[3]!.issues).toContain('missing-required')
    expect(presentResult(runUtmBuilder, '"open').error).toBe('invalid-csv')
    expect(presentResult(runUtmBuilder, '').error).toBe('empty')
  })
})

describe('storyboard, subtitles, rights', () => {
  it('traces a camera-only change and does not fetch a missing file', () => {
    const result = runStoryboardVariants(JSON.stringify({
      shots: [{ id: 's1', title: 'Open' }],
      variants: [
        { id: 'v1', shot_id: 's1', prompt: 'wide', model: 'note', camera: 'wide' },
        { id: 'v2', shot_id: 's1', parent_id: 'v1', prompt: 'wide', model: 'note', camera: 'close' },
      ],
      takes: [{ id: 't1', variant_id: 'v2', file: '' }, { id: 't2', variant_id: 'v2', file: 'https://example.com/a.png' }],
    }))
    const variants = (result.json as { result: { variants: { changed: string }[]; missing: { status: string }[] } }).result
    expect(variants.variants[1]!.changed).toBe('camera')
    expect(variants.missing.map((row) => row.status).sort()).toEqual(['missing-file', 'remote-not-fetched'])
  })
  it('carries 59.900 seconds plus 200 ms and keeps complex cues', () => {
    expect(parseTimestamp('00:00:59,900')).toBe(59900)
    expect(formatTimestamp(60100, true)).toBe('00:01:00,100')
    const shifted = runSubtitleToolkit(JSON.stringify({ text: '1\n\n00:00:59,900 --> 00:01:00,200\nHello\n', offsetMs: 200, target: 'vtt' }))
    expect(shifted.files.find((file) => file.name.endsWith('.vtt'))!.text).toContain('00:01:00.100 --> 00:01:00.400')
    const overlap = runSubtitleToolkit('1\n\n00:00:00,000 --> 00:00:02,000\nA\n\n2\n\n00:00:01,000 --> 00:00:03,000\nB\n')
    expect((overlap.json as { result: { overlaps: number } }).result.overlaps).toBe(1)
    const complex = runSubtitleToolkit('WEBVTT\n\nSTYLE\n::cue { color: white }\n\n00:00:00.000 --> 00:00:01.000\nHi\n')
    expect((complex.json as { result: { converted: boolean } }).result.converted).toBe(false)
    expect(presentResult(runSubtitleToolkit, '').error).toBe('empty')
    expect(presentResult(runSubtitleToolkit, '1\n\n00:00:61,000 --> 00:00:62,000\nX\n').error).toBe('bad-input')
  })
  it('does not expand a social grant to ads or treat unknown as cleared', () => {
    const result = runGenerationTakeLedger(JSON.stringify({
      asOf: '2026-11-08',
      assets: [{ id: 'a1' }],
      grants: [
        { id: 'g1', asset_id: 'a1', scope: 'social', territory: 'world', expires: '2026-12-01', evidence: 'c1' },
        { id: 'g2', asset_id: 'a2', scope: '', territory: '', expires: '', evidence: '' },
      ],
      uses: [
        { id: 'u1', asset_id: 'a1', use: 'ads', territory: 'US' },
        { id: 'u2', asset_id: 'a2', use: 'social', territory: 'US' },
      ],
    }))
    const rows = (result.json as { result: { clearance: { status: string }[] } }).result.clearance
    expect(rows.map((row) => row.status)).toEqual(['not-cleared', 'unknown'])
    expect(rows.map((row) => row.status)).not.toContain('cleared')
  })
})

describe('stable question id', () => {
  it('uses the expected hash for the english question', () => {
    const result = runGeoQuestionPanel('question,language,audience,source,id\nHow does it work?,en,dev,interview,\n')
    const id = (result.json as { result: { questions: { id: string }[] } }).result.questions[0]!.id
    expect(id).toBe('q_59ab6821')
  })
})
