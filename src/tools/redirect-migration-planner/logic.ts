import { presentResult, type Presented } from '@/lib/workflow/core'
import { runRedirectMigrationPlanner } from '@/lib/workflow/b3'

export const SAMPLE = "{\"rows\": [{\"from\": \"https://ex.com/a\", \"to\": \"https://ex.com/b\", \"status\": \"301\"}, {\"from\": \"https://ex.com/b\", \"to\": \"https://ex.com/a\", \"status\": \"302\"}, {\"from\": \"https://ex.com/c\", \"to\": \"https://ex.com/d\", \"status\": \"999\"}]}"

export function run(input: string) {
  return runRedirectMigrationPlanner(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
