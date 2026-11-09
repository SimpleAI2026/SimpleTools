/** Combine user CSS and HTML into one fragment that is rendered inside an isolated container. */
export function composeFragment(html: string, css: string): string {
  return `${css.trim() ? `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>` : ''}${html}`
}

/** DOMPurify configuration: keep <style> (needed for layout), strip scripts/handlers. */
export const SANITIZE_CONFIG = { FORCE_BODY: true, ADD_TAGS: ['style'], FORBID_TAGS: ['script', 'iframe', 'object', 'embed'] }

export function clampDimension(v: number, min = 50, max = 4096): number {
  return Math.min(max, Math.max(min, Math.round(Number(v) || min)))
}
