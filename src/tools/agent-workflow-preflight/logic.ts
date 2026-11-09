import { presentResult, type Presented } from '@/lib/workflow/core'
import { runAgentWorkflowPreflight } from '@/lib/workflow/b4'

export const SAMPLE = "{\"nodes\": [{\"id\": \"A\", \"retryLimit\": null}, {\"id\": \"B\", \"retryLimit\": null}, {\"id\": \"C\"}], \"edges\": [{\"from\": \"A\", \"to\": \"B\"}, {\"from\": \"B\", \"to\": \"A\"}, {\"from\": \"A\", \"to\": \"missing\"}]}"

export function run(input: string) {
  return runAgentWorkflowPreflight(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
