import { presentResult, type Presented } from '@/lib/workflow/core'
import { runStoryboardVariants } from '@/lib/workflow/b1'

export const SAMPLE = "{\"shots\": [{\"id\": \"s1\", \"title\": \"Open\"}], \"variants\": [{\"id\": \"v1\", \"shot_id\": \"s1\", \"prompt\": \"wide\", \"model\": \"note\", \"camera\": \"wide\"}, {\"id\": \"v2\", \"shot_id\": \"s1\", \"parent_id\": \"v1\", \"prompt\": \"wide\", \"model\": \"note\", \"camera\": \"close\"}], \"takes\": [{\"id\": \"t1\", \"variant_id\": \"v2\", \"file\": \"\"}]}"

export function run(input: string) {
  return runStoryboardVariants(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
