import { formatWithPrettier } from '@/lib/formatCode'

export type CssLang = 'css' | 'scss' | 'less'

/** Lightweight CSS minifier: strips comments and redundant whitespace while leaving strings untouched. */
export function minifyCss(css: string): string {
  const parts: string[] = []
  const re = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\/\*[\s\S]*?\*\/)|([^"'/]+|\/)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css))) {
    if (m[1]) parts.push(m[1])
    else if (m[2]) continue
    else
      parts.push(
        m[3]!
          .replace(/\s+/g, ' ')
          .replace(/\s*([{};,>~+])\s*/g, '$1')
          .replace(/\s*:\s*/g, ':')
          .replace(/;}/g, '}'),
      )
  }
  return parts.join('').replace(/;}/g, '}').trim()
}

export function formatCss(code: string, lang: CssLang, tabWidth: number) {
  return formatWithPrettier(code, lang, { tabWidth })
}
