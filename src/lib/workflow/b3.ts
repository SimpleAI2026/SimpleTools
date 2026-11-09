import {
  IntakeError,
  asRecords,
  finish,
  listFrom,
  num,
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

interface RobotRule { allow: boolean; path: string }
interface RobotGroup { agents: string[]; rules: RobotRule[] }

export function parseRobots(text: string): RobotGroup[] {
  const groups: RobotGroup[] = []
  let agents: string[] = []
  let rules: RobotRule[] = []
  const flush = () => {
    if (agents.length === 0 && rules.length === 0) return
    groups.push({ agents: agents.length ? [...agents] : ['*'], rules: [...rules] })
    agents = []
    rules = []
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim()
    if (!line) continue
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim().toLowerCase()
    const value = line.slice(idx + 1).trim()
    if (key === 'user-agent') {
      if (rules.length) flush()
      agents.push(value.toLowerCase())
    } else if (key === 'allow') rules.push({ allow: true, path: value })
    else if (key === 'disallow') rules.push({ allow: false, path: value })
  }
  flush()
  return groups
}

function wildMatch(rule: string, path: string): boolean {
  let body = rule
  let anchored = false
  if (body.endsWith('$')) {
    anchored = true
    body = body.slice(0, -1)
  }
  const parts = body.split('*')
  let at = 0
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!
    if (i === 0) {
      if (!path.startsWith(part)) return false
      at = part.length
    } else if (!part) {
      at = path.length
    } else {
      const found = path.indexOf(part, at)
      if (found < 0) return false
      at = found + part.length
    }
  }
  return anchored ? at === path.length : true
}

export function robotsDecision(groups: RobotGroup[], ua: string, url: string): 'allow' | 'disallow' | 'none' {
  const agent = ua.toLowerCase()
  let best: RobotGroup | null = null
  let bestLen = -1
  for (const group of groups) {
    for (const name of group.agents) {
      if (name !== '*' && agent.includes(name) && name.length > bestLen) {
        best = group
        bestLen = name.length
      }
    }
  }
  const chosen = best ?? groups.find((group) => group.agents.includes('*')) ?? { agents: ['*'], rules: [] }
  let path = url
  try {
    path = new URL(url).pathname
  } catch {
    /* keep raw path */
  }
  let winner: { len: number; allow: boolean } | null = null
  for (const rule of chosen.rules) {
    if (!rule.path) continue
    if (!wildMatch(rule.path, path)) continue
    if (!winner || rule.path.length > winner.len || (rule.path.length === winner.len && rule.allow && !winner.allow)) winner = { len: rule.path.length, allow: rule.allow }
  }
  if (!winner) return 'none'
  return winner.allow ? 'allow' : 'disallow'
}

export function runGeoAccessEvidence(input: string): WorkflowResult {
  const root = rootObject(input, 'geo-access-evidence')
  const robots = str(root.robots)
  if (!robots.trim() && !Array.isArray(root.tests)) throw new IntakeError('empty')
  const groups = parseRobots(robots)
  const tests = Array.isArray(root.tests) ? asRecords(root.tests) : []
  const headers = Array.isArray(root.headers) ? asRecords(root.headers) : []
  const rows = tests.map((test) => {
    const url = str(test.url)
    const header = headers.find((row) => str(row.url) === url)
    return {
      url,
      ua: str(test.ua),
      robots: robotsDecision(groups, str(test.ua), url),
      http: header ? str(header.status || 'recorded') : 'unknown',
      x_robots: header ? str(header.xRobotsTag) : 'unknown',
    }
  })
  return finish(
    'geo-access-evidence',
    root,
    'Rules are explained from the imported file only. Missing HTTP evidence stays unknown. llms.txt or schema is not an inclusion proof.',
    { rule_version: 'robots-longest-match-allow-ties-1', rows, notes: ['schema-or-llms-not-inclusion'] },
    ['url', 'ua', 'robots', 'http', 'x_robots'],
    rows.map((row) => [row.url, row.ua, row.robots, row.http, row.x_robots]),
  )
}

function convert(amount: number | null, currency: string, base: string, fx: Record<string, unknown>[]): number | null {
  if (amount == null) return null
  if (!currency || currency === base) return amount
  const hit = fx.find((row) => str(row.from) === currency && str(row.to) === base)
  const rate = num(hit?.rate)
  if (rate == null) return null
  return amount * rate
}

export function runCampaignUnitEconomics(input: string): WorkflowResult {
  const root = rootObject(input, 'campaign-unit-economics')
  const scenarios = listFrom(root.scenarios ?? [], ['scenarios'])
  if (scenarios.length === 0) throw new IntakeError('empty')
  const base = str(root.base || 'USD')
  const fx = Array.isArray(root.fx) ? asRecords(root.fx) : []
  const rows = scenarios.map((row) => {
    const currency = str(row.currency || base)
    const spend = convert(num(row.spend), currency, base, fx)
    const revenue = convert(num(row.revenue), currency, base, fx)
    const cogs = convert(num(row.cogs) ?? 0, currency, base, fx)
    const refunds = convert(num(row.refunds) ?? 0, currency, base, fx)
    const shipping = convert(num(row.shipping) ?? 0, currency, base, fx)
    const known = spend != null && revenue != null && cogs != null && refunds != null && shipping != null
    const contribution = known ? revenue! - cogs! - refunds! - shipping! - spend! : null
    const roas = known && spend !== 0 ? revenue! / spend! : null
    return {
      name: str(row.name),
      currency,
      roas: roas == null ? 'unknown' : String(Math.round(roas * 1000) / 1000),
      contribution: contribution == null ? 'unknown' : String(Math.round(contribution * 100) / 100),
    }
  })
  return finish(
    'campaign-unit-economics',
    root,
    'Rates are the ones you typed. A zero spend does not become infinity. Currencies without a rate are not mixed.',
    { base, scenarios: rows },
    ['name', 'currency', 'roas', 'contribution'],
    rows.map((row) => [row.name, row.currency, row.roas, row.contribution]),
  )
}

function epochOf(ts: string, tz: string): number | null {
  const value = /[zZ]|[+-]\d{2}:\d{2}$/.test(ts) ? ts : `${ts}${tz}`
  const n = Date.parse(value)
  return Number.isNaN(n) ? null : n
}

function monthKey(epoch: number, tz: string): string {
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(tz)
  const sign = m?.[1] === '-' ? -1 : 1
  const shift = sign * ((Number(m?.[2] ?? 0) * 60) + Number(m?.[3] ?? 0)) * 60_000
  const d = new Date(epoch + shift)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function addMonth(key: string, offset: number): string {
  const [y, m] = key.split('-').map(Number)
  const index = (y! * 12 + (m! - 1)) + offset
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`
}

export function runCohortRetention(input: string): WorkflowResult {
  const root = rootObject(input, 'cohort-retention-analyzer')
  const events = listFrom(root.events ?? [], ['events'])
  if (events.length === 0) throw new IntakeError('empty')
  const tz = str(root.timezone || '+00:00')
  const firstEvent = str(root.firstEvent || 'signup')
  const asOf = str(root.asOf)
  const horizon = num(root.horizon) ?? 2
  const parsed = events.flatMap((row) => {
    const at = epochOf(str(row.ts), tz)
    if (at == null) return []
    return [{ user: str(row.user), event: str(row.event), at, month: monthKey(at, tz) }]
  })
  const first = new Map<string, string>()
  for (const row of parsed.filter((row) => row.event === firstEvent).sort((a, b) => a.at - b.at)) {
    if (!first.has(row.user)) first.set(row.user, row.month)
  }
  const cohorts = [...new Set(first.values())].sort()
  const table = cohorts.flatMap((cohort) => {
    const users = [...first.entries()].filter(([, month]) => month === cohort).map(([user]) => user)
    return Array.from({ length: horizon + 1 }, (_, offset) => {
      const month = addMonth(cohort, offset)
      const mature = !asOf || `${month}-01` <= asOf
      const active = new Set(parsed.filter((row) => row.month === month && users.includes(row.user)).map((row) => row.user))
      return { cohort, offset, month, users: users.length, retained: mature ? active.size : 'immature', rate: mature && users.length ? `${active.size}/${users.length}` : 'immature' }
    })
  })
  return finish(
    'cohort-retention-analyzer',
    root,
    'An unfinished month is immature, not zero. Repeated events do not add users.',
    { timezone: tz, rows: table },
    ['cohort', 'offset', 'month', 'users', 'retained', 'rate'],
    table.map((row) => [row.cohort, row.offset, row.month, row.users, row.retained, row.rate]),
  )
}

function erf(x: number): number {
  const sign = x < 0 ? -1 : 1
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const t = 1 / (1 + p * Math.abs(x))
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x)
  return sign * y
}

export function twoProportion(s1: number, n1: number, s2: number, n2: number, alternative: string): { status: string; z: string; p: string; significant: boolean; applicable: boolean } {
  if (!Number.isInteger(s1) || !Number.isInteger(n1) || !Number.isInteger(s2) || !Number.isInteger(n2)) return { status: 'invalid', z: '', p: '', significant: false, applicable: false }
  if (s1 < 0 || s2 < 0 || n1 <= 0 || n2 <= 0 || s1 > n1 || s2 > n2) return { status: 'invalid', z: '', p: '', significant: false, applicable: false }
  const p1 = s1 / n1
  const p2 = s2 / n2
  const pooled = (s1 + s2) / (n1 + n2)
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
  const z = se === 0 ? 0 : (p1 - p2) / se
  const cdf = 0.5 * (1 + erf(Math.abs(z) / Math.SQRT2))
  let p = 2 * (1 - cdf)
  if (alternative === 'greater') p = 1 - cdf
  if (alternative === 'less') p = cdf
  if (z === 0) p = alternative === 'two-sided' ? 1 : 0.5
  const applicable = n1 >= 30 && n2 >= 30 && n1 * pooled >= 5 && n1 * (1 - pooled) >= 5 && n2 * pooled >= 5 && n2 * (1 - pooled) >= 5
  const significant = applicable && p < 0.05
  return { status: 'ok', z: String(Math.round(z * 1000) / 1000), p: String(Math.round(p * 1000) / 1000), significant, applicable }
}

export function runAbTestAnalyzer(input: string): WorkflowResult {
  const root = rootObject(input, 'ab-test-analyzer')
  const s1 = num(root.successA)
  const n1 = num(root.trialsA)
  const s2 = num(root.successB)
  const n2 = num(root.trialsB)
  if (s1 == null || n1 == null || s2 == null || n2 == null) throw new IntakeError('bad-input')
  const alternative = str(root.alternative || 'two-sided')
  const result = twoProportion(s1, n1, s2, n2, alternative)
  return finish(
    'ab-test-analyzer',
    root,
    'Two-proportion z only. A small sample is not called significant. This is not a causal or sequential test.',
    result,
    ['status', 'z', 'p', 'applicable', 'significant'],
    [[result.status, result.z, result.p, result.applicable, result.significant]],
  )
}

function textWidth(value: string, mode: string): number {
  if (mode !== 'double') return [...value].length
  let width = 0
  for (const ch of value) width += (ch.codePointAt(0) ?? 0) > 0xff ? 2 : 1
  return width
}

export function runResponsiveAdAssetValidator(input: string): WorkflowResult {
  const root = rootObject(input, 'responsive-ad-asset-validator')
  const assets = listFrom(root.assets ?? [], ['assets'])
  if (assets.length === 0) throw new IntakeError('empty')
  const rules = (root.rules ?? {}) as Record<string, unknown>
  const limits: Record<string, number> = { headline: num(rules.headline) ?? 30, description: num(rules.description) ?? 90 }
  const mode = str(rules.cjk || 'unit')
  const guaranteed = new Set(Array.isArray(rules.guaranteedPins) ? rules.guaranteedPins.map((v) => String(v)) : ['1'])
  const seen = new Map<string, string>()
  const issues = assets.flatMap((asset) => {
    const id = str(asset.id)
    const field = str(asset.field)
    const text = str(asset.text)
    const found: { id: string; code: string; detail: string }[] = []
    const limit = limits[field]
    if (limit != null && textWidth(text, mode) > limit) found.push({ id, code: 'too-long', detail: `${textWidth(text, mode)}>${limit}` })
    const key = `${str(asset.group)}|${field}|${text}`
    if (seen.has(key)) found.push({ id, code: 'duplicate', detail: seen.get(key)! })
    seen.set(key, id)
    if (boolFlag(asset.disclosure) && !guaranteed.has(str(asset.pin))) found.push({ id, code: 'unguaranteed-pin', detail: str(asset.pin) })
    return found
  })
  return finish(
    'responsive-ad-asset-validator',
    root,
    'Length and pin checks only. Ad strength and click rate are not predicted.',
    { cjk: mode, issues },
    ['id', 'code', 'detail'],
    issues.map((issue) => [issue.id, issue.code, issue.detail]),
  )
}

function boolFlag(value: unknown): boolean {
  return value === true || str(value).toLowerCase() === 'true'
}

export function gtinCheck(raw: string): { ok: boolean; kind: string } {
  const digits = raw.replace(/[\s-]/g, '')
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(digits)) return { ok: false, kind: 'format' }
  const body = digits.slice(0, -1).split('').map(Number).reverse()
  const sum = body.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 3 : 1), 0)
  const check = (10 - (sum % 10)) % 10
  return { ok: check === Number(digits.at(-1)), kind: `GTIN-${digits.length}` }
}

export function runProductFeedAuditor(input: string): WorkflowResult {
  const { rows } = rowsOf(input, 'product-feed-auditor', ['rows', 'items'])
  if (rows.length === 0) throw new IntakeError('empty')
  const aiColumns = [...new Set(rows.flatMap((row) => Object.keys(row).filter((key) => key.toLowerCase().startsWith('ai'))))]
  const ids = new Map<string, number>()
  const issues = rows.flatMap((row) => {
    const id = str(row.id)
    const found: { id: string; code: string; detail: string }[] = []
    ids.set(id, (ids.get(id) ?? 0) + 1)
    if (ids.get(id)! > 1) found.push({ id, code: 'duplicate-id', detail: id })
    for (const field of ['title', 'price', 'currency']) if (!str(row[field]).trim()) found.push({ id, code: 'missing', detail: field })
    if (str(row.gtin)) {
      const check = gtinCheck(str(row.gtin))
      if (!check.ok) found.push({ id, code: 'gtin', detail: check.kind })
    }
    return found
  })
  const groups = new Map<string, Set<string>>()
  for (const row of rows) {
    const group = str(row.item_group_id)
    if (!group) continue
    const set = groups.get(group) ?? new Set<string>()
    if (str(row.currency)) set.add(str(row.currency))
    groups.set(group, set)
  }
  for (const [group, currencies] of groups) if (currencies.size > 1) issues.push({ id: group, code: 'variant-currency', detail: [...currencies].join('|') })
  return finish(
    'product-feed-auditor',
    { rows },
    'Remote images, stock, and GS1 allocation are not checked. AI source columns are kept.',
    { ai_columns: aiColumns, issues },
    ['id', 'code', 'detail', 'ai_columns'],
    issues.map((issue) => [issue.id, issue.code, issue.detail, aiColumns.join('|')]),
  )
}

const LANG = /^(?:[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*|x-default)$/

export function runHreflangMapAuditor(input: string): WorkflowResult {
  const { rows } = rowsOf(input, 'hreflang-map-auditor', ['rows', 'pages'])
  if (rows.length === 0) throw new IntakeError('empty')
  const pages = rows.map((row) => ({
    url: str(row.url),
    lang: str(row.lang),
    alternates: Array.isArray(row.alternates) ? row.alternates.map(str) : str(row.alternates).split('|').filter(Boolean),
  }))
  const byUrl = new Map(pages.map((page) => [page.url, page]))
  const issues = pages.flatMap((page) => {
    const found: { url: string; code: string; detail: string }[] = []
    if (page.lang !== 'x-default' && !LANG.test(page.lang)) found.push({ url: page.url, code: 'lang', detail: page.lang })
    if (!page.alternates.includes(page.url)) found.push({ url: page.url, code: 'self', detail: page.url })
    for (const alt of page.alternates) {
      if (alt === page.url) continue
      const back = byUrl.get(alt)
      if (!back || !back.alternates.includes(page.url)) found.push({ url: page.url, code: 'return-link', detail: alt })
    }
    return found
  })
  return finish(
    'hreflang-map-auditor',
    { rows, language_rule: 'bcp47-subset-plus-x-default' },
    'x-default is not treated as a language. Return links are required. Deployment is not verified.',
    { issues },
    ['url', 'code', 'detail'],
    issues.map((issue) => [issue.url, issue.code, issue.detail]),
  )
}

export function runRedirectMigrationPlanner(input: string): WorkflowResult {
  const { rows } = rowsOf(input, 'redirect-migration-planner', ['rows', 'redirects'])
  if (rows.length === 0) throw new IntakeError('empty')
  const edges = rows.map((row) => ({ from: str(row.from), to: str(row.to), status: str(row.status) }))
  const issues: { from: string; code: string; detail: string }[] = []
  const byFrom = new Map<string, string[]>()
  for (const edge of edges) {
    if (!edge.to) issues.push({ from: edge.from, code: 'missing-target', detail: edge.from })
    if (!['301', '302', '307', '308'].includes(edge.status)) issues.push({ from: edge.from, code: 'unknown-status', detail: edge.status || 'blank' })
    byFrom.set(edge.from, [...(byFrom.get(edge.from) ?? []), edge.to])
  }
  for (const [from, targets] of byFrom) if (new Set(targets.filter(Boolean)).size > 1) issues.push({ from, code: 'conflict', detail: targets.join('|') })
  const known = new Set(edges.map((edge) => edge.from))
  for (const edge of edges) if (edge.to && known.has(edge.to)) issues.push({ from: edge.from, code: 'chain', detail: edge.to })
  const color = new Map<string, number>()
  const cyclic = new Set<string>()
  const dfs = (id: string): void => {
    const state = color.get(id) ?? 0
    if (state === 2) return
    if (state === 1) { cyclic.add(id); return }
    color.set(id, 1)
    for (const next of new Set((byFrom.get(id) ?? []).filter(Boolean))) {
      if ((color.get(next) ?? 0) === 1) { cyclic.add(id); cyclic.add(next) }
      dfs(next)
    }
    color.set(id, 2)
  }
  for (const from of byFrom.keys()) dfs(from)
  for (const from of cyclic) issues.push({ from, code: 'cycle', detail: from })
  return finish(
    'redirect-migration-planner',
    { rows },
    'This is a review table, not a server config. Cycles, chains, and unknown status codes stay visible. No request was sent.',
    { issues },
    ['from', 'code', 'detail'],
    issues.map((issue) => [issue.from, issue.code, issue.detail]),
  )
}

function applyMoney(cents: number, kind: string, amount: number): { cents: number; note: string } {
  if (kind === 'percent') {
    const next = Math.round(cents * (100 - amount) / 100)
    return { cents: next, note: `${cents} * ${100 - amount}/100 -> ${next}` }
  }
  const delta = Math.round(amount * 100)
  return { cents: cents - delta, note: `${cents} - ${delta} -> ${cents - delta}` }
}

export function runPromotionStackSimulator(input: string): WorkflowResult {
  const root = rootObject(input, 'promotion-stack-simulator')
  const promotions = listFrom(root.promotions ?? [], ['promotions'])
  if (promotions.length === 0) throw new IntakeError('empty')
  const decimals = num(root.decimals) ?? 2
  if (decimals !== 2 && decimals !== 0) throw new IntakeError('bad-input')
  let cents = Math.round((num(root.subtotal) ?? NaN) * 10 ** decimals)
  if (!Number.isFinite(cents)) throw new IntakeError('bad-input')
  const usedGroups = new Set<string>()
  const steps: { id: string; cents: number; note: string }[] = [{ id: 'start', cents, note: 'subtotal' }]
  for (const promo of promotions) {
    const group = str(promo.exclusiveGroup)
    if (group && usedGroups.has(group)) {
      steps.push({ id: str(promo.id), cents, note: 'skipped-exclusive' })
      continue
    }
    const threshold = num(promo.threshold)
    const unit = decimals === 0 ? cents : cents / 100
    if (threshold != null && unit < threshold) {
      steps.push({ id: str(promo.id), cents, note: 'below-threshold' })
      continue
    }
    const applied = applyMoney(cents, str(promo.kind), num(promo.amount) ?? 0)
    cents = applied.cents
    if (group) usedGroups.add(group)
    steps.push({ id: str(promo.id), cents, note: applied.note })
  }
  const money = (value: number) => (decimals === 0 ? String(value) : (value / 100).toFixed(2))
  return finish(
    'promotion-stack-simulator',
    root,
    'Order changes the result. Rounding is recorded per step. This is not a tax or legal ruling.',
    { final: money(cents), steps },
    ['id', 'amount', 'note'],
    steps.map((step) => [step.id, money(step.cents), step.note]),
  )
}

export function runReviewThemeCoder(input: string): WorkflowResult {
  const root = rootObject(input, 'review-theme-coder')
  const reviews = listFrom(root.reviews ?? [], ['reviews'])
  const taxonomy = Array.isArray(root.taxonomy) ? asRecords(root.taxonomy) : []
  if (reviews.length === 0) throw new IntakeError('empty')
  const coded = reviews.map((review) => {
    const text = str(review.text).toLowerCase()
    const labels = taxonomy.filter((theme) => str(theme.terms).split('|').some((term) => term.trim() && text.includes(term.trim().toLowerCase()))).map((theme) => str(theme.id))
    const human = Array.isArray(review.human) ? review.human.map(str) : str(review.human).split('|').filter(Boolean)
    const disagree = human.length > 0 && (human.length !== labels.length || human.some((label) => !labels.includes(label)))
    return { id: str(review.id), user: str(review.user), labels: labels.join('|'), status: labels.length ? 'coded' : 'uncoded', disagree, snippet: str(review.text).slice(0, 80) }
  })
  const people = new Set(coded.map((row) => row.user).filter(Boolean))
  return finish(
    'review-theme-coder',
    root,
    `Literal labels only. ${people.size} people are counted once. Uncoded is not negative feedback.`,
    { people: people.size, rows: coded },
    ['id', 'user', 'status', 'labels', 'disagree'],
    coded.map((row) => [row.id, row.user, row.status, row.labels, row.disagree]),
  )
}
