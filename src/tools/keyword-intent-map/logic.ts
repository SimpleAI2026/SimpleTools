import { presentResult, type Presented } from '@/lib/workflow/core'
import { runKeywordIntentMap } from '@/lib/workflow/b2'

export const SAMPLE = "{\"rows\": [{\"keyword\": \"Red Shoe\", \"region\": \"US\", \"intent\": \"buy\", \"url\": \"https://ex.com/a\", \"volume\": 999}, {\"keyword\": \"red shoe\", \"region\": \"US\", \"intent\": \"buy\", \"url\": \"https://ex.com/b\"}]}"

export function run(input: string) {
  return runKeywordIntentMap(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
