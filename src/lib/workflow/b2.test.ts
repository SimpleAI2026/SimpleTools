import { describe, expect, it } from 'vitest'
import { presentResult } from './core'
import {
  blindOrder,
  runAgentTraceReview,
  runBlindOutputReview,
  runBrandEntityConsistency,
  runCitationGapMap,
  runEvalDatasetSplitter,
  runGeoChangeExperiment,
  runKeywordIntentMap,
  runLocalizationLqa,
  runOwnedMarketingReport,
  runSourceQuoteVerifier,
} from './b2'

describe('batch 2 workflows', () => {
  it('conflicts only for the same region and currency', () => {
    const result = runBrandEntityConsistency(JSON.stringify({
      facts: [
        { entity: 'Widget', alias_group: 'widget', attribute: 'price', region: 'US', currency: 'USD', value: '99', valid_from: '2026-01-01', valid_to: '2026-12-31', source: 'a' },
        { entity: 'Widget', alias_group: 'widget', attribute: 'price', region: 'DE', currency: 'EUR', value: '109', valid_from: '2026-01-01', valid_to: '2026-12-31', source: 'b' },
        { entity: 'Widget', alias_group: 'widget', attribute: 'price', region: 'US', currency: 'USD', value: '129', valid_from: '2026-06-01', valid_to: '2026-08-01', source: 'c' },
      ],
    }))
    const conflicts = (result.json as { result: { conflicts: { sources: string }[] } }).result.conflicts
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0]!.sources).toBe('a|c')
    expect(presentResult(runBrandEntityConsistency, '').error).toBe('empty')
    expect(presentResult(runBrandEntityConsistency, '{').error).toBe('invalid-json')
  })

  it('marks a model change as not comparable', () => {
    const result = runGeoChangeExperiment(JSON.stringify({
      hypothesis: 'New page',
      treatment: { model: 'm2', panel: 'p1' },
      control: { model: 'm1', panel: 'p1' },
      observations: [{ arm: 'treatment', mentioned: true, model: 'm2', panel: 'p1' }, { arm: 'control', mentioned: false, model: 'm1', panel: 'p1' }],
    }))
    expect((result.json as { result: { comparable: boolean } }).result.comparable).toBe(false)
    expect(result.files[0]!.text).toContain('Not comparable')
    expect(result.files[0]!.text).not.toContain('lift is')
  })

  it('does not treat unknown or shared domains as exclusive', () => {
    const result = runCitationGapMap(JSON.stringify({
      self: 'acme',
      ownership: [{ domain: 'acme.example', owner: 'acme' }, { domain: 'rival.example', owner: 'rival' }, { domain: 'shared.example', owner: 'shared' }, { domain: 'mystery.example', owner: 'unknown' }],
      citations: [
        { brand: 'rival', domain: 'rival.example', theme: 'pricing', question_id: 'q' },
        { brand: 'acme', domain: 'shared.example', theme: 'pricing', question_id: 'q' },
        { brand: 'other', domain: 'mystery.example', theme: 'support', question_id: 'q2' },
      ],
    }))
    const gaps = (result.json as { result: { gaps: { theme: string; gap: boolean }[] } }).result.gaps
    expect(gaps.find((gap) => gap.theme === 'pricing')!.gap).toBe(true)
    expect(gaps.find((gap) => gap.theme === 'support')!.gap).toBe(false)
  })

  it('rejects changed digits and does not call an ellipsis exact', () => {
    const result = runSourceQuoteVerifier(JSON.stringify({
      quotes: [
        { id: 'd', quote: 'price is 100', source: 'price is 10', location: 'p1' },
        { id: 'e', quote: 'the price is … dollars', source: 'the price is 100 dollars', location: 'p2' },
        { id: 'x', quote: 'same words', source: 'same words', location: 'p3' },
      ],
    }))
    const rows = (result.json as { result: { checks: { status: string }[] } }).result.checks
    expect(rows.map((row) => row.status)).toEqual(['no_match', 'partial_omission', 'exact'])
  })

  it('keeps attempts apart and does not invent a cost', () => {
    const result = runAgentTraceReview('{"id":"1","parent":"","ts":"2026-01-01T00:00:02Z","attempt":"1","call":"c","status":"error","rate":null,"tokens":10}\n{"id":"2","parent":"9","ts":"2026-01-01T00:00:01Z","attempt":"2","call":"c","status":"ok","rate":0.02,"tokens":10}')
    const rows = (result.json as { result: { timeline: { attempt: string; out_of_order: boolean; missing_parent: boolean; cost: string }[] } }).result.timeline
    expect(rows.map((row) => row.attempt)).toEqual(['1', '2'])
    expect(rows[1]!.out_of_order).toBe(true)
    expect(rows[1]!.missing_parent).toBe(true)
    expect(rows[0]!.cost).toBe('unknown')
    expect(rows).toHaveLength(2)
    expect(presentResult(runAgentTraceReview, '{"constructor":1}').error).toBe('forbidden-key')
  })

  it('rebuilds a blind order from the seed without labels in the blind rows', () => {
    expect(blindOrder(['a', 'b', 'c'], 7)).toEqual(blindOrder(['a', 'b', 'c'], 7))
    const result = runBlindOutputReview(JSON.stringify({
      seed: 7,
      versions: [{ id: 'v1', label: 'alpha', text: 'one' }, { id: 'v2', label: 'beta', text: 'two' }],
      scores: [{ reviewer: 'r1', version_id: 'v1', rubric_id: 'clarity', score: 1 }, { reviewer: 'r2', version_id: 'v1', rubric_id: 'clarity', score: 4 }],
    }))
    const blind = (result.json as { result: { blind: { code: string; text: string }[]; disagreements: unknown[] } }).result
    expect(JSON.stringify(blind.blind)).not.toContain('alpha')
    expect(blind.disagreements).toHaveLength(1)
    expect(presentResult(runBlindOutputReview, '').error).toBe('empty')
  })

  it('keeps a group together and repeats a seed', () => {
    const input = JSON.stringify({ seed: 3, rows: [
      { id: '1', group: 'g', label: 'a', text: 'hello world' },
      { id: '2', group: 'g', label: 'a', text: 'hello world' },
      { id: '3', group: 'h', label: 'b', text: 'world hello' },
    ] })
    const once = runEvalDatasetSplitter(input)
    const twice = runEvalDatasetSplitter(input)
    const rows = (once.json as { result: { rows: { split: string }[]; flags: { code: string }[] } }).result
    expect(rows.rows[0]!.split).toBe(rows.rows[1]!.split)
    expect(rows.flags.some((flag) => flag.code === 'exact-duplicate')).toBe(true)
    expect(rows.flags.some((flag) => flag.code === 'needs-human')).toBe(true)
    expect(once.csv).toBe(twice.csv)
    expect(presentResult(runEvalDatasetSplitter, 'id,group,text\n').error).toBe('empty')
  })

  it('flags a lost placeholder as an error and a glossary miss as a hint', () => {
    const result = runLocalizationLqa(JSON.stringify({
      glossary: [{ source: 'Widget', target: 'Widgeto' }],
      rows: [
        { id: '1', source: 'Hello {name}', target: 'Bonjour' },
        { id: '2', source: 'Widget is ready', target: 'C\'est pret' },
        { id: '3', source: '', target: '' },
      ],
    }))
    const issues = (result.json as { result: { issues: { severity: string; code: string }[] } }).result.issues
    expect(issues.find((issue) => issue.code === 'placeholder')!.severity).toBe('error')
    expect(issues.find((issue) => issue.code === 'glossary')!.severity).toBe('hint')
    expect(result.csv).toContain('placeholder')
  })

  it('does not inflate revenue and does not add mixed currencies', () => {
    const result = runOwnedMarketingReport(JSON.stringify({
      base: 'USD',
      ads: [{ campaign: 'spring', spend: 10, currency: 'USD' }, { campaign: 'fall', spend: 5, currency: 'USD' }],
      orders: [
        { campaign: 'spring', order_id: 'o1', revenue: 20, currency: 'USD' },
        { campaign: 'spring', order_id: 'o2', revenue: 5, currency: 'USD' },
        { campaign: 'fall', order_id: 'o3', revenue: 8, currency: 'EUR' },
      ],
    }))
    const rows = (result.json as { result: { rows: { campaign: string; revenue: string; orders: number; note: string }[] } }).result.rows
    const spring = rows.find((row) => row.campaign === 'spring')!
    expect(spring.orders).toBe(2)
    expect(spring.revenue).toBe('25')
    expect(rows.find((row) => row.campaign === 'fall')!.note).toBe('currency-unknown')
    expect(presentResult(runOwnedMarketingReport, '{"ads":[]}').error).toBe('empty')
  })

  it('groups by surface form and region without using volume', () => {
    const result = runKeywordIntentMap(JSON.stringify({
      rows: [
        { keyword: 'Red Shoe', region: 'US', intent: 'buy', url: 'https://ex.com/a', volume: 999 },
        { keyword: 'red shoe', region: 'DE', intent: 'buy', url: 'https://ex.com/de', volume: 1 },
        { keyword: 'red shoe', region: 'US', intent: 'buy', url: 'https://ex.com/b', volume: 1 },
      ],
    }))
    const rows = (result.json as { result: { rows: { region: string; status: string }[] } }).result.rows
    expect(rows.find((row) => row.region === 'DE')!.status).toBe('owned')
    expect(rows.find((row) => row.region === 'US')!.status).toBe('human-choice')
    expect(result.csv).not.toContain('999')
    expect(presentResult(runKeywordIntentMap, 'keyword,region,intent,url\n').error).toBe('empty')
  })
})
