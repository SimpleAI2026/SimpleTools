import { presentResult, type Presented } from '@/lib/workflow/core'
import { runAbTestAnalyzer } from '@/lib/workflow/b3'

export const SAMPLE = "{\"successA\": 50, \"trialsA\": 100, \"successB\": 50, \"trialsB\": 100, \"alternative\": \"two-sided\"}"

export function run(input: string) {
  return runAbTestAnalyzer(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
