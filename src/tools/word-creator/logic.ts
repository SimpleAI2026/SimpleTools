import { marked, type Token, type Tokens } from 'marked'
import type { IParagraphOptions, ParagraphChild } from 'docx'

type Docx = typeof import('docx')
interface RunStyle {
  bold?: boolean
  italics?: boolean
  strike?: boolean
  code?: boolean
}

export interface DocOptions {
  font: string
  fontSize: number // pt
  title: string
}

function inline(d: Docx, tokens: Token[] | undefined, style: RunStyle = {}): ParagraphChild[] {
  const out: ParagraphChild[] = []
  for (const t of tokens ?? []) {
    switch (t.type) {
      case 'strong':
        out.push(...inline(d, (t as Tokens.Strong).tokens, { ...style, bold: true }))
        break
      case 'em':
        out.push(...inline(d, (t as Tokens.Em).tokens, { ...style, italics: true }))
        break
      case 'del':
        out.push(...inline(d, (t as Tokens.Del).tokens, { ...style, strike: true }))
        break
      case 'codespan':
        out.push(new d.TextRun({ text: (t as Tokens.Codespan).text, font: 'Consolas', shading: { fill: 'F1F5F9', type: d.ShadingType.CLEAR, color: 'auto' }, ...style }))
        break
      case 'link': {
        const l = t as Tokens.Link
        out.push(new d.ExternalHyperlink({ link: l.href, children: [new d.TextRun({ text: l.text, style: 'Hyperlink', ...style })] }))
        break
      }
      case 'br':
        out.push(new d.TextRun({ text: '', break: 1 }))
        break
      case 'text': {
        const tt = t as Tokens.Text
        if (tt.tokens?.length) out.push(...inline(d, tt.tokens, style))
        else out.push(new d.TextRun({ text: decode(tt.text), ...style }))
        break
      }
      case 'escape':
        out.push(new d.TextRun({ text: (t as Tokens.Escape).text, ...style }))
        break
      default:
        if ('text' in t && typeof t.text === 'string') out.push(new d.TextRun({ text: decode(t.text), ...style }))
    }
  }
  return out
}

const decode = (s: string) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")

function blocks(d: Docx, tokens: Token[], level = 0): (InstanceType<Docx['Paragraph']> | InstanceType<Docx['Table']>)[] {
  const out: (InstanceType<Docx['Paragraph']> | InstanceType<Docx['Table']>)[] = []
  const H = [d.HeadingLevel.HEADING_1, d.HeadingLevel.HEADING_2, d.HeadingLevel.HEADING_3, d.HeadingLevel.HEADING_4, d.HeadingLevel.HEADING_5, d.HeadingLevel.HEADING_6]
  for (const t of tokens) {
    switch (t.type) {
      case 'heading': {
        const h = t as Tokens.Heading
        out.push(new d.Paragraph({ heading: H[h.depth - 1], children: inline(d, h.tokens) }))
        break
      }
      case 'paragraph':
        out.push(new d.Paragraph({ children: inline(d, (t as Tokens.Paragraph).tokens), spacing: { after: 120 } }))
        break
      case 'list': {
        const l = t as Tokens.List
        for (const item of l.items) {
          const [first, ...rest] = item.tokens
          const opts: IParagraphOptions = l.ordered ? { numbering: { reference: 'ordered', level } } : { bullet: { level } }
          const prefix = item.task ? [new d.TextRun({ text: item.checked ? '☑ ' : '☐ ' })] : []
          const firstInline = first && 'tokens' in first ? inline(d, (first as Tokens.Text).tokens) : []
          out.push(new d.Paragraph({ ...opts, children: [...prefix, ...firstInline] }))
          out.push(...blocks(d, rest, level + 1))
        }
        break
      }
      case 'code':
        for (const line of (t as Tokens.Code).text.split('\n'))
          out.push(new d.Paragraph({ shading: { fill: 'F1F5F9', type: d.ShadingType.CLEAR, color: 'auto' }, spacing: { after: 0 }, children: [new d.TextRun({ text: line || ' ', font: 'Consolas', size: 19 })] }))
        out.push(new d.Paragraph({ children: [] }))
        break
      case 'blockquote':
        for (const p of (t as Tokens.Blockquote).tokens)
          out.push(new d.Paragraph({ indent: { left: 567 }, border: { left: { style: d.BorderStyle.SINGLE, size: 12, color: 'CBD5E1', space: 8 } }, children: inline(d, 'tokens' in p ? (p as Tokens.Paragraph).tokens : [], { italics: true }) }))
        break
      case 'hr':
        out.push(new d.Paragraph({ border: { bottom: { style: d.BorderStyle.SINGLE, size: 6, color: '999999', space: 1 } }, children: [] }))
        break
      case 'table': {
        const tb = t as Tokens.Table
        const cell = (c: Tokens.TableCell, head: boolean) =>
          new d.TableCell({ children: [new d.Paragraph({ children: inline(d, c.tokens, head ? { bold: true } : {}) })], shading: head ? { fill: 'F1F5F9', type: d.ShadingType.CLEAR, color: 'auto' } : undefined })
        out.push(
          new d.Table({
            width: { size: 100, type: d.WidthType.PERCENTAGE },
            rows: [new d.TableRow({ tableHeader: true, children: tb.header.map((c) => cell(c, true)) }), ...tb.rows.map((r) => new d.TableRow({ children: r.map((c) => cell(c, false)) }))],
          }),
        )
        out.push(new d.Paragraph({ children: [] }))
        break
      }
      case 'space':
        break
      default:
        if ('text' in t && typeof t.text === 'string' && t.text.trim()) out.push(new d.Paragraph({ children: [new d.TextRun(decode(t.text))] }))
    }
  }
  return out
}

/** Build a .docx from Markdown (headings, paragraphs, emphasis, links, lists, tasks, code, quotes, tables, rules). */
export async function markdownToDocx(md: string, o: DocOptions): Promise<Blob> {
  const d = await import('docx')
  const doc = new d.Document({
    title: o.title,
    creator: 'SimpleTools',
    styles: { default: { document: { run: { font: o.font, size: Math.round(o.fontSize * 2) } } } },
    numbering: {
      config: [
        {
          reference: 'ordered',
          levels: [0, 1, 2, 3].map((level) => ({ level, format: d.LevelFormat.DECIMAL, text: `%${level + 1}.`, alignment: d.AlignmentType.START, style: { paragraph: { indent: { left: 720 * (level + 1), hanging: 360 } } } })),
        },
      ],
    },
    sections: [{ children: blocks(d, marked.lexer(md)) }],
  })
  return d.Packer.toBlob(doc)
}
