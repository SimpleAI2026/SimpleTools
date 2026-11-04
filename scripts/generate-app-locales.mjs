#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { NEW_LOCALES, uniqueStrings, buildTranslationMaps, applyMap, serialize } from './i18n-translate-lib.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const code = readFileSync(join(ROOT, 'src/i18n/locales/en.ts'), 'utf8')
  .replace(/^import[\s\S]*?\n\n/, '')
  .replace(/^const en:\s*MessageSchema\s*=\s*/, '')
  .replace(/\nexport default en\s*$/, '')
const en = Function(`return (${code})`)()

console.log('Unique EN strings in app locales:', uniqueStrings(en).length)
const maps = await buildTranslationMaps(uniqueStrings(en), NEW_LOCALES, 16)
for (const locale of NEW_LOCALES) {
  const tree = applyMap(en, maps[locale])
  const varName = locale === 'pt-BR' ? 'ptBR' : locale
  const file = `${locale}.ts`
  const body =
    `import type { MessageSchema } from './zh-CN'\n\n` +
    `const ${varName}: MessageSchema = ${serialize(tree)}\n\n` +
    `export default ${varName}\n`
  writeFileSync(join(ROOT, 'src/i18n/locales', file), body)
  console.log('wrote', file)
}
