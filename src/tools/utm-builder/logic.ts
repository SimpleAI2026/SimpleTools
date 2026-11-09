import { presentResult, type Presented } from '@/lib/workflow/core'
import { runUtmBuilder } from '@/lib/workflow/b1'

export const SAMPLE = "{\"onDuplicate\": \"overwrite\", \"links\": [{\"id\": \"1\", \"url\": \"https://ex.com/a?x=1#hero\", \"utm_source\": \"newsletter\", \"utm_medium\": \"email\", \"utm_campaign\": \"春促\"}]}"

export function run(input: string) {
  return runUtmBuilder(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
