const UNIT_PX: Record<string, number> = { '': 1, px: 1, pt: 96 / 72, pc: 16, in: 96, cm: 96 / 2.54, mm: 96 / 25.4, em: 16, rem: 16 }

function length(v: string | undefined): number | null {
  if (!v) return null
  const m = /^\s*([\d.]+)\s*([a-z]*)\s*$/i.exec(v)
  if (!m || !(m[2]!.toLowerCase() in UNIT_PX)) return null
  return parseFloat(m[1]!) * UNIT_PX[m[2]!.toLowerCase()]!
}

/** Intrinsic size of an SVG from width/height attributes or viewBox (default 300×150 like browsers). */
export function svgSize(svg: string): { width: number; height: number } {
  const tag = /<svg\b[^>]*>/i.exec(svg)?.[0]
  if (!tag) throw new Error('No <svg> element found')
  const attr = (n: string) => new RegExp(`\\s${n}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag)?.[1]
  const vb = attr('viewBox')?.trim().split(/[\s,]+/).map(Number)
  const vw = vb && vb.length === 4 && vb[2]! > 0 ? vb[2]! : null
  const vh = vb && vb.length === 4 && vb[3]! > 0 ? vb[3]! : null
  let w = length(attr('width'))
  let h = length(attr('height'))
  if (w && !h) h = vw && vh ? (w * vh) / vw : null
  if (h && !w) w = vw && vh ? (h * vw) / vh : null
  return { width: Math.round(w ?? vw ?? 300), height: Math.round(h ?? vh ?? 150) }
}

/** Ensure the markup is standalone (xmlns) and has explicit pixel size so <img> rasterizes it at the requested size. */
export function prepareSvg(svg: string, width: number, height: number): string {
  return svg.replace(/<svg\b([^>]*)>/i, (_m, attrs: string) => {
    let a = attrs.replace(/\s(width|height)\s*=\s*["'][^"']*["']/gi, '')
    if (!/\sxmlns\s*=/.test(a)) a += ' xmlns="http://www.w3.org/2000/svg"'
    return `<svg${a} width="${width}" height="${height}">`
  })
}
