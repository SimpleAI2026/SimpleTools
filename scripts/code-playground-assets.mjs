#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const source = fileURLToPath(new URL('../../SimpleCode', import.meta.url))
const target = join(root, 'public/offline/code')
const sync = process.argv.includes('--sync')
const manifestPath = join(target, 'manifest.json')
const javaLockPath = join(root, 'src/tools/code-playground/core/java-lock.json')
const rustLockPath = join(root, 'src/tools/code-playground/core/rust-lock.json')
const javaFiles = ['compiler.wasm', 'compiler.wasm-runtime.js', 'compile-classlib-teavm.bin', 'runtime-classlib-teavm.bin']
const rustFiles = ['rustc.wasm', 'sysroot-wasip1.bundle']
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')
const copy = (file) => {
  const targetPath = join(target, file)
  mkdirSync(dirname(targetPath), { recursive: true })
  copyFileSync(join(source, 'wasm', file), targetPath)
}

let languages
let assetSpecs
let sourceLock
if (sync) {
  const config = await import(pathToFileURL(join(source, 'scripts/languages.config.mjs')).href)
  languages = config.languages
  assetSpecs = config.assets
  sourceLock = JSON.parse(readFileSync(join(source, 'scripts/sources.lock.json'), 'utf8'))
} else {
  const current = JSON.parse(readFileSync(manifestPath, 'utf8'))
  languages = current.languages
  assetSpecs = Object.fromEntries(Object.entries(current.assets).map(([id, asset]) => [id, { file: asset.file, kind: asset.kind }]))
  sourceLock = {
    java: JSON.parse(readFileSync(javaLockPath, 'utf8')),
    rust: JSON.parse(readFileSync(rustLockPath, 'utf8')),
  }
}

const assets = {}
for (const [id, spec] of Object.entries(assetSpecs)) {
  if (sync) copy(spec.file)
  const targetPath = join(target, spec.file)
  if (!existsSync(targetPath)) throw new Error(`Missing code runtime asset: ${spec.file}`)
  const bytes = readFileSync(targetPath)
  const kind = spec.kind ?? (spec.file.endsWith('.wasm') ? 'wasm' : 'fs')
  assets[id] = { file: spec.file, size: bytes.byteLength, sha256: sha256(bytes), kind }
}

const javaLock = { files: {} }
for (const name of javaFiles) {
  const file = `java/${name}`
  if (sync) copy(file)
  const bytes = readFileSync(join(target, file))
  const pin = sourceLock.java.files[name]
  if (!pin || pin.bytes !== bytes.byteLength || pin.sha256 !== sha256(bytes)) throw new Error(`Java pin mismatch: ${name}`)
  javaLock.files[name] = { ...pin, bytes: bytes.byteLength, sha256: sha256(bytes), sameOrigin: `offline/code/${file}` }
}

const rustLock = { unpacked: {} }
for (const name of rustFiles) {
  const file = `rust/${name}`
  if (sync) copy(file)
  const bytes = readFileSync(join(target, file))
  const pin = sourceLock.rust.unpacked[name]
  if (!pin || pin.bytes !== bytes.byteLength || pin.sha256 !== sha256(bytes)) throw new Error(`Rust pin mismatch: ${name}`)
  rustLock.unpacked[name] = { bytes: bytes.byteLength, sha256: sha256(bytes), sameOrigin: `offline/code/${file}` }
}

if (languages.length !== 14) throw new Error(`Expected all 14 SimpleCode runtimes, got ${languages.length}`)
if (sync) {
  mkdirSync(target, { recursive: true })
  mkdirSync(dirname(javaLockPath), { recursive: true })
  writeFileSync(manifestPath, `${JSON.stringify({ version: 1, assets, languages }, null, 2)}\n`)
  writeFileSync(javaLockPath, `${JSON.stringify(javaLock, null, 2)}\n`)
  writeFileSync(rustLockPath, `${JSON.stringify(rustLock, null, 2)}\n`)
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (JSON.stringify(manifest.languages) !== JSON.stringify(languages)) throw new Error('Runtime manifest mismatch')
  for (const [id, asset] of Object.entries(assets)) {
    const expected = manifest.assets[id]
    if (!expected || expected.size !== asset.size || expected.sha256 !== asset.sha256 || expected.kind !== asset.kind) {
      throw new Error(`Manifest mismatch: ${id}`)
    }
  }
}

const allowed = new Set([
  ...Object.values(assets).map((asset) => asset.file),
  ...javaFiles.map((name) => `java/${name}`),
  ...rustFiles.map((name) => `rust/${name}`),
])
for (const entry of readdirSync(target, { recursive: true })) {
  const name = entry.split('/').join('/')
  if (allowed.has(name) || name === 'manifest.json' || name.startsWith('licenses/') || ['THIRD_PARTY.md', 'TUTORIALS-LICENSE.txt', 'sources.yaml'].includes(name)) continue
  if (statSync(join(target, entry)).isDirectory()) continue
  throw new Error(`Non-whitelist code asset: ${name}`)
}

const total = [...Object.values(assets).map((asset) => asset.size), ...Object.values(javaLock.files).map((file) => file.bytes), ...Object.values(rustLock.unpacked).map((file) => file.bytes)].reduce((sum, size) => sum + size, 0)
console.log(`${sync ? 'Synced' : 'Verified'} ${Object.keys(assets).length + javaFiles.length + rustFiles.length} code runtime files (${(total / 1048576).toFixed(2)} MiB)`)
