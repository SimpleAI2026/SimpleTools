export interface SlideBullet {
  text: string
  level: number
}
export interface SlideSpec {
  title: string
  subtitle?: string
  bullets: SlideBullet[]
  notes: string[]
}

/**
 * Parse a simple Markdown outline: slides are separated by a line with `---`;
 * `# ` is the slide title, `## ` a subtitle, `- `/`* `/`1. ` bullets (indent = level), `> ` speaker notes, other lines plain bullets at level 0.
 */
export function parseSlides(md: string): SlideSpec[] {
  return md
    .replace(/\r\n?/g, '\n')
    .split(/^\s*---+\s*$/m)
    .map((chunk) => {
      const s: SlideSpec = { title: '', bullets: [], notes: [] }
      for (const raw of chunk.split('\n')) {
        if (!raw.trim()) continue
        const line = raw.replace(/\t/g, '  ')
        let m: RegExpExecArray | null
        if ((m = /^#\s+(.*)$/.exec(line.trim())) && !s.title) s.title = m[1]!.trim()
        else if ((m = /^##+\s+(.*)$/.exec(line.trim())) && !s.subtitle) s.subtitle = m[1]!.trim()
        else if ((m = /^>\s?(.*)$/.exec(line.trim()))) s.notes.push(m[1]!)
        else if ((m = /^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line))) s.bullets.push({ text: stripInline(m[2]!), level: Math.min(4, Math.floor(m[1]!.length / 2)) })
        else s.bullets.push({ text: stripInline(line.trim()), level: 0 })
      }
      return s
    })
    .filter((s) => s.title || s.subtitle || s.bullets.length)
}

/** Remove Markdown emphasis markers (pptx gets plain text runs). */
export function stripInline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*|__(.+?)__/g, '$1$2')
    .replace(/(?<![*\w])\*(?!\s)(.+?)\*|(?<![_\w])_(?!\s)(.+?)_/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
}

export const THEMES = {
  light: { bg: 'FFFFFF', title: '111827', text: '374151', accent: '6366F1' },
  dark: { bg: '111827', title: 'F9FAFB', text: 'D1D5DB', accent: '818CF8' },
  ocean: { bg: '0F3D5E', title: 'FFFFFF', text: 'DCEFFB', accent: '38BDF8' },
  warm: { bg: 'FFF7ED', title: '7C2D12', text: '431407', accent: 'EA580C' },
} as const
export type ThemeName = keyof typeof THEMES

export interface DeckOptions {
  theme: ThemeName
  layout: '16x9' | '4x3'
  title: string
  font: string
}

export async function buildPptx(slides: SlideSpec[], o: DeckOptions): Promise<Uint8Array> {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.layout = o.layout === '16x9' ? 'LAYOUT_16x9' : 'LAYOUT_4x3'
  pptx.title = o.title
  const th = THEMES[o.theme]
  const W = o.layout === '16x9' ? 10 : 10
  const H = o.layout === '16x9' ? 5.625 : 7.5
  slides.forEach((s, i) => {
    const slide = pptx.addSlide()
    slide.background = { color: th.bg }
    const isCover = i === 0 && !s.bullets.length
    if (isCover) {
      slide.addText(s.title, { x: 0.6, y: H / 2 - 1, w: W - 1.2, h: 1.2, fontSize: 40, bold: true, color: th.title, fontFace: o.font, align: 'center' })
      if (s.subtitle) slide.addText(s.subtitle, { x: 0.6, y: H / 2 + 0.3, w: W - 1.2, h: 0.8, fontSize: 22, color: th.accent, fontFace: o.font, align: 'center' })
    } else {
      slide.addShape('rect', { x: 0.5, y: 0.45, w: 0.12, h: 0.7, fill: { color: th.accent }, line: { color: th.accent } })
      slide.addText(s.title, { x: 0.75, y: 0.35, w: W - 1.25, h: 0.9, fontSize: 30, bold: true, color: th.title, fontFace: o.font })
      let top = 1.35
      if (s.subtitle) {
        slide.addText(s.subtitle, { x: 0.75, y: 1.15, w: W - 1.25, h: 0.5, fontSize: 18, color: th.accent, fontFace: o.font })
        top = 1.75
      }
      if (s.bullets.length)
        slide.addText(
          s.bullets.map((b) => ({ text: b.text, options: { bullet: true, indentLevel: b.level, fontSize: Math.max(14, 22 - b.level * 2), color: th.text, breakLine: true } })),
          { x: 0.75, y: top, w: W - 1.4, h: H - top - 0.5, valign: 'top', fontFace: o.font, paraSpaceAfter: 6 },
        )
    }
    if (s.notes.length) slide.addNotes(s.notes.join('\n'))
    slide.addText(String(i + 1), { x: W - 0.9, y: H - 0.45, w: 0.6, h: 0.3, fontSize: 10, color: th.text, align: 'right' })
  })
  return (await pptx.write({ outputType: 'uint8array' })) as Uint8Array
}
