import { presentResult, type Presented } from '@/lib/workflow/core'
import { runOwnedMarketingReport } from '@/lib/workflow/b2'

export const SAMPLE = "{\"base\": \"USD\", \"ads\": [{\"campaign\": \"fall\", \"spend\": 5, \"currency\": \"USD\"}], \"orders\": [{\"campaign\": \"fall\", \"order_id\": \"o3\", \"revenue\": 8, \"currency\": \"EUR\"}]}"

export function run(input: string) {
  return runOwnedMarketingReport(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
