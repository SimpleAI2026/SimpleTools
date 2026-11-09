import { presentResult, type Presented } from '@/lib/workflow/core'
import { runGeoChangeExperiment } from '@/lib/workflow/b2'

export const SAMPLE = "{\"hypothesis\": \"New page\", \"treatment\": {\"model\": \"m2\", \"panel\": \"p1\"}, \"control\": {\"model\": \"m1\", \"panel\": \"p1\"}, \"observations\": [{\"arm\": \"treatment\", \"mentioned\": true, \"model\": \"m2\", \"panel\": \"p1\"}, {\"arm\": \"control\", \"mentioned\": false, \"model\": \"m1\", \"panel\": \"p1\"}]}"

export function run(input: string) {
  return runGeoChangeExperiment(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
