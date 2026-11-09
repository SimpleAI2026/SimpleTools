import { presentResult, type Presented } from '@/lib/workflow/core'
import { runPromotionStackSimulator } from '@/lib/workflow/b3'

export const SAMPLE = "{\"subtotal\": 100, \"promotions\": [{\"id\": \"f\", \"kind\": \"fixed\", \"amount\": 20}, {\"id\": \"p\", \"kind\": \"percent\", \"amount\": 10}]}"

export function run(input: string) {
  return runPromotionStackSimulator(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
