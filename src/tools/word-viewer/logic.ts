/** Build a table of contents from h1–h3 in mammoth HTML (ids are added so the outline can scroll to them). */
export function addHeadingIds(html: string): { html: string; toc: { id: string; level: number; text: string }[] } {
  const toc: { id: string; level: number; text: string }[] = []
  let n = 0
  const out = html.replace(/<h([1-3])>([\s\S]*?)<\/h\1>/g, (_m, lv: string, inner: string) => {
    const id = `doc-h-${++n}`
    toc.push({ id, level: Number(lv), text: inner.replace(/<[^>]+>/g, '').trim() })
    return `<h${lv} id="${id}">${inner}</h${lv}>`
  })
  return { html: out, toc }
}

export function countWords(text: string): number {
  return text.match(/[\u4e00-\u9fff]|[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0
}
