import { presentResult, type Presented } from '@/lib/workflow/core'
import { runGenerationTakeLedger } from '@/lib/workflow/b1'

export const SAMPLE = "{\"asOf\": \"2026-11-08\", \"assets\": [{\"id\": \"a1\"}], \"grants\": [{\"id\": \"g1\", \"asset_id\": \"a1\", \"scope\": \"social\", \"territory\": \"world\", \"expires\": \"2026-12-01\", \"evidence\": \"c1\"}], \"uses\": [{\"id\": \"u1\", \"asset_id\": \"a1\", \"use\": \"ads\", \"territory\": \"US\"}]}"

export function run(input: string) {
  return runGenerationTakeLedger(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
