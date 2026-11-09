import { presentResult, type Presented } from '@/lib/workflow/core'
import { runAiAnswerSnapshot } from '@/lib/workflow/b1'

export const SAMPLE = "{\"aliases\": [\"Acme\"], \"answers\": [{\"id\": \"m\", \"text\": \"Acme is fine\", \"citations\": []}, {\"id\": \"c\", \"text\": \"no brand\", \"citations\": [\"https://other.example/a\"]}, {\"id\": \"u\", \"text\": \"\", \"citations\": []}]}"

export function run(input: string) {
  return runAiAnswerSnapshot(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
