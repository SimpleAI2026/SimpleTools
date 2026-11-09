import { presentResult, type Presented } from '@/lib/workflow/core'
import { runBrandEntityConsistency } from '@/lib/workflow/b2'

export const SAMPLE = "{\"facts\": [{\"entity\": \"Widget\", \"alias_group\": \"widget\", \"attribute\": \"price\", \"region\": \"US\", \"currency\": \"USD\", \"value\": \"99\", \"valid_from\": \"2026-01-01\", \"valid_to\": \"2026-12-31\", \"source\": \"a\"}, {\"entity\": \"Widget\", \"alias_group\": \"widget\", \"attribute\": \"price\", \"region\": \"DE\", \"currency\": \"EUR\", \"value\": \"109\", \"valid_from\": \"2026-01-01\", \"valid_to\": \"2026-12-31\", \"source\": \"b\"}, {\"entity\": \"Widget\", \"alias_group\": \"widget\", \"attribute\": \"price\", \"region\": \"US\", \"currency\": \"USD\", \"value\": \"129\", \"valid_from\": \"2026-06-01\", \"valid_to\": \"2026-08-01\", \"source\": \"c\"}]}"

export function run(input: string) {
  return runBrandEntityConsistency(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
