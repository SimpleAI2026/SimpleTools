import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const files = ['package.json', 'chrome-extension/manifest.json', 'vscode-extension/package.json', 'vscode-extension/package-lock.json']

export function nextPatch(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) throw new Error(`Expected a three-part version, got ${version}`)
  return `${Number(match[1])}.${Number(match[2])}.${Number(match[3]) + 1}`
}

export function bumpVersions() {
  const documents = files.map((file) => ({ file, value: JSON.parse(readFileSync(resolve(root, file), 'utf8')) }))
  const versions = new Set(documents.map(({ value }) => value.version))
  if (versions.size !== 1) throw new Error(`Version files are out of sync: ${[...versions].join(', ')}`)
  const current = documents[0].value.version
  const next = nextPatch(current)
  for (const { file, value } of documents) {
    value.version = next
    if (file.endsWith('package-lock.json')) value.packages[''].version = next
    writeFileSync(resolve(root, file), `${JSON.stringify(value, null, 2)}\n`)
  }
  console.log(`Version ${current} → ${next}`)
  return next
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) bumpVersions()
