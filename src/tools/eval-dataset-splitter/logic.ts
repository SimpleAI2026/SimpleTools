import { presentResult, type Presented } from '@/lib/workflow/core'
import { runEvalDatasetSplitter } from '@/lib/workflow/b2'

export const SAMPLE = "{\"seed\": 3, \"rows\": [{\"id\": \"1\", \"group\": \"g\", \"label\": \"a\", \"text\": \"hello world\"}, {\"id\": \"2\", \"group\": \"g\", \"label\": \"a\", \"text\": \"hello world\"}, {\"id\": \"3\", \"group\": \"h\", \"label\": \"b\", \"text\": \"world hello\"}]}"

export function run(input: string) {
  return runEvalDatasetSplitter(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
