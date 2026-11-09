import { presentResult, type Presented } from '@/lib/workflow/core'
import { runImageAltReview } from '@/lib/workflow/b4'

export const SAMPLE = "{\"images\": [{\"id\": \"1\", \"role\": \"decorative\", \"alt\": \"\"}, {\"id\": \"2\", \"role\": \"functional\", \"alt\": \"icon\", \"purpose\": \"\"}, {\"id\": \"3\", \"role\": \"complex\", \"alt\": \"chart\", \"textInImage\": true, \"nearbyConfirmed\": false}]}"

export function run(input: string) {
  return runImageAltReview(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
