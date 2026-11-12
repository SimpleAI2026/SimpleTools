export function parseOuiTable(text: string): Map<string, string> {
  const table = new Map<string, string>()
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const tab = line.indexOf('\t')
    if (tab < 6) continue
    table.set(line.slice(0, tab).toUpperCase(), line.slice(tab + 1).trim())
  }
  return table
}

export function lookupOui(mac: string, table: Map<string, string>): { prefix: string; vendor: string } | null {
  const hex = mac.replace(/[^0-9a-f]/gi, '').toUpperCase()
  if (hex.length < 6) return null
  const prefix = hex.slice(0, 6)
  const vendor = table.get(prefix)
  return vendor ? { prefix: prefix.match(/.{2}/g)?.join(':') ?? prefix, vendor } : null
}
