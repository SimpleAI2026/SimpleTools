import { finish, num, presentResult, rootObject, str, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '{"successA":50,"trialsA":100,"successB":50,"trialsB":100,"alternative":"two-sided"}'

export type Alternative = 'two-sided' | 'greater' | 'less'
export interface AbTestResult {
  status: 'ok' | 'invalid'
  z: string
  p: string
  significant: boolean
  applicable: boolean
  rateA: number
  rateB: number
  difference: number
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

export function twoProportion(s1: number, n1: number, s2: number, n2: number, alternative: Alternative, alpha = 0.05): AbTestResult {
  const invalid = !Number.isInteger(s1) || !Number.isInteger(n1) || !Number.isInteger(s2) || !Number.isInteger(n2)
    || s1 < 0 || s2 < 0 || n1 <= 0 || n2 <= 0 || s1 > n1 || s2 > n2 || alpha <= 0 || alpha >= 1
  if (invalid) return { status: 'invalid', z: '', p: '', significant: false, applicable: false, rateA: 0, rateB: 0, difference: 0 }
  const rateA = s1 / n1
  const rateB = s2 / n2
  const pooled = (s1 + s2) / (n1 + n2)
  const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
  const z = standardError === 0 ? 0 : (rateA - rateB) / standardError
  const cdf = 0.5 * (1 + erf(z / Math.SQRT2))
  const p = alternative === 'greater' ? 1 - cdf : alternative === 'less' ? cdf : 2 * Math.min(cdf, 1 - cdf)
  const applicable = n1 >= 30 && n2 >= 30 && n1 * pooled >= 5 && n1 * (1 - pooled) >= 5 && n2 * pooled >= 5 && n2 * (1 - pooled) >= 5
  return {
    status: 'ok',
    z: String(Math.round(z * 1000) / 1000),
    p: String(Math.round(p * 10000) / 10000),
    significant: applicable && p < alpha,
    applicable,
    rateA,
    rateB,
    difference: rateA - rateB,
  }
}

export function run(input: string) {
  const root = rootObject(input, 'ab-test-analyzer')
  const successA = num(root.successA)
  const trialsA = num(root.trialsA)
  const successB = num(root.successB)
  const trialsB = num(root.trialsB)
  if (successA == null || trialsA == null || successB == null || trialsB == null) throw new Error('bad-input')
  const requested = str(root.alternative || 'two-sided')
  const alternative: Alternative = requested === 'greater' || requested === 'less' ? requested : 'two-sided'
  const alpha = num(root.alpha) ?? 0.05
  const result = twoProportion(successA, trialsA, successB, trialsB, alternative, alpha)
  return finish(
    'ab-test-analyzer',
    root,
    'Two-proportion z only. A small sample is not called significant. This is not a causal or sequential test.',
    result,
    ['status', 'rate_a', 'rate_b', 'difference', 'z', 'p', 'applicable', 'significant'],
    [[result.status, result.rateA, result.rateB, result.difference, result.z, result.p, result.applicable, result.significant]],
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
