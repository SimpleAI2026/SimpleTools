import { presentResult, type Presented } from '@/lib/workflow/core'
import { runEditDecisionLog } from '@/lib/workflow/b4'

export const SAMPLE = "{\"clips\": [{\"id\": \"a\", \"start\": 0, \"end\": 3, \"fps\": 24}, {\"id\": \"b\", \"start\": 0, \"end\": 3, \"fps\": 24}]}"

export function run(input: string) {
  return runEditDecisionLog(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
