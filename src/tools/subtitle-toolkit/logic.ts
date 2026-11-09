import { presentResult, type Presented } from '@/lib/workflow/core'
import { runSubtitleToolkit } from '@/lib/workflow/b1'

export const SAMPLE = "{\"text\": \"1\\n\\n00:00:59,900 --> 00:01:00,200\\nHello\\n\", \"offsetMs\": 200, \"target\": \"vtt\"}"

export function run(input: string) {
  return runSubtitleToolkit(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
