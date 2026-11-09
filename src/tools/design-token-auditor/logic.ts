import { presentResult, type Presented } from '@/lib/workflow/core'
import { runDesignTokenAuditor } from '@/lib/workflow/b4'

export const SAMPLE = "{\"tokens\": {\"color\": {\"a\": {\"$value\": \"{color.b}\", \"$type\": \"color\"}, \"b\": {\"$value\": \"{color.a}\", \"$type\": \"color\"}}}}"

export function run(input: string) {
  return runDesignTokenAuditor(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
