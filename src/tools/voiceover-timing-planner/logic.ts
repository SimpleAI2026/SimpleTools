import { presentResult, type Presented } from '@/lib/workflow/core'
import { runVoiceoverTimingPlanner } from '@/lib/workflow/b4'

export const SAMPLE = "{\"unit\": \"word\", \"ratePerMin\": 120, \"segments\": [{\"id\": \"s\", \"text\": \"one\", \"count\": 120, \"pauseSec\": 5}]}"

export function run(input: string) {
  return runVoiceoverTimingPlanner(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
