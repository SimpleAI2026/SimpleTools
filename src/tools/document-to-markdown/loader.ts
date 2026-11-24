import { anydocAssetUrls } from './logic'

/**
 * Resolve the committed anydoc assets against the page URL.
 * Call this on the main thread (or pass `pageHref` explicitly). Inside a module
 * Worker, `location.href` is the worker script, and a relative `BASE_URL` would
 * resolve under `assets/` instead of the extension or site root.
 */
export function loadAnydocUrls(pageHref?: string): { jsUrl: string; wasmUrl: string } {
  const href = pageHref ?? globalThis.location?.href
  if (!href) throw new Error('anydoc asset URLs need the page URL')
  const base = import.meta.env.BASE_URL || '/'
  return anydocAssetUrls(base, href)
}
