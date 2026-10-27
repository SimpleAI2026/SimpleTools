import { canvasesToPdf, pageSize, type PageSizeName } from './rasterPdf'

export interface HtmlPdfOptions {
  page: PageSizeName
  landscape: boolean
  /** pt */
  margin: number
  /** device pixel ratio for rendering (2 ≈ 192 dpi) */
  ratio: number
}

const PX_PER_PT = 96 / 72

/** CSS-pixel content box and device-pixel page size for a page layout. */
export function pageGeometry(o: HtmlPdfOptions) {
  const [W, H] = pageSize(o.page, o.landscape)
  const contentW = Math.round((W - 2 * o.margin) * PX_PER_PT)
  const contentH = Math.round((H - 2 * o.margin) * PX_PER_PT)
  return { W, H, contentW, contentH, marginPx: Math.round(o.margin * PX_PER_PT * o.ratio), pageWpx: Math.round(W * PX_PER_PT * o.ratio), pageHpx: Math.round(H * PX_PER_PT * o.ratio) }
}

/** Number of pages a rendered height (CSS px) needs. */
export const pagesNeeded = (heightPx: number, contentH: number) => Math.max(1, Math.ceil(heightPx / contentH))

/**
 * Render (already sanitised) HTML into an image-based PDF in the browser: the document is laid out at the
 * page's content width, rasterised with html-to-image and cut into page-high slices. Text is not selectable.
 */
export async function renderHtmlToPdf(html: string, o: HtmlPdfOptions, title?: string): Promise<Uint8Array> {
  const g = pageGeometry(o)
  const host = document.createElement('div')
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${g.contentW}px;background:#fff;color:#000;`
  host.innerHTML = html
  document.body.appendChild(host)
  try {
    await document.fonts?.ready
    await Promise.all([...host.querySelectorAll('img')].map((img) => (img.complete ? null : new Promise((r) => ((img.onload = r), (img.onerror = r))))))
    const { toCanvas } = await import('html-to-image')
    const height = host.scrollHeight
    const full = await toCanvas(host, { pixelRatio: o.ratio, width: g.contentW, height, backgroundColor: '#ffffff', style: { left: '0', position: 'static' } })
    const sliceH = g.contentH * o.ratio
    const pages = []
    for (let i = 0; i < pagesNeeded(height, g.contentH); i++) {
      const c = document.createElement('canvas')
      c.width = g.pageWpx
      c.height = g.pageHpx
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, c.width, c.height)
      const sy = i * sliceH
      const h = Math.min(sliceH, full.height - sy)
      if (h > 0) ctx.drawImage(full, 0, sy, full.width, h, g.marginPx, g.marginPx, full.width, h)
      pages.push({ canvas: c, widthPt: g.W, heightPt: g.H })
    }
    return await canvasesToPdf(pages, 'jpeg', 0.92, title)
  } finally {
    host.remove()
  }
}

export const DOC_CSS = `<style>
*{box-sizing:border-box}body,div{font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei","Noto Sans CJK SC",sans-serif;font-size:14px;line-height:1.6}
h1{font-size:26px;margin:.6em 0 .4em}h2{font-size:21px;margin:.6em 0 .4em}h3{font-size:17px}p{margin:.5em 0}
table{border-collapse:collapse;margin:.5em 0}td,th{border:1px solid #999;padding:4px 6px}img{max-width:100%}
pre,code{font-family:ui-monospace,Menlo,monospace;background:#f4f4f5}pre{padding:8px;white-space:pre-wrap}
</style>`
