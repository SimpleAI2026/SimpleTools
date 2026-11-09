import { presentResult, type Presented } from '@/lib/workflow/core'
import { runGeoAccessEvidence } from '@/lib/workflow/b3'

export const SAMPLE = "{\"robots\": \"User-agent: *\\nDisallow: /secret\\n\", \"tests\": [{\"ua\": \"Googlebot\", \"url\": \"https://ex.com/secret\"}]}"

export function run(input: string) {
  return runGeoAccessEvidence(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
