/** Shared GTX helpers with concurrency + placeholder protection. */
export const NEW_LOCALES = ['ja', 'ko', 'de', 'fr', 'es', 'pt-BR']
export const ALL_LOCALES = ['zh-CN', 'en', ...NEW_LOCALES]
export const GTX = { ja: 'ja', ko: 'ko', de: 'de', fr: 'fr', es: 'es', 'pt-BR': 'pt' }

export function protect(s) {
  const slots = []
  const out = s
    .replace(/\{'[^']*'\}/g, (m) => {
      slots.push(m)
      return `⟦${slots.length - 1}⟧`
    })
    .replace(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g, (m) => {
      slots.push(m)
      return `⟦${slots.length - 1}⟧`
    })
  return { out, slots }
}
export function restore(s, slots) {
  return s.replace(/⟦(\d+)⟧/g, (_, i) => slots[Number(i)] ?? _)
}

export function serialize(obj, indent = 0) {
  const pad = '  '.repeat(indent)
  const pad1 = '  '.repeat(indent + 1)
  if (typeof obj === 'string') return JSON.stringify(obj)
  if (Array.isArray(obj)) {
    if (!obj.length) return '[]'
    return '[\n' + obj.map((v) => pad1 + serialize(v, indent + 1)).join(',\n') + '\n' + pad + ']'
  }
  if (obj && typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (!keys.length) return '{}'
    return (
      '{\n' +
      keys
        .map((k) => {
          const key = /^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)
          return `${pad1}${key}: ${serialize(obj[k], indent + 1)}`
        })
        .join(',\n') +
      '\n' +
      pad +
      '}'
    )
  }
  return JSON.stringify(obj)
}

function flattenStrings(node, out = []) {
  if (typeof node === 'string') out.push(node)
  else if (Array.isArray(node)) node.forEach((v) => flattenStrings(v, out))
  else if (node && typeof node === 'object') Object.values(node).forEach((v) => flattenStrings(v, out))
  return out
}

export function uniqueStrings(node) {
  return [...new Set(flattenStrings(node))]
}

async function gtxOne(text, tl) {
  const url =
    'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' +
    encodeURIComponent(tl) +
    '&dt=t&q=' +
    encodeURIComponent(text)
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 SimpleTools-i18n' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const translated = (data?.[0] ?? []).map((x) => x?.[0] ?? '').join('')
  if (!translated) throw new Error('empty')
  return translated
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length)
  let i = 0
  async function worker() {
    while (true) {
      const idx = i++
      if (idx >= items.length) return
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
  return results
}

/** Build locale→(en→translated) map for a set of English strings. */
export async function buildTranslationMaps(englishStrings, locales = NEW_LOCALES, concurrency = 12) {
  const maps = Object.fromEntries(locales.map((l) => [l, new Map()]))
  const tasks = []
  for (const locale of locales) {
    for (const en of englishStrings) {
      tasks.push({ locale, en })
    }
  }
  let done = 0
  const total = tasks.length
  await mapPool(tasks, concurrency, async ({ locale, en }) => {
    if (en === 'SimpleTools') {
      maps[locale].set(en, en)
    } else {
      const { out, slots } = protect(en)
      let translated = out
      if (out.trim() && !/^[\d\s./\-_|:+*%#@&=?,;!()[\]{}<>\\]+$/.test(out)) {
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            translated = await gtxOne(out, GTX[locale])
            break
          } catch {
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)))
            if (attempt === 4) translated = out
          }
        }
      }
      maps[locale].set(en, restore(translated, slots))
    }
    done++
    if (done % 100 === 0 || done === total) process.stdout.write(`\r  translated ${done}/${total}`)
  })
  process.stdout.write('\n')
  return maps
}

export function applyMap(node, map) {
  if (typeof node === 'string') return map.get(node) ?? node
  if (Array.isArray(node)) return node.map((v) => applyMap(v, map))
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = applyMap(v, map)
    return out
  }
  return node
}
