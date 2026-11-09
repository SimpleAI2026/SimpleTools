import { presentResult, type Presented } from '@/lib/workflow/core'
import { runLocalizationLqa } from '@/lib/workflow/b2'

export const SAMPLE = "{\"glossary\": [{\"source\": \"Widget\", \"target\": \"Widgeto\"}], \"rows\": [{\"id\": \"1\", \"source\": \"Hello {name}\", \"target\": \"Bonjour\"}, {\"id\": \"2\", \"source\": \"Widget is ready\", \"target\": \"C'est pret\"}]}"

export function run(input: string) {
  return runLocalizationLqa(input)
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
