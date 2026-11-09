import { presentResult, type Presented } from '@/lib/workflow/core'
import { runChapterAuthor } from '@/lib/workflow/b4'

export const SAMPLE = "{\"mode\": \"youtube\", \"duration\": 30, \"chapters\": [{\"start\": 5, \"title\": \"Intro\", \"summary\": \"open\"}]}"

export function run(input: string) {
  return runChapterAuthor(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
