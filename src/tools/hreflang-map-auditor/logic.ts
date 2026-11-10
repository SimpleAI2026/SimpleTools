import { finish, presentResult, rowsOf, str, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '{"rows":[{"url":"https://ex.com/en","lang":"en","alternates":["https://ex.com/en","https://ex.com/de"]},{"url":"https://ex.com/de","lang":"de","alternates":["https://ex.com/de"]},{"url":"https://ex.com/","lang":"x-default","alternates":["https://ex.com/"]}]}'

const LANG = /^(?:[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*|x-default)$/

function validUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol)
  } catch {
    return false
  }
}

export function run(input: string) {
  const { rows } = rowsOf(input, 'hreflang-map-auditor', ['rows', 'pages'])
  if (rows.length === 0) throw new Error('empty')
  const pages = rows.map((row) => ({
    url: str(row.url).trim(),
    lang: str(row.lang).trim(),
    alternates: Array.isArray(row.alternates) ? row.alternates.map(str).map((url) => url.trim()).filter(Boolean) : str(row.alternates).split(/[|｜]/).map((url) => url.trim()).filter(Boolean),
  }))
  const byUrl = new Map(pages.map((page) => [page.url, page]))
  const issues = pages.flatMap((page, index) => {
    const found: { row: number; url: string; code: string; detail: string }[] = []
    if (!validUrl(page.url)) found.push({ row: index + 2, url: page.url, code: 'invalid-url', detail: page.url })
    if (page.lang !== 'x-default' && !LANG.test(page.lang)) found.push({ row: index + 2, url: page.url, code: 'lang', detail: page.lang })
    if (!page.alternates.includes(page.url)) found.push({ row: index + 2, url: page.url, code: 'self', detail: page.url })
    for (const alternate of page.alternates) {
      if (!validUrl(alternate)) found.push({ row: index + 2, url: page.url, code: 'invalid-url', detail: alternate })
      if (alternate === page.url) continue
      const back = byUrl.get(alternate)
      if (!back || !back.alternates.includes(page.url)) found.push({ row: index + 2, url: page.url, code: 'return-link', detail: alternate })
    }
    return found
  })
  const seen = new Set<string>()
  for (const [index, page] of pages.entries()) {
    if (seen.has(page.url)) issues.push({ row: index + 2, url: page.url, code: 'duplicate-url', detail: page.url })
    seen.add(page.url)
  }
  return finish(
    'hreflang-map-auditor',
    { rows, language_rule: 'bcp47-subset-plus-x-default' },
    'x-default is not treated as a language. Return links are required. Deployment is not verified.',
    { pages: pages.length, issues },
    ['row', 'url', 'code', 'detail'],
    issues.map((issue) => [issue.row, issue.url, issue.code, issue.detail]),
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
