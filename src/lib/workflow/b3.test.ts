import { describe, expect, it } from 'vitest'
import { presentResult } from './core'
import {
  gtinCheck,
  robotsDecision,
  parseRobots,
  runAbTestAnalyzer,
  runCampaignUnitEconomics,
  runCohortRetention,
  runGeoAccessEvidence,
  runHreflangMapAuditor,
  runProductFeedAuditor,
  runPromotionStackSimulator,
  runRedirectMigrationPlanner,
  runResponsiveAdAssetValidator,
  runReviewThemeCoder,
  twoProportion,
} from './b3'

describe('batch 3 workflows', () => {
  it('uses the longest robots rule, lets equal allows win, and keeps percent paths distinct', () => {
    const groups = parseRobots('User-agent: *\nDisallow: /private\nAllow: /private/public\nAllow: /a%2Fb\nDisallow: /a/b\n')
    expect(robotsDecision(groups, 'Googlebot', 'https://ex.com/private/public')).toBe('allow')
    expect(robotsDecision(groups, 'Googlebot', 'https://ex.com/private/secret')).toBe('disallow')
    expect(robotsDecision(groups, 'Googlebot', 'https://ex.com/a%2Fb')).toBe('allow')
    expect(robotsDecision(groups, 'Googlebot', 'https://ex.com/a/b')).toBe('disallow')
    const audit = runGeoAccessEvidence(JSON.stringify({
      robots: 'User-agent: *\nDisallow: /secret\n',
      tests: [{ ua: 'Googlebot', url: 'https://ex.com/secret' }, { ua: 'Googlebot', url: 'https://ex.com/open' }],
      headers: [{ url: 'https://ex.com/open', status: '200' }],
      llms: true,
    }))
    const rows = (audit.json as { result: { rows: { http: string }[]; notes: string[] } }).result
    expect(rows.rows[0]!.http).toBe('unknown')
    expect(rows.rows[1]!.http).toBe('200')
    expect(rows.notes).toContain('schema-or-llms-not-inclusion')
    expect(presentResult(runGeoAccessEvidence, '').error).toBe('empty')
  })

  it('keeps a zero denominator and mixed currency unknown', () => {
    const result = runCampaignUnitEconomics(JSON.stringify({
      base: 'USD',
      fx: [{ from: 'EUR', to: 'USD', rate: 1.1 }],
      scenarios: [
        { name: 'zero', spend: 0, revenue: 10, cogs: 1, refunds: 2, shipping: 1, currency: 'USD' },
        { name: 'eur', spend: 10, revenue: 20, cogs: 0, refunds: 0, shipping: 0, currency: 'EUR' },
        { name: 'no-rate', spend: 10, revenue: 20, currency: 'JPY' },
      ],
    }))
    const rows = (result.json as { result: { scenarios: { roas: string; contribution: string }[] } }).result.scenarios
    expect(rows[0]!.roas).toBe('unknown')
    expect(rows[1]!.contribution).not.toBe('unknown')
    expect(rows[2]!.roas).toBe('unknown')
    expect(presentResult(runCampaignUnitEconomics, '{"scenarios":[]}').error).toBe('empty')
  })

  it('does not turn an immature month into zero or double-count events', () => {
    const result = runCohortRetention(JSON.stringify({
      timezone: '+08:00', firstEvent: 'signup', asOf: '2026-03-20', horizon: 1,
      events: [
        { user: 'a', event: 'signup', ts: '2026-03-02T01:00:00' },
        { user: 'a', event: 'active', ts: '2026-03-03T01:00:00' },
        { user: 'a', event: 'active', ts: '2026-03-04T01:00:00' },
        { user: 'a', event: 'active', ts: '2026-04-02T01:00:00' },
        { user: 'b', event: 'signup', ts: '2026-03-05T01:00:00' },
      ],
    }))
    const rows = (result.json as { result: { rows: { offset: number; retained: number | string; users: number }[] } }).result.rows
    expect(rows[0]!.users).toBe(2)
    expect(rows[0]!.retained).toBe(2)
    expect(rows[1]!.retained).toBe('immature')
  })

  it('returns z of zero, rejects impossible counts, and withholds significance', () => {
    expect(twoProportion(50, 100, 50, 100, 'two-sided')).toMatchObject({ z: '0', significant: false, applicable: true })
    expect(twoProportion(11, 10, 1, 10, 'two-sided').status).toBe('invalid')
    const small = runAbTestAnalyzer(JSON.stringify({ successA: 9, trialsA: 10, successB: 1, trialsB: 10, alternative: 'two-sided' }))
    expect((small.json as { result: { applicable: boolean; significant: boolean } }).result).toMatchObject({ applicable: false, significant: false })
    expect(presentResult(runAbTestAnalyzer, '{"successA":1}').error).toBe('bad-input')
  })

  it('warns when a disclosure is pinned outside a guaranteed slot and counts CJK width', () => {
    const result = runResponsiveAdAssetValidator(JSON.stringify({
      rules: { headline: 30, description: 90, cjk: 'double', guaranteedPins: ['1'] },
      assets: [
        { id: '1', group: 'g', field: 'headline', text: '汉字汉字汉字汉字汉字汉字汉字汉字', pin: '1' },
        { id: '2', group: 'g', field: 'description', text: 'Legal', pin: '3', disclosure: true },
      ],
    }))
    const codes = (result.json as { result: { issues: { code: string }[] } }).result.issues.map((issue) => issue.code)
    expect(codes).toContain('too-long')
    expect(codes).toContain('unguaranteed-pin')
  })

  it('locates duplicate ids, missing currency, variant conflicts, and keeps AI columns', () => {
    expect(gtinCheck('96385074').ok).toBe(true)
    expect(gtinCheck('96385075').ok).toBe(false)
    const result = runProductFeedAuditor(JSON.stringify({
      rows: [
        { id: '1', title: 'Hat', price: '10', currency: 'USD', gtin: '96385074', item_group_id: 'g', ai_source: 'human' },
        { id: '1', title: 'Hat', price: '10', currency: 'EUR', gtin: '96385075', item_group_id: 'g', ai_source: 'model' },
        { id: '2', title: 'Cap', price: '8', currency: '', item_group_id: '', ai_source: 'model' },
      ],
    }))
    const body = result.json as { result: { ai_columns: string[]; issues: { code: string }[] } }
    expect(body.result.ai_columns).toContain('ai_source')
    expect(body.result.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(['duplicate-id', 'gtin', 'missing', 'variant-currency']))
    expect(presentResult(runProductFeedAuditor, 'id,title\n').error).toBe('empty')
  })

  it('requires a return link and does not treat x-default as a language', () => {
    const result = runHreflangMapAuditor(JSON.stringify({
      rows: [
        { url: 'https://ex.com/en', lang: 'en', alternates: ['https://ex.com/en', 'https://ex.com/de'] },
        { url: 'https://ex.com/de', lang: 'de', alternates: ['https://ex.com/de'] },
        { url: 'https://ex.com/', lang: 'x-default', alternates: ['https://ex.com/'] },
      ],
    }))
    const issues = (result.json as { result: { issues: { code: string; url: string }[] } }).result.issues
    expect(issues.some((issue) => issue.code === 'return-link')).toBe(true)
    expect(issues.some((issue) => issue.url === 'https://ex.com/' && issue.code === 'lang')).toBe(false)
  })

  it('detects a redirect cycle and separates unknown status codes', () => {
    const result = runRedirectMigrationPlanner(JSON.stringify({
      rows: [
        { from: 'https://ex.com/a', to: 'https://ex.com/b', status: '301' },
        { from: 'https://ex.com/b', to: 'https://ex.com/a', status: '302' },
        { from: 'https://ex.com/c', to: 'https://ex.com/d', status: '999' },
      ],
    }))
    const codes = (result.json as { result: { issues: { code: string }[] } }).result.issues.map((issue) => issue.code)
    expect(codes).toContain('cycle')
    expect(codes).toContain('unknown-status')
    expect(result.files.map((file) => file.text).join('\n')).not.toContain('nginx')
    expect(presentResult(runRedirectMigrationPlanner, '').error).toBe('empty')
  })

  it('applies percent and fixed discounts in the given order', () => {
    const first = runPromotionStackSimulator(JSON.stringify({ subtotal: 100, promotions: [{ id: 'f', kind: 'fixed', amount: 20 }, { id: 'p', kind: 'percent', amount: 10 }] }))
    const second = runPromotionStackSimulator(JSON.stringify({ subtotal: 100, promotions: [{ id: 'p', kind: 'percent', amount: 10 }, { id: 'f', kind: 'fixed', amount: 20 }] }))
    expect((first.json as { result: { final: string } }).result.final).toBe('72.00')
    expect((second.json as { result: { final: string } }).result.final).toBe('70.00')
    expect(presentResult(runPromotionStackSimulator, '{"promotions":[]}').error).toBe('empty')
  })

  it('counts a person once and does not call uncoded feedback negative', () => {
    const result = runReviewThemeCoder(JSON.stringify({
      taxonomy: [{ id: 'shipping', terms: 'late|delay' }, { id: 'price', terms: 'expensive' }],
      reviews: [
        { id: 'r1', user: 'u1', text: 'late and expensive', human: ['shipping'] },
        { id: 'r2', user: 'u1', text: 'thanks' },
      ],
    }))
    const body = result.json as { result: { people: number; rows: { status: string; labels: string }[] } }
    expect(body.result.people).toBe(1)
    expect(body.result.rows[0]!.labels.split('|').sort()).toEqual(['price', 'shipping'])
    expect(body.result.rows[1]!.status).toBe('uncoded')
    expect(JSON.stringify(body.result.rows[1])).not.toContain('negative')
  })
})
