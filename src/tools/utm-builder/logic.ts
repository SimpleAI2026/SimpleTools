import { finish, fnv, presentResult, rowsOf, str, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '{"onDuplicate":"overwrite","links":[{"id":"1","url":"https://ex.com/a?x=1#hero","utm_source":"newsletter","utm_medium":"email","utm_campaign":"春促"}]}'

export function run(input: string) {
  const { rows, extra } = rowsOf(input, 'utm-builder', ['links', 'rows'])
  if (rows.length === 0) return finish('utm-builder', rows, 'No links supplied.', { links: [], issues: [] }, ['id', 'url', 'issues'], [])
  const required = Array.isArray(extra.required) ? extra.required.map(str) : ['utm_source', 'utm_medium', 'utm_campaign']
  const dictionary = extra.dictionary && typeof extra.dictionary === 'object' && !Array.isArray(extra.dictionary) ? extra.dictionary as Record<string, unknown> : {}
  const onDuplicate = str(extra.onDuplicate || 'overwrite')
  const issues: { id: string; code: string; detail: string }[] = []
  const campaignSources = new Map<string, Set<string>>()
  const links = rows.map((row) => {
    const id = str(row.id) || `l_${fnv([str(row.url)])}`
    let url: URL
    try {
      url = new URL(str(row.url))
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol')
    } catch {
      issues.push({ id, code: 'bad-url', detail: str(row.url) })
      return { id, url: '', issues: 'bad-url' }
    }
    const utm = row.utm && typeof row.utm === 'object' && !Array.isArray(row.utm)
      ? row.utm as Record<string, unknown>
      : Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].filter((key) => str(row[key])).map((key) => [key, row[key]]))
    for (const key of required) {
      if (!str(utm[key]).trim()) issues.push({ id, code: 'missing-required', detail: key })
    }
    for (const [key, value] of Object.entries(utm)) {
      const text = str(value)
      const allowed = dictionary[key]
      if (Array.isArray(allowed) && allowed.length && !allowed.map(str).includes(text)) issues.push({ id, code: 'dictionary', detail: `${key}=${text}` })
      const existing = url.searchParams.getAll(key)
      if (existing.length && onDuplicate === 'error') {
        issues.push({ id, code: 'duplicate-utm', detail: key })
        continue
      }
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
    Object.keys(extra).length ? { ...extra, links: rows } : rows,
    'Links keep the original hash and non-UTM query. Values are encoded once. No click was sent.',
    { links: decorated, issues },
    ['id', 'url', 'issues'],
    decorated.map((row) => [row.id, row.url, row.issues]),
    [{ name: 'utm-issues.json', text: JSON.stringify(issues, null, 2) }],
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
