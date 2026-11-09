import { markdownToDocx } from '@/tools/word-creator/logic'
import { DOCX_MIME } from './word'

const SAMPLE_MD = `# SimpleTools Sample

Offline-first developer toolbox.

- Pure front-end
- Bilingual zh/en

| Tool | Status |
| ---- | ------ |
| Vue  | OK     |
`

/** Build a short demo .docx for Word tools. */
export async function loadSampleDocx(): Promise<File> {
  const blob = await markdownToDocx(SAMPLE_MD, { font: 'Calibri', fontSize: 11, title: 'SimpleTools Sample' })
  return new File([blob], 'simpletools-sample.docx', { type: DOCX_MIME })
}
