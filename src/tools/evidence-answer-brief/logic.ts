import { presentResult, type Presented } from '@/lib/workflow/core'
import { runEvidenceAnswerBrief } from '@/lib/workflow/b1'

export const SAMPLE = "{\"question_id\": \"q\", \"audience\": \"editors\", \"requirements\": [{\"id\": \"r1\", \"text\": \"Need a source\", \"evidence_ids\": []}], \"ledger\": []}"

export function run(input: string) {
  return runEvidenceAnswerBrief(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
