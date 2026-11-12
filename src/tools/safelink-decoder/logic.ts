const HOST = /(^|\.)safelinks\.protection\.outlook\.com$/i

export interface DecodedLink {
  input: string
  url: string
  changed: boolean
}

function unwrapOnce(value: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return null
  }
  if (!HOST.test(parsed.hostname)) return null
  const nested = parsed.searchParams.get('url')
  return nested && nested !== value ? nested : null
}

export function decodeSafelink(input: string): DecodedLink {
  let current = input.trim()
  let changed = false
  for (let i = 0; i < 5; i++) {
    const next = unwrapOnce(current)
    if (!next || next === current) break
    current = next
    changed = true
  }
  return { input: input.trim(), url: current, changed }
}

export function decodeSafelinks(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => (line.trim() ? decodeSafelink(line).url : line))
    .join('\n')
}
