/** Base URL for vendored offline WASM / OCR assets under public/offline/. */
export function offlineUrl(...parts: string[]): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  const rel = `${base}offline/${parts.map((p) => p.replace(/^\/+|\/+$/g, '')).join('/')}`
  // Workers and some WASM loaders need an absolute http(s) URL.
  if (typeof location !== 'undefined') return new URL(rel, location.href).href
  return rel
}
