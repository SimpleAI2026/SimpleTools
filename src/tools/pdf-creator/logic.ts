import type { Block } from '@/lib/pdfText'

const strip = (s: string) => s.replace(/\*\*(.+?)\*\*|__(.+?)__/g, '$1$2').replace(/`([^`]+)`/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

/** Markdown-lite → layout blocks: #/##/### headings, -/* and 1. lists, > quotes, --- rule, `\pagebreak`, paragraphs. */
export function markdownToBlocks(md: string, size: number): Block[] {
  const out: Block[] = []
  let para: string[] = []
  const flush = () => {
    if (para.length) out.push({ text: strip(para.join(' ')), size, before: size * 0.5 })
    para = []
  }
  for (const raw of md.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim()
    let m: RegExpMatchArray | null
    if (!line) flush()
    else if (line === '\\pagebreak' || line === '<!-- pagebreak -->') {
      flush()
      out.push({ text: '', size, pageBreak: true })
    } else if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      flush()
      const lvl = m[1]!.length
      out.push({ text: strip(m[2]!), size: size * [2, 1.5, 1.25][lvl - 1]!, bold: true, before: size * (lvl === 1 ? 0.6 : 1) })
    } else if (/^(-{3,}|\*{3,})$/.test(line)) {
      flush()
      out.push({ text: '', size, rule: true })
    } else if ((m = line.match(/^[-*+]\s+(.*)$/))) {
      flush()
      out.push({ text: `• ${strip(m[1]!)}`, size, indent: size })
    } else if ((m = line.match(/^(\d+)[.)]\s+(.*)$/))) {
      flush()
      out.push({ text: `${m[1]}. ${strip(m[2]!)}`, size, indent: size })
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      flush()
      out.push({ text: strip(m[1]!), size, indent: size * 2, color: '#555555' })
    } else para.push(line)
  }
  flush()
  return out
}
