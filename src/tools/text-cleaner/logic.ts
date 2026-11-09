export interface CleanOptions {
  trimLines: boolean
  collapseSpaces: boolean
  removeEmptyLines: boolean
  collapseEmptyLines: boolean
  removeLineBreaks: boolean
  smartQuotes: boolean
  removeInvisible: boolean
  fullwidthToHalfwidth: boolean
  stripHtml: boolean
  tabsToSpaces: boolean
}

export const DEFAULT_CLEAN: CleanOptions = {
  trimLines: true,
  collapseSpaces: true,
  removeEmptyLines: false,
  collapseEmptyLines: true,
  removeLineBreaks: false,
  smartQuotes: false,
  removeInvisible: true,
  fullwidthToHalfwidth: false,
  stripHtml: false,
  tabsToSpaces: false,
}

export function cleanText(text: string, o: CleanOptions): string {
  let s = text.replace(/\r\n?/g, '\n')
  if (o.stripHtml) s = s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, '')
  if (o.removeInvisible) s = s.replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, '').replace(/\u00A0/g, ' ')
  if (o.fullwidthToHalfwidth) s = s.replace(/[\uFF01-\uFF5E]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, ' ')
  if (o.smartQuotes) s = s.replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...')
  if (o.tabsToSpaces) s = s.replace(/\t/g, '  ')
  let lines = s.split('\n')
  if (o.collapseSpaces) lines = lines.map((l) => l.replace(/[ \t]{2,}/g, ' '))
  if (o.trimLines) lines = lines.map((l) => l.trim())
  if (o.removeEmptyLines) lines = lines.filter((l) => l.trim() !== '')
  else if (o.collapseEmptyLines) lines = lines.filter((l, i, arr) => !(l.trim() === '' && i > 0 && (arr[i - 1] ?? '').trim() === ''))
  s = lines.join('\n')
  if (o.removeLineBreaks) s = s.split('\n').filter((l) => l.trim()).join(' ')
  return s.trim()
}
