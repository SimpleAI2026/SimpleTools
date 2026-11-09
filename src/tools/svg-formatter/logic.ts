import { formatXml, minifyXml } from '@/tools/xml-formatter/logic'

export interface SvgCleanOptions {
  removeMetadata: boolean
  removeEditorData: boolean
  precision: number | null
}

/** Light-weight SVG cleanup: comments, metadata, editor namespaces and number precision. */
export function cleanSvg(svg: string, o: SvgCleanOptions): string {
  let s = svg.replace(/<!--[\s\S]*?-->/g, '')
  if (o.removeMetadata) s = s.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '').replace(/<metadata[\s\S]*?<\/metadata>/gi, '').replace(/<title>[\s\S]*?<\/title>/gi, '')
  if (o.removeEditorData) {
    s = s.replace(/<(sodipodi|inkscape):[^>]*?\/>/g, '').replace(/<(sodipodi|inkscape):([\w-]+)[^>]*>[\s\S]*?<\/\1:\2>/g, '')
    s = s.replace(/\s(?:sodipodi|inkscape|xmlns:sodipodi|xmlns:inkscape)(?::[\w-]+)?="[^"]*"/g, '')
  }
  if (o.precision !== null) {
    const p = o.precision
    s = s.replace(/(\s(?:d|points|viewBox|x|y|x1|x2|y1|y2|cx|cy|r|rx|ry|width|height|transform)=")([^"]*)"/g, (_m, a: string, v: string) =>
      `${a}${v.replace(/-?\d*\.\d+/g, (n) => String(Number(Number(n).toFixed(p))))}"`,
    )
  }
  return s.trim()
}

export function processSvg(svg: string, mode: 'format' | 'minify', o: SvgCleanOptions): string {
  const cleaned = cleanSvg(svg, o)
  return mode === 'minify' ? minifyXml(cleaned) : formatXml(cleaned, { indent: '  ' })
}
