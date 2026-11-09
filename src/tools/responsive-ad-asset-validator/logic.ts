import { presentResult, type Presented } from '@/lib/workflow/core'
import { runResponsiveAdAssetValidator } from '@/lib/workflow/b3'

export const SAMPLE = "{\"rules\": {\"headline\": 30, \"cjk\": \"double\", \"guaranteedPins\": [\"1\"]}, \"assets\": [{\"id\": \"1\", \"group\": \"g\", \"field\": \"headline\", \"text\": \"汉字汉字汉字汉字汉字汉字汉字汉字\", \"pin\": \"1\"}, {\"id\": \"2\", \"group\": \"g\", \"field\": \"description\", \"text\": \"Legal\", \"pin\": \"3\", \"disclosure\": true}]}"

export function run(input: string) {
  return runResponsiveAdAssetValidator(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
