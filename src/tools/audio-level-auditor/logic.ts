import { presentResult, type Presented } from '@/lib/workflow/core'
import { runAudioLevelAuditor } from '@/lib/workflow/b4'

export const SAMPLE = "{\"wavBase64\": \"UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQQAAAAAAAAA\", \"window\": 0}"

export function run(input: string) {
  return runAudioLevelAuditor(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
