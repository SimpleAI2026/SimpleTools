import { DEFAULT_PRICING_MODELS, type PricingModel } from '../_shared/ai-models'

export type { PricingModel }
export { DEFAULT_PRICING_MODELS }

export interface CostInput {
  inputTokens: number
  outputTokens: number
  inputPerMillion: number
  outputPerMillion: number
  requestsPerMonth?: number
}

export interface CostResult {
  perCall: number
  monthly: number
  inputCost: number
  outputCost: number
}

export function estimateCost(input: CostInput): CostResult {
  const inTok = Math.max(0, Number(input.inputTokens) || 0)
  const outTok = Math.max(0, Number(input.outputTokens) || 0)
  const inRate = Math.max(0, Number(input.inputPerMillion) || 0)
  const outRate = Math.max(0, Number(input.outputPerMillion) || 0)
  const inputCost = (inTok / 1_000_000) * inRate
  const outputCost = (outTok / 1_000_000) * outRate
  const perCall = inputCost + outputCost
  const rpm = Math.max(0, Number(input.requestsPerMonth) || 0)
  return { perCall, monthly: perCall * rpm, inputCost, outputCost }
}

export function formatUsd(n: number): string {
  if (!Number.isFinite(n)) return '$0.00'
  if (n === 0) return '$0.00'
  if (n < 0.0001) return `$${n.toExponential(2)}`
  if (n < 0.01) return `$${n.toFixed(6)}`
  if (n < 1) return `$${n.toFixed(4)}`
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function findModel(id: string, models: PricingModel[] = DEFAULT_PRICING_MODELS): PricingModel | undefined {
  return models.find((m) => m.id === id)
}
