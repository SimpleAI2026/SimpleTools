import {
  IntakeError,
  asRecords,
  finish,
  fnv,
  inertText,
  listFrom,
  num,
  parseJsonValue,
  readDocument,
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

function overlaps(aFrom: string, aTo: string, bFrom: string, bTo: string): boolean {
  const af = aFrom || '0000-01-01'
  const at = aTo || '9999-12-31'
  const bf = bFrom || '0000-01-01'
  const bt = bTo || '9999-12-31'
  return af <= bt && bf <= at
}

export function runBrandEntityConsistency(input: string): WorkflowResult {
  const { rows } = rowsOf(input, 'brand-entity-consistency', ['facts', 'rows'])
  if (rows.length === 0) throw new IntakeError('empty')
  const facts = rows.map((row, index) => ({
    id: str(row.id) || `f${index + 1}`,
    group: str(row.alias_group || row.entity),
    attribute: str(row.attribute),
    region: str(row.region),
    currency: str(row.currency),
    value: str(row.value),
    from: str(row.valid_from),
    to: str(row.valid_to),
    source: str(row.source),
  }))
  const conflicts: { key: string; values: string; sources: string }[] = []
  for (let i = 0; i < facts.length; i++) {
    for (let j = i + 1; j < facts.length; j++) {
      const a = facts[i]!
      const b = facts[j]!
      if (a.group !== b.group || a.attribute !== b.attribute || a.region !== b.region || a.currency !== b.currency) continue
      if (a.value === b.value || !overlaps(a.from, a.to, b.from, b.to)) continue
      conflicts.push({ key: `${a.group}|${a.attribute}|${a.region}|${a.currency}`, values: `${a.value}|${b.value}`, sources: `${a.source}|${b.source}` })
    }
  }
  return finish(
    'brand-entity-consistency',
    { facts: rows },
    'Only the same entity group, attribute, region, and currency can conflict. Aliases merge only inside a supplied group.',
    { conflicts },
    ['key', 'values', 'sources'],
    conflicts.map((c) => [c.key, c.values, c.sources]),
  )
}

export function runGeoChangeExperiment(input: string): WorkflowResult {
  const root = rootObject(input, 'geo-change-experiment')
  const treatment = (root.treatment ?? {}) as Record<string, unknown>
  const control = (root.control ?? {}) as Record<string, unknown>
  const observations = Array.isArray(root.observations) ? asRecords(root.observations) : []
  if (observations.length === 0) throw new IntakeError('empty')
  const modelMismatch = str(treatment.model) !== str(control.model) || observations.some((row) => str(row.model) && str(row.model) !== str(row.arm === 'control' ? control.model : treatment.model))
  const panelMismatch = str(treatment.panel) !== str(control.panel) || observations.some((row) => str(row.panel) && str(row.panel) !== str(row.arm === 'control' ? control.panel : treatment.panel))
  const comparable = !modelMismatch && !panelMismatch
  const tally = (arm: string) => {
    const rows = observations.filter((row) => str(row.arm) === arm)
    const mentioned = rows.filter((row) => str(row.mentioned).toLowerCase() === 'true' || row.mentioned === true).length
    return { n: rows.length, mentioned }
  }
  const t = tally('treatment')
  const c = tally('control')
  const md = [
    `# ${inertText(str(root.hypothesis) || 'Experiment')}`,
    '',
    comparable ? 'Descriptive comparison only. This does not show cause.' : 'Not comparable: model or question panel differs. No improvement figure is reported.',
    '',
    `Treatment mentioned ${t.mentioned}/${t.n}`,
    `Control mentioned ${c.mentioned}/${c.n}`,
  ].join('\n')
  return finish(
    'geo-change-experiment',
    root,
    comparable ? 'Descriptive counts only. No causal claim.' : 'Marked not comparable because the model or panel changed.',
    { comparable, treatment: t, control: c },
    ['arm', 'n', 'mentioned', 'comparable'],
    [['treatment', t.n, t.mentioned, comparable], ['control', c.n, c.mentioned, comparable]],
    [{ name: 'experiment.md', text: md }],
  )
}

export function runCitationGapMap(input: string): WorkflowResult {
  const root = rootObject(input, 'citation-gap-map')
  const citations = listFrom(root.citations ?? [], ['citations'])
  const ownership = Array.isArray(root.ownership) ? asRecords(root.ownership) : []
  if (citations.length === 0) throw new IntakeError('empty')
  const ownerOf = new Map(ownership.map((row) => [str(row.domain).toLowerCase(), str(row.owner).toLowerCase() || 'unknown']))
  const self = str(root.self || 'self').toLowerCase()
  const themes = new Set(citations.map((row) => str(row.theme)))
  const gaps = [...themes].map((theme) => {
    const rows = citations.filter((row) => str(row.theme) === theme)
    const owners = rows.map((row) => ({ brand: str(row.brand), owner: ownerOf.get(str(row.domain).toLowerCase()) || 'unknown' }))
    const selfOwned = owners.some((row) => row.brand.toLowerCase() === self && row.owner === self)
    const exclusive = owners.filter((row) => row.owner !== 'unknown' && row.owner !== 'shared' && row.owner !== self && row.brand.toLowerCase() !== self)
    return { theme, self_owned: selfOwned, exclusive_competitor: exclusive.length > 0, gap: !selfOwned && exclusive.length > 0 }
  })
  return finish(
    'citation-gap-map',
    root,
    'Unknown and shared domains are not treated as a competitor exclusive. No citation was purchased or fetched.',
    { gaps },
    ['theme', 'self_owned', 'exclusive_competitor', 'gap'],
    gaps.map((g) => [g.theme, g.self_owned, g.exclusive_competitor, g.gap]),
  )
}

function normalizeQuote(value: string): string {
  return value.normalize('NFKC').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim()
}

export function runSourceQuoteVerifier(input: string): WorkflowResult {
  const root = rootObject(input, 'source-quote-verifier')
  const quotes = listFrom(root.quotes ?? [], ['quotes'])
  if (quotes.length === 0) throw new IntakeError('empty')
  const checks = quotes.map((row) => {
    const quote = str(row.quote)
    const source = str(row.source ?? row.source_text)
    const omission = quote.includes('…') || quote.includes('...')
    const exact = source.includes(quote)
    const nq = normalizeQuote(quote)
    const ns = normalizeQuote(source)
    let status = 'no_match'
    if (omission) {
      const parts = nq.split(/\u2026|\.\.\./).map((part) => part.trim()).filter(Boolean)
      let from = 0
      const ordered = parts.every((part) => {
        const at = ns.indexOf(part, from)
        if (at < 0) return false
        from = at + part.length
        return true
      })
      status = ordered && parts.length > 0 ? 'partial_omission' : 'no_match'
    } else if (exact) status = 'exact'
    else if (nq && ns.includes(nq)) status = 'normalized'
    return { id: str(row.id) || `q_${fnv([quote])}`, location: str(row.location), status, exact: status === 'exact' }
  })
  return finish(
    'source-quote-verifier',
    root,
    'Character match only. An ellipsis is not a full sentence. Changed digits do not match.',
    { checks },
    ['id', 'status', 'exact', 'location'],
    checks.map((c) => [c.id, c.status, c.exact, c.location]),
  )
}

export function runAgentTraceReview(input: string): WorkflowResult {
  let events: Record<string, unknown>[] = []
  try {
    const loaded = rowsOf(input, 'agent-trace-review', ['events', 'rows'])
    events = loaded.rows
  } catch (error) {
    if (!(error instanceof IntakeError) || error.code !== 'invalid-json') throw error
    const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) throw new IntakeError('empty')
    events = lines.map((line) => {
      const value = parseJsonValue(line)
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new IntakeError('bad-input')
      return value as Record<string, unknown>
    })
  }
  if (events.length === 0) throw new IntakeError('empty')
  const ids = new Set(events.map((event) => str(event.id)))
  let previous = ''
  const timeline = events.map((event) => {
    const ts = str(event.ts)
    const outOfOrder = Boolean(previous && ts && ts < previous)
    if (ts) previous = ts
    const rate = num(event.rate)
    const tokens = num(event.tokens)
    const parent = str(event.parent)
    return {
      id: str(event.id),
      parent,
      attempt: str(event.attempt),
      call: str(event.call),
      status: str(event.status),
      ts,
      out_of_order: outOfOrder,
      missing_parent: Boolean(parent) && !ids.has(parent),
      cost: rate == null || tokens == null ? 'unknown' : String(Math.round(rate * tokens * 1_000_000) / 1_000_000),
    }
  })
  return finish(
    'agent-trace-review',
    { events },
    'Retries stay on separate attempts. Missing events are not invented. Unknown rates stay unknown.',
    { timeline },
    ['id', 'parent', 'attempt', 'call', 'status', 'ts', 'out_of_order', 'missing_parent', 'cost'],
    timeline.map((row) => [row.id, row.parent, row.attempt, row.call, row.status, row.ts, row.out_of_order, row.missing_parent, row.cost]),
  )
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function blindOrder(ids: string[], seed: number): string[] {
  const rand = mulberry32(seed)
  const copy = [...ids]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = copy[i]!
    copy[i] = copy[j]!
    copy[j] = tmp
  }
  return copy
}

export function runBlindOutputReview(input: string): WorkflowResult {
  const root = rootObject(input, 'blind-output-review')
  const versions = listFrom(root.versions ?? [], ['versions'])
  const scores = Array.isArray(root.scores) ? asRecords(root.scores) : []
  if (versions.length === 0) throw new IntakeError('empty')
  const seed = num(root.seed) ?? 1
  const order = blindOrder(versions.map((row) => str(row.id)), seed)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const blind = order.map((id, index) => ({ code: letters[index] ?? `V${index + 1}`, text: str(versions.find((row) => str(row.id) === id)?.text) }))
  const reveal = order.map((id, index) => ({ code: letters[index] ?? `V${index + 1}`, version_id: id, label: str(versions.find((row) => str(row.id) === id)?.label) }))
  const groups = new Map<string, number[]>()
  for (const score of scores) {
    const key = `${str(score.version_id)}|${str(score.rubric_id)}`
    const value = num(score.score)
    if (value == null) continue
    groups.set(key, [...(groups.get(key) ?? []), value])
  }
  const disagreements = [...groups.entries()].filter(([, values]) => new Set(values).size > 1).map(([key, values]) => ({ key, values: values.join('|') }))
  return finish(
    'blind-output-review',
    root,
    'The blind list has codes only. The same seed rebuilds the order. This is not a sealed anonymity system.',
    { seed, blind, reveal, disagreements },
    ['code', 'text'],
    blind.map((row) => [row.code, row.text]),
    [{ name: 'reveal.json', text: JSON.stringify(reveal) }],
  )
}

export function runEvalDatasetSplitter(input: string): WorkflowResult {
  const { rows, extra } = rowsOf(input, 'eval-dataset-splitter', ['rows', 'samples'])
  if (rows.length === 0) throw new IntakeError('empty')
  const seed = num(extra.seed) ?? 1
  const byGroup = new Map<string, string>()
  const assigned = rows.map((row) => {
    const group = str(row.group || row.id)
    let split = byGroup.get(group)
    if (!split) {
      const bucket = Number.parseInt(fnv([String(seed), group]).slice(0, 4), 16) % 100
      split = bucket < 70 ? 'train' : bucket < 85 ? 'dev' : 'holdout'
      byGroup.set(group, split)
    }
    return { id: str(row.id), group, label: str(row.label), text: str(row.text), split }
  })
  const norm = (value: string) => value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLowerCase()
  const tokens = (value: string) => new Set(norm(value).split(' ').filter(Boolean))
  const flags: { id: string; other: string; code: string }[] = []
  for (let i = 0; i < assigned.length; i++) {
    for (let j = i + 1; j < assigned.length; j++) {
      const a = assigned[i]!
      const b = assigned[j]!
      if (norm(a.text) && norm(a.text) === norm(b.text)) flags.push({ id: a.id, other: b.id, code: 'exact-duplicate' })
      else {
        const ta = tokens(a.text)
        const tb = tokens(b.text)
        if (ta.size === 0 || tb.size === 0) continue
        let inter = 0
        for (const token of ta) if (tb.has(token)) inter++
        const jaccard = inter / (ta.size + tb.size - inter)
        if (jaccard >= 0.85) flags.push({ id: a.id, other: b.id, code: 'needs-human' })
      }
    }
  }
  const manifest = { seed, counts: { train: assigned.filter((r) => r.split === 'train').length, dev: assigned.filter((r) => r.split === 'dev').length, holdout: assigned.filter((r) => r.split === 'holdout').length } }
  return finish(
    'eval-dataset-splitter',
    { seed, rows },
    'A source group stays in one split. Near matches are left for a person. The same seed repeats.',
    { manifest, rows: assigned, flags },
    ['id', 'group', 'split', 'label'],
    assigned.map((r) => [r.id, r.group, r.split, r.label]),
    [
      { name: 'train.jsonl', text: assigned.filter((r) => r.split === 'train').map((r) => JSON.stringify(r)).join('\n') },
      { name: 'dev.jsonl', text: assigned.filter((r) => r.split === 'dev').map((r) => JSON.stringify(r)).join('\n') },
      { name: 'holdout.jsonl', text: assigned.filter((r) => r.split === 'holdout').map((r) => JSON.stringify(r)).join('\n') },
    ],
  )
}

export function runLocalizationLqa(input: string): WorkflowResult {
  const { rows, extra } = rowsOf(input, 'localization-lqa', ['rows', 'strings'])
  if (rows.length === 0) throw new IntakeError('empty')
  const glossary = Array.isArray(extra.glossary) ? asRecords(extra.glossary) : []
  const placeholders = (value: string) => [...value.matchAll(/\{\{[^}]+\}\}|\{[^{}]+\}|%[sd]/g)].map((m) => m[0])
  const numbers = (value: string) => [...value.matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => m[0])
  const links = (value: string) => [...value.matchAll(/https?:\/\/[^\s)]+/g)].map((m) => m[0])
  const issues = rows.flatMap((row) => {
    const id = str(row.id)
    const source = str(row.source)
    const target = str(row.target)
    const found: { id: string; severity: string; code: string; detail: string }[] = []
    if (!target.trim()) found.push({ id, severity: 'error', code: 'missing-translation', detail: source })
    for (const token of placeholders(source)) if (!target.includes(token)) found.push({ id, severity: 'error', code: 'placeholder', detail: token })
    const ns = numbers(source).join('|')
    const nt = numbers(target).join('|')
    if (ns !== nt) found.push({ id, severity: 'error', code: 'number', detail: `${ns}=>${nt}` })
    const ls = links(source).join('|')
    const lt = links(target).join('|')
    if (ls !== lt) found.push({ id, severity: 'error', code: 'link', detail: `${ls}=>${lt}` })
    for (const term of glossary) {
      const from = str(term.source)
      const to = str(term.target)
      if (from && source.includes(from) && to && !target.includes(to)) found.push({ id, severity: 'hint', code: 'glossary', detail: from })
    }
    return found
  })
  return finish(
    'localization-lqa',
    extra && Object.keys(extra).length ? { ...extra, rows } : rows,
    'Placeholder, number, and link checks are errors. A missing glossary term is only a hint. Meaning is not scored.',
    { issues },
    ['id', 'severity', 'code', 'detail'],
    issues.map((issue) => [issue.id, issue.severity, issue.code, issue.detail]),
  )
}

export function runOwnedMarketingReport(input: string): WorkflowResult {
  const root = rootObject(input, 'owned-marketing-report')
  const ads = Array.isArray(root.ads) ? asRecords(root.ads) : []
  const orders = Array.isArray(root.orders) ? asRecords(root.orders) : []
  const fx = Array.isArray(root.fx) ? asRecords(root.fx) : []
  if (ads.length === 0 && orders.length === 0) throw new IntakeError('empty')
  const base = str(root.base || 'USD')
  const rate = (from: string) => {
    if (!from || from === base) return 1
    const hit = fx.find((row) => str(row.from) === from && str(row.to) === base)
    return num(hit?.rate)
  }
  const campaigns = new Set([...ads.map((row) => str(row.campaign)), ...orders.map((row) => str(row.campaign))])
  const table = [...campaigns].map((campaign) => {
    const adRows = ads.filter((row) => str(row.campaign) === campaign)
    const orderRows = orders.filter((row) => str(row.campaign) === campaign)
    const spendRates = adRows.map((row) => rate(str(row.currency || base)))
    const revenueRates = orderRows.map((row) => rate(str(row.currency || base)))
    const spendKnown = spendRates.every((value) => value != null)
    const revenueKnown = revenueRates.every((value) => value != null)
    const spend = spendKnown ? adRows.reduce((sum, row, i) => sum + (num(row.spend) ?? 0) * (spendRates[i] ?? 0), 0) : null
    const revenue = revenueKnown ? orderRows.reduce((sum, row, i) => sum + (num(row.revenue) ?? 0) * (revenueRates[i] ?? 0), 0) : null
    return {
      campaign,
      orders: orderRows.length,
      spend: spend == null ? 'unknown' : String(Math.round(spend * 100) / 100),
      revenue: revenue == null ? 'unknown' : String(Math.round(revenue * 100) / 100),
      note: spend == null || revenue == null ? 'currency-unknown' : 'reconciled',
    }
  })
  return finish(
    'owned-marketing-report',
    root,
    'Orders are summed once per campaign. Mixed currencies without a supplied rate are not added together.',
    { base, rows: table },
    ['campaign', 'orders', 'spend', 'revenue', 'note'],
    table.map((row) => [row.campaign, row.orders, row.spend, row.revenue, row.note]),
  )
}

export function runKeywordIntentMap(input: string): WorkflowResult {
  const { rows } = rowsOf(input, 'keyword-intent-map', ['rows', 'keywords'])
  if (rows.length === 0) throw new IntakeError('empty')
  const groups = new Map<string, { keyword: string; region: string; intent: string; urls: Set<string> }>()
  for (const row of rows) {
    const keyword = str(row.keyword).trim()
    const region = str(row.region) || 'unspecified'
    const key = `${keyword.toLowerCase().replace(/\s+/g, ' ')}|${region.toLowerCase()}`
    const bucket = groups.get(key) ?? { keyword, region, intent: str(row.intent), urls: new Set<string>() }
    if (str(row.url)) bucket.urls.add(str(row.url))
    if (str(row.intent) && bucket.intent && str(row.intent) !== bucket.intent) bucket.intent = 'conflict'
    else if (!bucket.intent) bucket.intent = str(row.intent)
    groups.set(key, bucket)
  }
  const mapped = [...groups.values()].map((group) => ({
    keyword: group.keyword,
    region: group.region,
    intent: group.intent,
    urls: [...group.urls].join('|'),
    status: group.urls.size > 1 ? 'human-choice' : group.urls.size === 1 ? 'owned' : 'gap',
  }))
  return finish(
    'keyword-intent-map',
    { rows },
    'Grouping uses the written keyword and region only. Search volume and rank are not collected.',
    { rows: mapped },
    ['keyword', 'region', 'intent', 'status', 'urls'],
    mapped.map((row) => [row.keyword, row.region, row.intent, row.status, row.urls]),
  )
}
