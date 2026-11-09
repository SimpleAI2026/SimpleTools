import { presentResult, type Presented } from '@/lib/workflow/core'
import { runBlindOutputReview } from '@/lib/workflow/b2'

export const SAMPLE = "{\"seed\": 7, \"versions\": [{\"id\": \"v1\", \"label\": \"alpha\", \"text\": \"one\"}, {\"id\": \"v2\", \"label\": \"beta\", \"text\": \"two\"}], \"scores\": [{\"reviewer\": \"r1\", \"version_id\": \"v1\", \"rubric_id\": \"clarity\", \"score\": 1}, {\"reviewer\": \"r2\", \"version_id\": \"v1\", \"rubric_id\": \"clarity\", \"score\": 4}]}"

export function run(input: string) {
  return runBlindOutputReview(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
