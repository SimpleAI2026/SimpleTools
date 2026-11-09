import { presentResult, type Presented } from '@/lib/workflow/core'
import { runVideoDeliveryPreflight } from '@/lib/workflow/b4'

export const SAMPLE = "{\"probe\": \"Stream #0:0: Video: h264, yuv420p, 1920x1080, 30 fps\\n\", \"contract\": {\"width\": 1280, \"height\": 720, \"channels\": 2}}"

export function run(input: string) {
  return runVideoDeliveryPreflight(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
