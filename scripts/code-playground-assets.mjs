#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const target = join(root, 'public/offline/code')
const sync = process.argv.includes('--sync')
const manifestPath = join(target, 'runtime-manifest.json')
const snapshotPath = join(root, 'src/tools/code-playground/core/runtime-manifest.json')
const javaLockPath = join(root, 'src/tools/code-playground/core/java-lock.json')
const rustLockPath = join(root, 'src/tools/code-playground/core/rust-lock.json')
const javaFiles = ['compiler.wasm', 'compiler.wasm-runtime.js', 'compile-classlib-teavm.bin', 'runtime-classlib-teavm.bin']
const rustFiles = ['rustc.wasm', 'sysroot-wasip1.bundle']
const notices = new Set(['runtime-manifest.json', 'THIRD_PARTY.md', 'TUTORIALS-LICENSE.txt', 'sources.yaml'])
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function publish(manifest) {
  mkdirSync(target, { recursive: true })
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

function pinnedFiles(manifest) {
  return [
    ...Object.values(manifest.assets).map((asset) => asset.file),
    ...javaFiles.map((name) => `java/${name}`),
    ...rustFiles.map((name) => `rust/${name}`),
  ]
}

function assertWhitelist(manifest) {
  if (!existsSync(target)) return
  const allowed = new Set(pinnedFiles(manifest))
  for (const entry of readdirSync(target, { recursive: true })) {
    const name = String(entry).split('\\').join('/')
    if (allowed.has(name) || notices.has(name) || name.startsWith('licenses/')) continue
    if (statSync(join(target, entry)).isDirectory()) continue
    throw new Error(`Non-whitelist code asset: ${name}`)
  }
}

function verifyPresent(manifest, javaLock, rustLock) {
  const missing = []
  for (const [id, asset] of Object.entries(manifest.assets)) {
    const path = join(target, asset.file)
    if (!existsSync(path)) {
      missing.push(asset.file)
      continue
    }
    const bytes = readFileSync(path)
    if (bytes.byteLength !== asset.size || sha256(bytes) !== asset.sha256 || !asset.kind) {
      throw new Error(`Manifest mismatch: ${id}`)
    }
  }
  for (const name of javaFiles) {
    const file = `java/${name}`
    const path = join(target, file)
    if (!existsSync(path)) {
      missing.push(file)
      continue
    }
    const bytes = readFileSync(path)
    const pin = javaLock.files[name]
    if (!pin || pin.bytes !== bytes.byteLength || pin.sha256 !== sha256(bytes)) throw new Error(`Java pin mismatch: ${name}`)
  }
  for (const name of rustFiles) {
    const file = `rust/${name}`
    const path = join(target, file)
    if (!existsSync(path)) {
      missing.push(file)
      continue
    }
    const bytes = readFileSync(path)
    const pin = rustLock.unpacked[name]
    if (!pin || pin.bytes !== bytes.byteLength || pin.sha256 !== sha256(bytes)) throw new Error(`Rust pin mismatch: ${name}`)
  }
  return missing
}

if (sync) {
  const source = fileURLToPath(new URL('../../SimpleCode', import.meta.url))
  const copy = (file) => {
    const targetPath = join(target, file)
    mkdirSync(dirname(targetPath), { recursive: true })
    copyFileSync(join(source, 'wasm', file), targetPath)
  }
  const config = await import(pathToFileURL(join(source, 'scripts/languages.config.mjs')).href)
  const sourceLock = readJson(join(source, 'scripts/sources.lock.json'))
  const assets = {}
  for (const [id, spec] of Object.entries(config.assets)) {
    copy(spec.file)
    const bytes = readFileSync(join(target, spec.file))
    assets[id] = { file: spec.file, size: bytes.byteLength, sha256: sha256(bytes), kind: spec.kind ?? (spec.file.endsWith('.wasm') ? 'wasm' : 'fs') }
  }
  const javaLock = { files: {} }
  for (const name of javaFiles) {
    const file = `java/${name}`
    copy(file)
    const bytes = readFileSync(join(target, file))
    const pin = sourceLock.java.files[name]
    if (!pin || pin.bytes !== bytes.byteLength || pin.sha256 !== sha256(bytes)) throw new Error(`Java pin mismatch: ${name}`)
    javaLock.files[name] = { ...pin, bytes: bytes.byteLength, sha256: sha256(bytes), sameOrigin: `offline/code/${file}` }
  }
  const rustLock = { unpacked: {} }
  for (const name of rustFiles) {
    const file = `rust/${name}`
    copy(file)
    const bytes = readFileSync(join(target, file))
    const pin = sourceLock.rust.unpacked[name]
    if (!pin || pin.bytes !== bytes.byteLength || pin.sha256 !== sha256(bytes)) throw new Error(`Rust pin mismatch: ${name}`)
    rustLock.unpacked[name] = { bytes: bytes.byteLength, sha256: sha256(bytes), sameOrigin: `offline/code/${file}` }
  }
  if (config.languages.length !== 14) throw new Error(`Expected all 14 SimpleCode runtimes, got ${config.languages.length}`)
  const manifest = { version: 1, assets, languages: config.languages }
  publish(manifest)
  writeFileSync(snapshotPath, `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(javaLockPath, `${JSON.stringify(javaLock, null, 2)}\n`)
  writeFileSync(rustLockPath, `${JSON.stringify(rustLock, null, 2)}\n`)
  assertWhitelist(manifest)
  const total = [...Object.values(assets), ...Object.values(javaLock.files), ...Object.values(rustLock.unpacked)].reduce((sum, file) => sum + (file.size ?? file.bytes), 0)
  console.log(`Synced ${Object.keys(assets).length + javaFiles.length + rustFiles.length} code runtime files (${(total / 1048576).toFixed(2)} MiB)`)
} else {
  const manifest = readJson(snapshotPath)
  const javaLock = readJson(javaLockPath)
  const rustLock = readJson(rustLockPath)
  if (!Array.isArray(manifest.languages) || manifest.languages.length !== 14) {
    throw new Error(`Expected all 14 SimpleCode runtimes, got ${manifest.languages?.length ?? 0}`)
  }
  if (Object.keys(manifest.assets).length !== 26) throw new Error(`Expected 26 catalog assets, got ${Object.keys(manifest.assets).length}`)
  publish(manifest)
  const missing = verifyPresent(manifest, javaLock, rustLock)
  assertWhitelist(manifest)
  const listed = Object.keys(manifest.assets).length + javaFiles.length + rustFiles.length
  if (missing.length) {
    console.log(`Published the committed runtime catalog (${listed} files listed). ${missing.length} binaries are absent from public/offline/code; this build did not read ../SimpleCode.`)
  } else {
    const total = [...Object.values(manifest.assets), ...Object.values(javaLock.files), ...Object.values(rustLock.unpacked)].reduce((sum, file) => sum + (file.size ?? file.bytes), 0)
    console.log(`Verified ${listed} code runtime files (${(total / 1048576).toFixed(2)} MiB)`)
  }
}
