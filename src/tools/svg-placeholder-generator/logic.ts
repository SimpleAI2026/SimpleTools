export interface PlaceholderOptions {
  width: number
  height: number
  background: string
  foreground: string
  text: string
}

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function safeColor(value: string, fallback: string): string {
  return HEX.test(value.trim()) ? value.trim() : fallback
}

export function clampSize(value: number): number {
  if (!Number.isFinite(value)) return 100
  return Math.min(4000, Math.max(1, Math.round(value)))
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char] ?? char)
}

export function placeholderSvg(options: PlaceholderOptions): { svg: string; dataUrl: string } {
  const width = clampSize(options.width)
  const height = clampSize(options.height)
  const background = safeColor(options.background, '#e5e7eb')
  const foreground = safeColor(options.foreground, '#111827')
  const label = options.text.trim() || `${width}×${height}`
  const size = Math.max(12, Math.round(Math.min(width, height) / 8))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label)}"><rect width="100%" height="100%" fill="${background}"/><text x="50%" y="50%" fill="${foreground}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${size}" text-anchor="middle" dominant-baseline="middle">${escapeXml(label)}</text></svg>`
  return { svg, dataUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}` }
}
