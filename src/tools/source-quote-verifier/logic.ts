import { presentResult, type Presented } from '@/lib/workflow/core'
import { runSourceQuoteVerifier } from '@/lib/workflow/b2'

export const SAMPLE = "{\"quotes\": [{\"id\": \"d\", \"quote\": \"price is 100\", \"source\": \"price is 10\", \"location\": \"p1\"}, {\"id\": \"e\", \"quote\": \"the price is \\u2026 dollars\", \"source\": \"the price is 100 dollars\", \"location\": \"p2\"}]}"

export function run(input: string) {
  return runSourceQuoteVerifier(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
