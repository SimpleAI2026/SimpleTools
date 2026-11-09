import { testRegex } from './regexBudget'
import {
  IntakeError,
  asRecords,
  boolish,
  finish,
  fnv,
  inertText,
  listFrom,
  num,
  readDocument,
  str,
  zipTextFiles,
  bytesToBase64,
  type WorkflowResult,
} from './core'

function rootObject(text: string, kind: string): Record<string, unknown> {
  const doc = readDocument(text, kind)
  if (doc.format === 'csv') throw new IntakeError('bad-input')
  if (!doc.value || typeof doc.value !== 'object' || Array.isArray(doc.value)) throw new IntakeError('bad-input')
  return doc.value as Record<string, unknown>
}

function rowsOf(text: string, kind: string, keys: string[]): { doc: ReturnType<typeof readDocument>; rows: Record<string, unknown>[]; extra: Record<string, unknown> } {
  const doc = readDocument(text, kind)
  if (doc.format === 'csv') return { doc, rows: asRecords(doc.value), extra: {} }
  if (Array.isArray(doc.value)) return { doc, rows: asRecords(doc.value), extra: {} }
  if (doc.value && typeof doc.value === 'object') {
    const extra = doc.value as Record<string, unknown>
    return { doc, rows: listFrom(extra, keys), extra }
  }
  throw new IntakeError('bad-input')
}

export function runGeoQuestionPanel(input: string): WorkflowResult {
  const { rows, extra } = rowsOf(input, 'geo-question-panel', ['questions', 'rows'])
  if (rows.length === 0) throw new IntakeError('empty')
  const version = str(extra.version) || str(rows[0]?.version) || 'v1'
  const seen = new Set<string>()
  const out = rows.map((row, index) => {
    const question = str(row.question ?? row.q).trim()
    if (!question) throw new IntakeError('bad-input')
    const language = str(row.language ?? row.lang).trim()
    const audience = str(row.audience).trim()
    const source = str(row.source)
    const explicit = str(row.id).trim()
    let id = explicit || `q_${fnv([question, language, audience])}`
    if (seen.has(id)) id = `${id}_${index}`
    seen.add(id)
    return { id, question, language, audience, source, version }
  })
  return finish(
    'geo-question-panel',
    { version, questions: out },
    `${out.length} frozen questions in ${version}. Different wording stays separate; nothing was generated.`,
    { version, questions: out },
    ['id', 'question', 'language', 'audience', 'source', 'version'],
    out.map((r) => [r.id, r.question, r.language, r.audience, r.source, r.version]),
  )
}

export function runAiAnswerSnapshot(input: string): WorkflowResult {
  const { rows, extra } = rowsOf(input, 'ai-answer-snapshot', ['answers', 'rows'])
  if (rows.length === 0) throw new IntakeError('empty')
  const aliases = Array.isArray(extra.aliases) ? extra.aliases.map(str).filter(Boolean) : []
  const out = rows.map((row) => {
    const rowAliases = str(row.aliases).split('|').map((s) => s.trim()).filter(Boolean)
    const names = aliases.length ? aliases : rowAliases.length ? rowAliases : (str(row.brand) ? [str(row.brand)] : [])
    const text = str(row.text ?? row.answer)
    const citations = Array.isArray(row.citations)
      ? row.citations.map(str).filter(Boolean)
      : str(row.citations).split('|').map((s) => s.trim()).filter(Boolean)
    const hosts = citations.map(hostOf)
    const mention = names.length > 0 && names.some((name) => text.toLowerCase().includes(name.toLowerCase()))
    let verdict = 'unknown'
    if (names.length === 0 || (!text.trim() && citations.length === 0)) verdict = 'unknown'
    else if (mention && citations.length === 0) verdict = 'mention_without_citation'
    else if (!mention && citations.length > 0) verdict = 'citation_without_mention'
    else if (mention && citations.length > 0) verdict = 'both'
    else verdict = 'unknown'
    return { id: str(row.id) || `a_${fnv([text, citations.join('|')])}`, verdict, mention, hosts: hosts.join('|'), citations: citations.join('|') }
  })
  return finish(
    'ai-answer-snapshot',
    { aliases, answers: rows },
    'Mention, citation-only, and unknown are separate. No page was fetched.',
    { answers: out },
    ['id', 'verdict', 'mention', 'hosts', 'citations'],
    out.map((r) => [r.id, r.verdict, r.mention, r.hosts, r.citations]),
  )
}

function hostOf(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase()
  } catch {
    return 'invalid-url'
  }
}

export function runAiPanelObservations(input: string): WorkflowResult {
  const { rows, extra } = rowsOf(input, 'ai-panel-observations', ['observations', 'rows'])
  if (rows.length === 0) throw new IntakeError('empty')
  const slots = Array.isArray(extra.slots) ? asRecords(extra.slots) : []
  const plannedOverride = num(extra.planned)
  const groups = new Map<string, { product: string; mode: string; planned: number; answered: number; mentioned: number; failed: number }>()
  const stratumKey = (product: string, mode: string) => `${product}\u001f${mode}`
  if (slots.length) {
    for (const slot of slots) {
      const product = str(slot.product) || 'default'
      const mode = str(slot.mode) || 'unspecified'
      const g = groups.get(stratumKey(product, mode)) ?? { product, mode, planned: 0, answered: 0, mentioned: 0, failed: 0 }
      g.planned += 1
      groups.set(stratumKey(product, mode), g)
    }
  }
  for (const row of rows) {
    const product = str(row.product) || 'default'
    const mode = str(row.mode) || 'unspecified'
    const key = stratumKey(product, mode)
    const g = groups.get(key) ?? { product, mode, planned: plannedOverride ?? 0, answered: 0, mentioned: 0, failed: 0 }
    const outcome = str(row.outcome || row.status).toLowerCase()
    if (outcome === 'answered') {
      g.answered += 1
      if (boolish(row.mentioned) === true) g.mentioned += 1
    } else if (outcome === 'failed') g.failed += 1
    groups.set(key, g)
  }
  const table = [...groups.values()].map((g) => {
    const planned = slots.length ? g.planned : plannedOverride ?? g.planned
    return {
      ...g,
      planned,
      coverage: `${g.answered}/${planned}`,
      mention_rate: g.answered === 0 ? 'unknown' : `${g.mentioned}/${g.answered}`,
    }
  })
  return finish(
    'ai-panel-observations',
    { planned: plannedOverride, slots, observations: rows },
    'Coverage uses the planned denominator. Mention rate uses answered only. Modes are not pooled.',
    { strata: table },
    ['product', 'mode', 'planned', 'answered', 'mentioned', 'failed', 'coverage', 'mention_rate'],
    table.map((r) => [r.product, r.mode, r.planned, r.answered, r.mentioned, r.failed, r.coverage, r.mention_rate]),
  )
}

export function runClaimEvidenceLedger(input: string): WorkflowResult {
  const root = rootObject(input, 'claim-evidence-ledger')
  const claims = listFrom(root.claims ?? [], ['claims'])
  const links = Array.isArray(root.links) ? asRecords(root.links) : Array.isArray(root.evidence) ? asRecords(root.evidence) : []
  if (claims.length === 0) throw new IntakeError('empty')
  const claimById = new Map(claims.map((c) => [str(c.id), c]))
  const ledger = links.map((link) => {
    const claim = claimById.get(str(link.claim_id))
    const relation = str(link.relation).toLowerCase()
    const claimYear = num(claim?.year ?? link.claim_year)
    const evidenceYear = num(link.evidence_year ?? link.year)
    let status = 'pending'
    if (!relation || relation === 'pending') status = 'pending'
    else if (relation === 'refute' || relation === 'refutes') status = 'user_marked_refute'
    else if (relation === 'support' || relation === 'supports') {
      status = claimYear != null && evidenceYear != null && claimYear - evidenceYear >= 2 ? 'needs_review' : 'user_marked_support'
    } else status = 'pending'
    return {
      claim_id: str(link.claim_id),
      claim: str(claim?.text ?? link.claim),
      excerpt: str(link.excerpt),
      source_id: str(link.source_id),
      file_id: str(link.file_id ?? link.evidence_file_id),
      status,
    }
  })
  if (ledger.some((row) => row.status === 'true' || row.status === 'verified')) throw new IntakeError('bad-input')
  return finish(
    'claim-evidence-ledger',
    root,
    'A citation is not an automatic truth label. Stale support stays needs_review.',
    { ledger },
    ['claim_id', 'status', 'source_id', 'file_id', 'excerpt'],
    ledger.map((r) => [r.claim_id, r.status, r.source_id, r.file_id, r.excerpt]),
  )
}

export function runEvidenceAnswerBrief(input: string): WorkflowResult {
  const root = rootObject(input, 'evidence-answer-brief')
  const requirements = listFrom(root.requirements ?? [], ['requirements'])
  if (requirements.length === 0) throw new IntakeError('empty')
  const ledger = Array.isArray(root.ledger) ? asRecords(root.ledger) : []
  const known = new Map(ledger.map((row) => [str(row.id ?? row.evidence_id), row]))
  const mapped = requirements.map((req) => {
    const ids = Array.isArray(req.evidence_ids) ? req.evidence_ids.map(str).filter(Boolean) : str(req.evidence_ids).split('|').filter(Boolean)
    if (ids.length === 0) return { id: str(req.id), text: str(req.text), status: 'gap', evidence: [] as string[] }
    const missing = ids.filter((id) => !known.has(id))
    return { id: str(req.id), text: str(req.text), status: missing.length ? 'pending' : 'covered', evidence: ids }
  })
  const lines = [
    `# Brief ${inertText(str(root.question_id))}`,
    '',
    `Audience: ${inertText(str(root.audience))}`,
    '',
    'No body copy was generated.',
    '',
    ...mapped.map((row) => `- ${inertText(row.id)} [${row.status}] ${inertText(row.text)}`),
  ]
  const markdown = lines.join('\n')
  return finish(
    'evidence-answer-brief',
    root,
    `${mapped.filter((r) => r.status === 'gap').length} gaps, ${mapped.filter((r) => r.status === 'pending').length} pending.`,
    { requirements: mapped },
    ['id', 'status', 'text', 'evidence'],
    mapped.map((r) => [r.id, r.status, r.text, r.evidence.join('|')]),
    [{ name: 'brief.md', text: markdown }],
  )
}

function jsonPath(value: unknown, path: string): { ok: true; value: unknown } | { ok: false } {
  const parts = path.replace(/^\$\.?/, '').split('.').filter(Boolean)
  let cur: unknown = value
  for (const part of parts) {
    if (Array.isArray(cur) && /^\d+$/.test(part)) cur = cur[Number(part)]
    else if (cur && typeof cur === 'object' && !Array.isArray(cur) && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part]
    else return { ok: false }
  }
  return { ok: true, value: cur }
}

export function runAgentEvalCases(input: string): WorkflowResult {
  const root = rootObject(input, 'agent-eval-cases')
  const cases = listFrom(root.cases ?? [], ['cases'])
  if (cases.length === 0) throw new IntakeError('empty')
  const results = cases.map((row) => {
    const id = str(row.id) || `c_${fnv([str(row.output)])}`
    if (!('output' in row) || row.output == null || str(row.output) === '') return { id, status: 'unknown', detail: 'missing-material' }
    const output = str(row.output)
    const rules = Array.isArray(row.rules) ? asRecords(row.rules) : []
    if (rules.length === 0) return { id, status: 'unknown', detail: 'missing-rules' }
    let parsed: unknown
    let parsedOk = false
    try {
      parsed = JSON.parse(output) as unknown
      parsedOk = true
    } catch {
      parsedOk = false
    }
    for (const rule of rules) {
      if (rule.path != null || rule.equals !== undefined) {
        if (!parsedOk) return { id, status: 'invalid', detail: 'bad-json' }
        const got = jsonPath(parsed, str(rule.path || '$'))
        if (!got.ok) return { id, status: 'fail', detail: `missing-path:${str(rule.path)}` }
        if (rule.equals !== undefined && JSON.stringify(got.value) !== JSON.stringify(rule.equals)) return { id, status: 'fail', detail: `not-equal:${str(rule.path)}` }
      }
      if (rule.contains != null && !output.includes(str(rule.contains))) return { id, status: 'fail', detail: 'missing-text' }
      if (rule.regex != null) {
        const hit = testRegex(str(rule.regex), str(rule.flags), output)
        if (hit.status === 'timeout' || hit.status === 'too-long') return { id, status: 'incomplete', detail: hit.status }
        if (hit.status === 'invalid') return { id, status: 'invalid', detail: 'bad-regex' }
        if (hit.status === 'nomatch') return { id, status: 'fail', detail: 'regex-miss' }
      }
    }
    return { id, status: 'pass', detail: 'rules-met' }
  })
  const jsonl = cases.map((row) => JSON.stringify(row)).join('\n')
  const artifact = finish(
    'agent-eval-cases',
    root,
    'Deterministic rules only. Timeout is incomplete, not a pass. No agent was executed.',
    { results },
    ['id', 'status', 'detail'],
    results.map((r) => [r.id, r.status, r.detail]),
    [{ name: 'cases.jsonl', text: jsonl }],
  )
  artifact.files.push({ name: 'cases.zip.b64', text: bytesToBase64(zipTextFiles([{ name: 'cases.jsonl', text: jsonl }, { name: 'results.csv', text: artifact.csv }])) })
  return artifact
}

export function runUtmBuilder(input: string): WorkflowResult {
  const { rows, extra } = rowsOf(input, 'utm-builder', ['links', 'rows'])
  if (rows.length === 0) throw new IntakeError('empty')
  const required = Array.isArray(extra.required) ? extra.required.map(str) : ['utm_source', 'utm_medium', 'utm_campaign']
  const dictionary = extra.dictionary && typeof extra.dictionary === 'object' && !Array.isArray(extra.dictionary) ? (extra.dictionary as Record<string, unknown>) : {}
  const onDuplicate = str(extra.onDuplicate || 'overwrite')
  const issues: { id: string; code: string; detail: string }[] = []
  const campaignSources = new Map<string, Set<string>>()
  const links = rows.map((row) => {
    const id = str(row.id) || `l_${fnv([str(row.url)])}`
    let url: URL
    try {
      url = new URL(str(row.url))
    } catch {
      issues.push({ id, code: 'bad-url', detail: str(row.url) })
      return { id, url: '', issues: 'bad-url' }
    }
    const utm = row.utm && typeof row.utm === 'object' && !Array.isArray(row.utm)
      ? (row.utm as Record<string, unknown>)
      : Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].filter((k) => str(row[k])).map((k) => [k, row[k]]))
    for (const key of required) {
      if (!str(utm[key]).trim()) issues.push({ id, code: 'missing-required', detail: key })
    }
    for (const [key, value] of Object.entries(utm)) {
      const text = str(value)
      const allowed = dictionary[key]
      if (Array.isArray(allowed) && allowed.length && !allowed.map(str).includes(text)) issues.push({ id, code: 'dictionary', detail: `${key}=${text}` })
      const existing = url.searchParams.getAll(key)
      if (existing.length && onDuplicate === 'error') issues.push({ id, code: 'duplicate-utm', detail: key })
      if (existing.length && onDuplicate === 'keep') continue
      url.searchParams.delete(key)
      url.searchParams.append(key, text)
    }
    const campaign = str(utm.utm_campaign)
    const source = str(utm.utm_source)
    if (campaign && source) {
      const bucket = campaignSources.get(campaign.toLowerCase()) ?? new Set<string>()
      bucket.add(source)
      campaignSources.set(campaign.toLowerCase(), bucket)
    }
    return { id, url: url.href, issues: '' }
  })
  for (const [campaign, sources] of campaignSources) {
    const folded = new Map<string, string[]>()
    for (const source of sources) {
      const key = source.toLowerCase()
      folded.set(key, [...(folded.get(key) ?? []), source])
    }
    for (const variants of folded.values()) {
      if (new Set(variants).size > 1) issues.push({ id: campaign, code: 'source-case-conflict', detail: variants.join('|') })
    }
  }
  const decorated = links.map((link) => ({ ...link, issues: issues.filter((issue) => issue.id === link.id).map((issue) => issue.code).join('|') }))
  return finish(
    'utm-builder',
    extra && Object.keys(extra).length ? { ...extra, links: rows } : rows,
    'Links keep the original hash and non-UTM query. Values are encoded once. No click was sent.',
    { links: decorated, issues },
    ['id', 'url', 'issues'],
    decorated.map((r) => [r.id, r.url, r.issues]),
    [{ name: 'utm-issues.json', text: JSON.stringify(issues, null, 2) }],
  )
}

export function runStoryboardVariants(input: string): WorkflowResult {
  const root = rootObject(input, 'ai-storyboard-variants')
  const shots = listFrom(root.shots ?? [], ['shots'])
  const variants = Array.isArray(root.variants) ? asRecords(root.variants) : []
  const takes = Array.isArray(root.takes) ? asRecords(root.takes) : []
  if (shots.length === 0) throw new IntakeError('empty')
  const byId = new Map(variants.map((v) => [str(v.id), v]))
  const traced = variants.map((variant) => {
    const parent = byId.get(str(variant.parent_id))
    const fields = ['prompt', 'model', 'camera', 'reference']
    const changed = parent ? fields.filter((field) => str(parent[field]) !== str(variant[field])) : []
    return { id: str(variant.id), shot_id: str(variant.shot_id), parent_id: str(variant.parent_id), changed: changed.join('|'), camera: str(variant.camera) }
  })
  const missing = takes.filter((take) => !str(take.file).trim() || /^https?:\/\//i.test(str(take.file))).map((take) => ({
    id: str(take.id),
    variant_id: str(take.variant_id),
    status: /^https?:\/\//i.test(str(take.file)) ? 'remote-not-fetched' : 'missing-file',
  }))
  const shotCsv = shots.map((shot) => [str(shot.id), str(shot.title), traced.filter((v) => v.shot_id === str(shot.id)).length])
  const json = JSON.stringify({ shots, variants: traced, missing }, null, 2)
  return finish(
    'ai-storyboard-variants',
    root,
    'Camera-only changes stay attached to the shot. Missing files are not fetched.',
    { variants: traced, missing },
    ['shot_id', 'title', 'variants'],
    shotCsv,
    [{ name: 'storyboard.json', text: json }, { name: 'storyboard.zip.b64', text: bytesToBase64(zipTextFiles([{ name: 'storyboard.json', text: json }])) }],
  )
}

export interface Cue {
  start: number
  end: number
  text: string
}

export function parseTimestamp(value: string): number | null {
  const m = /^(\d{2,}):([0-5]\d):([0-5]\d)[,.](\d{1,3})$/.exec(value.trim())
  if (!m) return null
  const ms = Number(m[4]!.padEnd(3, '0'))
  return ((Number(m[1]) * 60 + Number(m[2])) * 60 + Number(m[3])) * 1000 + ms
}

export function formatTimestamp(ms: number, comma: boolean): string {
  const clamped = Math.max(0, Math.round(ms))
  const h = Math.floor(clamped / 3_600_000)
  const m = Math.floor((clamped % 3_600_000) / 60_000)
  const s = Math.floor((clamped % 60_000) / 1000)
  const milli = clamped % 1000
  const p = (n: number, w: number) => String(n).padStart(w, '0')
  return `${p(h, 2)}:${p(m, 2)}:${p(s, 2)}${comma ? ',' : '.'}${p(milli, 3)}`
}

export function parseCues(text: string): { format: 'srt' | 'vtt'; cues: Cue[]; complex: boolean } {
  const raw = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim()
  if (!raw) throw new IntakeError('empty')
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
    const [a, b] = timeLine.split('-->').map((part) => part.trim().split(/\s/)[0] ?? '')
    const start = parseTimestamp(a ?? '')
    const end = parseTimestamp(b ?? '')
    if (start == null || end == null || end < start) throw new IntakeError('bad-input')
    const textLines = lines.slice(lines.indexOf(timeLine) + 1)
    cues.push({ start, end, text: textLines.join('\n') })
  }
  if (cues.length === 0) throw new IntakeError('bad-input')
  return { format, cues, complex: false }
}

export function runSubtitleToolkit(input: string): WorkflowResult {
  const doc = readDocument(input, 'subtitle-toolkit')
  let source = ''
  let offset = 0
  let target: 'srt' | 'vtt' | 'txt' = 'srt'
  if (doc.format === 'json' && doc.value && typeof doc.value === 'object' && !Array.isArray(doc.value)) {
    const o = doc.value as Record<string, unknown>
    source = str(o.text ?? o.subtitle)
    offset = num(o.offsetMs) ?? 0
    const t = str(o.target)
    if (t === 'vtt' || t === 'txt' || t === 'srt') target = t
  } else source = doc.text
  const parsed = parseCues(source)
  if (parsed.complex) {
    return finish('subtitle-toolkit', { text: source, offsetMs: offset, target }, 'STYLE, REGION, or voice cues were kept raw and not converted.', { converted: false, reason: 'complex-style-region-or-voice' }, ['code', 'detail'], [['rejected', 'complex-style-region-or-voice']], [{ name: 'subtitles.original.txt', text: source }])
  }
  const cues = parsed.cues.map((cue) => ({ ...cue, start: cue.start + offset, end: cue.end + offset }))
  const overlaps = cues.slice(1).filter((cue, i) => cue.start < cues[i]!.end).length
  let rendered = ''
  if (target === 'txt') rendered = cues.map((cue) => cue.text).join('\n\n')
  else if (target === 'vtt') {
    rendered = `WEBVTT\n\n${cues.map((cue) => `${formatTimestamp(cue.start, false)} --> ${formatTimestamp(cue.end, false)}\n${cue.text}`).join('\n\n')}\n`
  } else {
    rendered = cues.map((cue, i) => `${i + 1}\n${formatTimestamp(cue.start, true)} --> ${formatTimestamp(cue.end, true)}\n${cue.text}`).join('\n\n') + '\n'
  }
  return finish(
    'subtitle-toolkit',
    { text: source, offsetMs: offset, target },
    overlaps ? `${overlaps} overlaps flagged, not treated as hard errors.` : `${cues.length} cues written.`,
    { converted: true, overlaps, cues },
    ['index', 'start', 'end', 'overlap', 'text'],
    cues.map((cue, i) => [i + 1, formatTimestamp(cue.start, false), formatTimestamp(cue.end, false), i > 0 && cue.start < cues[i - 1]!.end ? 'warn' : '', cue.text]),
    [{ name: target === 'txt' ? 'transcript.txt' : target === 'vtt' ? 'subtitles.vtt' : 'subtitles.srt', text: rendered }],
  )
}

export function runGenerationTakeLedger(input: string): WorkflowResult {
  const root = rootObject(input, 'generation-take-ledger')
  const assets = listFrom(root.assets ?? [], ['assets'])
  const grants = Array.isArray(root.grants) ? asRecords(root.grants) : []
  const uses = Array.isArray(root.uses) ? asRecords(root.uses) : []
  if (assets.length === 0) throw new IntakeError('empty')
  const asOf = str(root.asOf)
  const clearance = uses.map((use) => {
    const assetGrants = grants.filter((g) => str(g.asset_id) === str(use.asset_id))
    const matching = assetGrants.filter((g) => scopeCovers(str(g.scope), str(use.use)) && territoryOk(str(g.territory), str(use.territory)) && !expired(str(g.expires), asOf))
    const unknown = assetGrants.length === 0 || assetGrants.every((g) => !str(g.scope))
    let status = 'not-cleared'
    if (unknown) status = 'unknown'
    else if (matching.length && matching.every((g) => str(g.evidence))) status = 'recorded'
    else if (matching.length) status = 'missing-evidence'
    return { use_id: str(use.id), asset_id: str(use.asset_id), use: str(use.use), status }
  })
  return finish(
    'generation-take-ledger',
    root,
    'Social permission is not expanded to ads. Unknown is not cleared. This is not a copyright ruling.',
    { clearance },
    ['use_id', 'asset_id', 'use', 'status'],
    clearance.map((r) => [r.use_id, r.asset_id, r.use, r.status]),
  )
}

function scopeCovers(grant: string, use: string): boolean {
  if (!grant || !use) return false
  if (grant === 'all') return true
  return grant === use
}

function territoryOk(grant: string, use: string): boolean {
  if (!use || grant === 'world' || grant === '') return grant !== ''
  return grant === use
}

function expired(expires: string, asOf: string): boolean {
  if (!expires || !asOf) return false
  return expires < asOf
}
