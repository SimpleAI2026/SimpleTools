export const CURSOR_GROUPS: Record<string, string[]> = {
  general: ['auto', 'default', 'none'],
  links: ['context-menu', 'help', 'pointer', 'progress', 'wait'],
  selection: ['cell', 'crosshair', 'text', 'vertical-text'],
  dragdrop: ['alias', 'copy', 'move', 'no-drop', 'not-allowed', 'grab', 'grabbing'],
  resize: ['all-scroll', 'col-resize', 'row-resize', 'n-resize', 'e-resize', 's-resize', 'w-resize', 'ne-resize', 'nw-resize', 'se-resize', 'sw-resize', 'ew-resize', 'ns-resize', 'nesw-resize', 'nwse-resize'],
  zoom: ['zoom-in', 'zoom-out'],
}
export const ALL_CURSORS = Object.values(CURSOR_GROUPS).flat()

/** Build a `cursor` declaration, optionally with a custom image URL and hotspot. */
export function cursorCss(fallback: string, image?: { url: string; x?: number; y?: number }): string {
  if (!image?.url) return `cursor: ${fallback};`
  const hs = image.x !== undefined && image.y !== undefined ? ` ${Math.round(image.x)} ${Math.round(image.y)}` : ''
  return `cursor: url("${image.url}")${hs}, ${fallback};`
}
