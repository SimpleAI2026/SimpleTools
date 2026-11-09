import { presentResult, type Presented } from '@/lib/workflow/core'
import { runProductFeedAuditor } from '@/lib/workflow/b3'

export const SAMPLE = "{\"rows\": [{\"id\": \"1\", \"title\": \"Hat\", \"price\": \"10\", \"currency\": \"USD\", \"gtin\": \"96385074\", \"item_group_id\": \"g\", \"ai_source\": \"human\"}, {\"id\": \"1\", \"title\": \"Hat\", \"price\": \"10\", \"currency\": \"EUR\", \"gtin\": \"96385075\", \"item_group_id\": \"g\", \"ai_source\": \"model\"}]}"

export function run(input: string) {
  return runProductFeedAuditor(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
