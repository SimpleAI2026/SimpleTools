export interface SizeReport {
  chars: number
  utf8: number
  utf16: number
  utf32: number
  latin1: number | null
  base64: number
  urlEncoded: number
  lines: number
}

export function measureText(text: string): SizeReport {
  const cps = Array.from(text)
  const utf8 = new TextEncoder().encode(text).length
  const latin1 = cps.every((c) => (c.codePointAt(0) ?? 0) <= 0xff) ? cps.length : null
  return {
    chars: cps.length,
    utf8,
    utf16: text.length * 2,
    utf32: cps.length * 4,
    latin1,
    base64: Math.ceil(utf8 / 3) * 4,
    urlEncoded: encodeURIComponent(text).length,
    lines: text === '' ? 0 : text.split(/\r\n|\r|\n/).length,
  }
}

/** Fits-in check for common limits (e.g. tweet 280 chars, SMS 160 GSM / 70 UCS-2). */
export function smsSegments(text: string): { encoding: 'GSM-7' | 'UCS-2'; segments: number } {
  const gsm = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/.test(text)
  const len = gsm ? text.length + (text.match(/[\^{}\\[~\]|€]/g)?.length ?? 0) : Array.from(text).reduce((n, c) => n + (c.length === 2 ? 2 : 1), 0)
  const [single, multi] = gsm ? [160, 153] : [70, 67]
  return { encoding: gsm ? 'GSM-7' : 'UCS-2', segments: len === 0 ? 0 : len <= single ? 1 : Math.ceil(len / multi) }
}
