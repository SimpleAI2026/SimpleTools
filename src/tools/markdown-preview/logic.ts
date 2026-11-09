import { Marked } from 'marked'

export interface MarkdownOptions {
  gfm: boolean
  breaks: boolean
}

/** Render markdown to (unsanitized) HTML. Callers must sanitize before inserting into the DOM. */
export function renderMarkdown(md: string, o: MarkdownOptions = { gfm: true, breaks: false }): string {
  return new Marked({ gfm: o.gfm, breaks: o.breaks, async: false }).parse(md) as string
}

export function markdownStats(md: string) {
  const words = md.match(/[\u4e00-\u9fff]|[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0
  return { words, headings: md.match(/^#{1,6}\s/gm)?.length ?? 0, minutes: Math.max(1, Math.round(words / 250)) }
}

export function wrapHtmlDocument(body: string, title = 'Document'): string {
  return `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${title.replace(/</g, '&lt;')}</title>\n<style>body{max-width:760px;margin:2rem auto;padding:0 1rem;font-family:system-ui,sans-serif;line-height:1.6}pre{background:#f4f4f5;padding:1rem;overflow:auto}code{font-family:ui-monospace,monospace}table{border-collapse:collapse}td,th{border:1px solid #ddd;padding:.3rem .6rem}blockquote{border-left:4px solid #ddd;margin:0;padding-left:1rem;color:#555}img{max-width:100%}</style>\n</head>\n<body>\n${body}\n</body>\n</html>\n`
}
