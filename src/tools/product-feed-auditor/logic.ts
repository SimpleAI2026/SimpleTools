import { finish, num, presentResult, rowsOf, str, type Presented } from '@/lib/workflow/core'

export const SAMPLE = '{"rows":[{"id":"1","title":"Hat","price":"10","currency":"USD","gtin":"96385074","item_group_id":"g","ai_source":"human"},{"id":"1","title":"Hat","price":"10","currency":"EUR","gtin":"96385075","item_group_id":"g","ai_source":"model"}]}'

export function gtinCheck(raw: string): { ok: boolean; kind: string } {
  const digits = raw.replace(/[\s-]/g, '')
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(digits)) return { ok: false, kind: 'format' }
  const body = digits.slice(0, -1).split('').map(Number).reverse()
  const sum = body.reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0)
  const check = (10 - (sum % 10)) % 10
  return { ok: check === Number(digits.at(-1)), kind: `GTIN-${digits.length}` }
}

export function run(input: string) {
  const { rows } = rowsOf(input, 'product-feed-auditor', ['rows', 'items'])
  if (rows.length === 0) throw new Error('empty')
  const aiColumns = [...new Set(rows.flatMap((row) => Object.keys(row).filter((key) => key.toLowerCase().startsWith('ai'))))]
  const ids = new Map<string, number>()
  const issues = rows.flatMap((row, index) => {
    const id = str(row.id)
    const found: { row: number; id: string; code: string; detail: string }[] = []
    ids.set(id, (ids.get(id) ?? 0) + 1)
    if (!id.trim()) found.push({ row: index + 2, id, code: 'missing', detail: 'id' })
    if (ids.get(id)! > 1) found.push({ row: index + 2, id, code: 'duplicate-id', detail: id })
    for (const field of ['title', 'price', 'currency']) {
      if (!str(row[field]).trim()) found.push({ row: index + 2, id, code: 'missing', detail: field })
    }
    const price = num(row.price)
    if (str(row.price).trim() && (price == null || price < 0)) found.push({ row: index + 2, id, code: 'invalid-price', detail: str(row.price) })
    const currency = str(row.currency).trim()
    if (currency && !/^[A-Za-z]{3}$/.test(currency)) found.push({ row: index + 2, id, code: 'invalid-currency', detail: currency })
    if (str(row.gtin)) {
      const check = gtinCheck(str(row.gtin))
      if (!check.ok) found.push({ row: index + 2, id, code: 'gtin', detail: check.kind })
    }
    return found
  })
  const groups = new Map<string, Set<string>>()
  for (const row of rows) {
    const group = str(row.item_group_id)
    if (!group) continue
    const currencies = groups.get(group) ?? new Set<string>()
    if (str(row.currency)) currencies.add(str(row.currency).toUpperCase())
    groups.set(group, currencies)
  }
  for (const [group, currencies] of groups) {
    if (currencies.size > 1) issues.push({ row: 0, id: group, code: 'variant-currency', detail: [...currencies].join('|') })
  }
  return finish(
    'product-feed-auditor',
    { rows },
    'Remote images, stock, and GS1 allocation are not checked. AI source columns are kept.',
    { products: rows.length, ai_columns: aiColumns, issues },
    ['row', 'id', 'code', 'detail', 'ai_columns'],
    issues.map((issue) => [issue.row || '', issue.id, issue.code, issue.detail, aiColumns.join('|')]),
  )
}

export function present(input: string): Presented {
  return presentResult(run, input)
}
