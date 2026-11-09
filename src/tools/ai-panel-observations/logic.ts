import { presentResult, type Presented } from '@/lib/workflow/core'
import { runAiPanelObservations } from '@/lib/workflow/b1'

export const SAMPLE = "{\"planned\": 10, \"observations\": [{\"question_id\": \"q\", \"product\": \"app\", \"mode\": \"ui\", \"outcome\": \"answered\", \"mentioned\": true}]}"

export function run(input: string) {
  return runAiPanelObservations(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
