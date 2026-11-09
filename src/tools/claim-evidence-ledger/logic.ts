import { presentResult, type Presented } from '@/lib/workflow/core'
import { runClaimEvidenceLedger } from '@/lib/workflow/b1'

export const SAMPLE = "{\"claims\": [{\"id\": \"c1\", \"text\": \"Price is 99\", \"year\": 2026}], \"links\": [{\"claim_id\": \"c1\", \"excerpt\": \"was 99\", \"source_id\": \"s\", \"file_id\": \"f\", \"evidence_year\": 2023, \"relation\": \"supports\"}]}"

export function run(input: string) {
  return runClaimEvidenceLedger(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
