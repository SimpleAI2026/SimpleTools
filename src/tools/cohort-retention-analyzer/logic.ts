import { presentResult, type Presented } from '@/lib/workflow/core'
import { runCohortRetention } from '@/lib/workflow/b3'

export const SAMPLE = "{\"timezone\": \"+08:00\", \"firstEvent\": \"signup\", \"asOf\": \"2026-03-20\", \"horizon\": 1, \"events\": [{\"user\": \"a\", \"event\": \"signup\", \"ts\": \"2026-03-02T01:00:00\"}, {\"user\": \"a\", \"event\": \"active\", \"ts\": \"2026-03-03T01:00:00\"}, {\"user\": \"a\", \"event\": \"active\", \"ts\": \"2026-04-02T01:00:00\"}, {\"user\": \"b\", \"event\": \"signup\", \"ts\": \"2026-03-05T01:00:00\"}]}"

export function run(input: string) {
  return runCohortRetention(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
