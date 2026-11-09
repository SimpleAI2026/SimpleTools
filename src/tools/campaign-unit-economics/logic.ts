import { presentResult, type Presented } from '@/lib/workflow/core'
import { runCampaignUnitEconomics } from '@/lib/workflow/b3'

export const SAMPLE = "{\"base\": \"USD\", \"scenarios\": [{\"name\": \"zero\", \"spend\": 0, \"revenue\": 10, \"cogs\": 1, \"refunds\": 2, \"shipping\": 1, \"currency\": \"USD\"}]}"

export function run(input: string) {
  return runCampaignUnitEconomics(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
