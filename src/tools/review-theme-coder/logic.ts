import { presentResult, type Presented } from '@/lib/workflow/core'
import { runReviewThemeCoder } from '@/lib/workflow/b3'

export const SAMPLE = "{\"taxonomy\": [{\"id\": \"shipping\", \"terms\": \"late|delay\"}, {\"id\": \"price\", \"terms\": \"expensive\"}], \"reviews\": [{\"id\": \"r1\", \"user\": \"u1\", \"text\": \"late and expensive\", \"human\": [\"shipping\"]}, {\"id\": \"r2\", \"user\": \"u1\", \"text\": \"thanks\"}]}"

export function run(input: string) {
  return runReviewThemeCoder(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
