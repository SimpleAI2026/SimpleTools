import { presentResult, type Presented } from '@/lib/workflow/core'
import { runHreflangMapAuditor } from '@/lib/workflow/b3'

export const SAMPLE = "{\"rows\": [{\"url\": \"https://ex.com/en\", \"lang\": \"en\", \"alternates\": [\"https://ex.com/en\", \"https://ex.com/de\"]}, {\"url\": \"https://ex.com/de\", \"lang\": \"de\", \"alternates\": [\"https://ex.com/de\"]}, {\"url\": \"https://ex.com/\", \"lang\": \"x-default\", \"alternates\": [\"https://ex.com/\"]}]}"

export function run(input: string) {
  return runHreflangMapAuditor(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
