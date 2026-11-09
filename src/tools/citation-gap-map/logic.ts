import { presentResult, type Presented } from '@/lib/workflow/core'
import { runCitationGapMap } from '@/lib/workflow/b2'

export const SAMPLE = "{\"self\": \"acme\", \"ownership\": [{\"domain\": \"rival.example\", \"owner\": \"rival\"}, {\"domain\": \"mystery.example\", \"owner\": \"unknown\"}], \"citations\": [{\"brand\": \"rival\", \"domain\": \"rival.example\", \"theme\": \"pricing\", \"question_id\": \"q\"}, {\"brand\": \"other\", \"domain\": \"mystery.example\", \"theme\": \"support\", \"question_id\": \"q2\"}]}"

export function run(input: string) {
  return runCitationGapMap(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
