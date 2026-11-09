import { presentResult, type Presented } from '@/lib/workflow/core'
import { runVisualSelectsBoard } from '@/lib/workflow/b4'

export const SAMPLE = "{\"order\": [\"b\", \"a\"], \"assets\": [{\"id\": \"a\", \"decision\": \"unrated\"}, {\"id\": \"b\", \"decision\": \"pick\", \"reason\": \"sharp\"}]}"

export function run(input: string) {
  return runVisualSelectsBoard(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
