import { minifyCss } from '@/tools/css-formatter/logic'

export interface HtmlMinifyOptions {
  removeComments: boolean
  collapseWhitespace: boolean
  /** Also drop whitespace between tags (may affect inline element spacing). */
  aggressive: boolean
  minifyCss: boolean
}

export const defaultHtmlMinify: HtmlMinifyOptions = { removeComments: true, collapseWhitespace: true, aggressive: false, minifyCss: true }

export function minifyHtml(html: string, o: HtmlMinifyOptions = defaultHtmlMinify): string {
  const saved: string[] = []
  const keep = (s: string) => `<\uE000${saved.push(s) - 1}\uE000>`
  let s = html.replace(/<(pre|textarea|script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi, (_m, tag: string, attrs: string, body: string) => {
    const t = tag.toLowerCase()
    let b = body
    if (t === 'style' && o.minifyCss) b = minifyCss(b)
    else if (t === 'script') b = b.trim()
    return keep(`<${tag}${attrs}>${b}</${tag}>`)
  })
  if (o.removeComments) s = s.replace(/<!--(?!\[if|<!|>)[\s\S]*?-->/g, '')
  if (o.collapseWhitespace) {
    s = s.replace(/\s+/g, ' ')
    s = s.replace(/<([a-zA-Z][^\s>/]*)((?:\s+[^\s>]+)*)\s*(\/?)>/g, (_m, t: string, a: string, sl: string) => `<${t}${a.replace(/\s+/g, ' ')}${sl ? '/' : ''}>`)
    s = o.aggressive ? s.replace(/>\s+</g, '><') : s.replace(/>\s+</g, '> <')
    s = s.trim()
  }
  return s.replace(/<\uE000(\d+)\uE000>/g, (_m, i: string) => saved[Number(i)]!)
}
