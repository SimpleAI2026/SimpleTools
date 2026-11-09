import { presentResult, type Presented } from '@/lib/workflow/core'
import { runProjectHandoffAuditor } from '@/lib/workflow/b4'

export const SAMPLE = "{\"required\": [{\"id\": \"brief\", \"path\": \"docs/brief.md\"}], \"references\": [{\"from\": \"shot\", \"to\": \"missing-take\"}], \"files\": [{\"id\": \"brief\", \"path\": \"docs/brief.md\", \"provided\": false}, {\"id\": \"a\", \"path\": \"../secret.txt\", \"sha256\": \"abc\", \"provided\": true}]}"

export function run(input: string) {
  return runProjectHandoffAuditor(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
