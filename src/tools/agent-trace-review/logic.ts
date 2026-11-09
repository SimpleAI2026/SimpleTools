import { presentResult, type Presented } from '@/lib/workflow/core'
import { runAgentTraceReview } from '@/lib/workflow/b2'

export const SAMPLE = "{\"id\":\"1\",\"parent\":\"\",\"ts\":\"2026-01-01T00:00:02Z\",\"attempt\":\"1\",\"call\":\"c\",\"status\":\"error\",\"rate\":null,\"tokens\":10}\n{\"id\":\"2\",\"parent\":\"9\",\"ts\":\"2026-01-01T00:00:01Z\",\"attempt\":\"2\",\"call\":\"c\",\"status\":\"ok\",\"rate\":0.02,\"tokens\":10}"

export function run(input: string) {
  return runAgentTraceReview(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
