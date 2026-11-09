import { presentResult, type Presented } from '@/lib/workflow/core'
import { runAgentEvalCases } from '@/lib/workflow/b1'

export const SAMPLE = "{\"cases\": [{\"id\": \"ok\", \"output\": \"{\\\"a\\\":1}\", \"rules\": [{\"path\": \"a\", \"equals\": 1}]}, {\"id\": \"bad\", \"output\": \"{\", \"rules\": [{\"path\": \"a\", \"equals\": 1}]}]}"

export function run(input: string) {
  return runAgentEvalCases(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
