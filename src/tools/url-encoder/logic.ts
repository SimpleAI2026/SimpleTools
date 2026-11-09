export type UrlMode = 'component' | 'uri'

export function encodeUrl(text: string, mode: UrlMode = 'component'): string {
  return mode === 'component' ? encodeURIComponent(text) : encodeURI(text)
}

/** Decode; `plusAsSpace` treats '+' as space (form encoding). Throws URIError on malformed input. */
export function decodeUrl(text: string, mode: UrlMode = 'component', plusAsSpace = false): string {
  const s = plusAsSpace ? text.replace(/\+/g, ' ') : text
  return mode === 'component' ? decodeURIComponent(s) : decodeURI(s)
}
