#!/usr/bin/env node
/**
 * Expand tool messages using clients5.google.com dict-chrome-ex endpoint.
 * Cache: scripts/_gtx-cache.json
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  NEW_LOCALES,
  ALL_LOCALES,
  uniqueStrings,
  protect,
  restore,
  applyMap,
  serialize,
  GTX,
} from './i18n-translate-lib.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOOLS = join(ROOT, 'src/tools')
const CACHE_PATH = join(ROOT, 'scripts/_gtx-cache.json')

function loadMessages(code) {
  return Function(`return (${code.replace(/^export default\s*/, '').replace(/;?\s*$/, '')})`)()
}
function loadCache() {
  if (!existsSync(CACHE_PATH)) return new Map()
  try { return new Map(JSON.parse(readFileSync(CACHE_PATH, 'utf8'))) } catch { return new Map() }
}
function saveCache(cache) {
  writeFileSync(CACHE_PATH, JSON.stringify([...cache.entries()]))
}

async function translateOne(text, tl) {
  const url =
    'https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=' +
    encodeURIComponent(tl) +
    '&q=' +
    encodeURIComponent(text)
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  // shapes: ["こんにちは世界"] or [["こんにちは世界","Hello world"]] etc.
  let translated = ''
  if (typeof data === 'string') translated = data
  else if (Array.isArray(data)) {
    if (typeof data[0] === 'string') translated = data[0]
    else if (Array.isArray(data[0])) translated = data.map((x) => (Array.isArray(x) ? x[0] : x)).join('')
  }
  if (!translated) throw new Error('empty:' + JSON.stringify(data).slice(0, 120))
  return translated
}

async function mapPool(items, concurrency, fn) {
  let i = 0
  async function worker() {
    while (true) {
      const idx = i++
      if (idx >= items.length) return
      await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()))
}

const tools = readdirSync(TOOLS).filter((d) => existsSync(join(TOOLS, d, 'messages.ts')))
const loaded = {}
for (const slug of tools) loaded[slug] = loadMessages(readFileSync(join(TOOLS, slug, 'messages.ts'), 'utf8'))
const uniq = [...new Set(Object.values(loaded).flatMap((m) => uniqueStrings(m.en)))]
console.log(`Tools: ${tools.length}; unique EN: ${uniq.length}`)

const cache = loadCache()
// drop failed identity fallbacks from prior 429 run (where translation == protected english for long phrases)
console.log(`Cache entries: ${cache.size}`)

const concurrency = 4
const delayMs = 80

for (const locale of NEW_LOCALES) {
  const missing = uniq.filter((en) => !cache.has(locale + '\0' + en))
  console.log(`Locale ${locale}: ${missing.length} to translate`)
  let done = 0
  let fails = 0
  await mapPool(missing, concurrency, async (en) => {
    const key = locale + '\0' + en
    if (en === 'SimpleTools') {
      cache.set(key, en)
    } else {
      const { out, slots } = protect(en)
      let translated = out
      if (out.trim() && !/^[\d\s./\-_|:+*%#@&=?,;!()[\]{}<>\\]+$/.test(out)) {
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            translated = await translateOne(out, GTX[locale])
            break
          } catch {
            await new Promise((r) => setTimeout(r, 600 * (attempt + 1)))
            if (attempt === 4) {
              fails++
              translated = out
            }
          }
        }
      }
      cache.set(key, restore(translated, slots))
    }
    done++
    await new Promise((r) => setTimeout(r, delayMs))
    if (done % 25 === 0 || done === missing.length) {
      process.stdout.write(`\r  ${locale} ${done}/${missing.length} fails=${fails}   `)
      saveCache(cache)
    }
  })
  process.stdout.write('\n')
  saveCache(cache)
}

function mapFor(locale) {
  const m = new Map()
  for (const en of uniq) m.set(en, cache.get(locale + '\0' + en) ?? en)
  return m
}
const maps = Object.fromEntries(NEW_LOCALES.map((l) => [l, mapFor(l)]))
for (const slug of tools) {
  const raw = loaded[slug]
  const en = raw.en
  const zh = raw.zh ?? raw['zh-CN']
  const ordered = { 'zh-CN': zh, en }
  for (const loc of NEW_LOCALES) ordered[loc] = applyMap(en, maps[loc])
  const final = {}
  for (const loc of ALL_LOCALES) final[loc] = ordered[loc]
  writeFileSync(join(TOOLS, slug, 'messages.ts'), `export default ${serialize(final)}\n`)
}
console.log('Wrote', tools.length, 'message files')
