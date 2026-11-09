import { presentResult, type Presented } from '@/lib/workflow/core'
import { runGeoQuestionPanel } from '@/lib/workflow/b1'

export const SAMPLE = "question,language,audience,source,id\nHow does it work?,en,dev,interview,\n"

export function run(input: string) {
  return runGeoQuestionPanel(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
