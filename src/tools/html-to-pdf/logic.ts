import { DOC_CSS } from '@/lib/htmlPdf'

/** Wrap user HTML (fragment or full document) with default document styles and optional extra CSS. */
export function composeDocument(html: string, css: string): string {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
  const headStyles = [...html.matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi)].map((m) => m[0]).join('')
  return `${DOC_CSS}${headStyles}${css.trim() ? `<style>${css}</style>` : ''}${body}`
}
