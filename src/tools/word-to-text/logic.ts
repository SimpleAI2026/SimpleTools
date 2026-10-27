export interface TextCleanOptions {
  collapseBlankLines: boolean
  trimLines: boolean
}

/** mammoth separates paragraphs with blank lines; optionally tidy them up. */
export function tidyText(text: string, o: TextCleanOptions): string {
  let lines = text.replace(/\r\n?/g, '\n').split('\n')
  if (o.trimLines) lines = lines.map((l) => l.trim())
  let out = lines.join('\n')
  if (o.collapseBlankLines) out = out.replace(/\n{3,}/g, '\n\n')
  return out.trim()
}
