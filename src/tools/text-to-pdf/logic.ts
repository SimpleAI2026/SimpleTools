import type { Block } from '@/lib/pdfText'

/** Each source line becomes a block; blank lines keep vertical space; form feed = page break. */
export function textToBlocks(text: string, size: number): Block[] {
  return text.replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n').flatMap((line) =>
    line.split('\f').flatMap((part, i) => (i ? [{ text: '', size, pageBreak: true }, { text: part, size }] : [{ text: part, size }])),
  )
}
