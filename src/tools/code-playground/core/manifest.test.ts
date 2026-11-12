import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import manifest from './runtime-manifest.json'
import javaLock from './java-lock.json'
import rustLock from './rust-lock.json'
import { languageAssetIds, languageSize, type Asset, type Manifest } from './manifest'

const codeManifest = manifest as Manifest
const assets = manifest.assets as Record<string, Asset>

describe('code playground website assets', () => {
  it('registers every SimpleCode runtime and resolves all referenced assets', () => {
    expect(codeManifest.languages.map((lang) => lang.id)).toEqual([
      'python', 'ruby', 'quickjs', 'sqlite', 'clang', 'clangpp', 'php-cgi',
      'lua', 'go', 'shell', 'rust', 'java', 'linux', 'numpy',
    ])
    expect(Object.keys(assets)).toHaveLength(26)
    expect(Object.keys(javaLock.files).sort()).toEqual(['compile-classlib-teavm.bin', 'compiler.wasm', 'compiler.wasm-runtime.js', 'runtime-classlib-teavm.bin'])
    expect(Object.keys(rustLock.unpacked).sort()).toEqual(['rustc.wasm', 'sysroot-wasip1.bundle'])
    for (const lang of codeManifest.languages) {
      if (lang.id === 'java' || lang.id === 'rust') continue
      for (const id of languageAssetIds(lang)) expect(assets[id], `${lang.id} ${id}`).toBeDefined()
      expect(languageSize(codeManifest, lang)).toBeGreaterThan(0)
    }
  })

  it('keeps integrity pins for every website resource, including large runtimes', () => {
    for (const [id, asset] of Object.entries(assets)) {
      expect(asset.size, id).toBeGreaterThan(0)
      expect(asset.sha256, id).toMatch(/^[a-f0-9]{64}$/)
    }
    for (const file of [...Object.values(javaLock.files), ...Object.values(rustLock.unpacked)]) {
      expect(file.bytes).toBeGreaterThan(0)
      expect(file.sha256).toMatch(/^[a-f0-9]{64}$/)
      expect(file.sameOrigin).toMatch(/^offline\/code\//)
    }
  })

  it('publishes the committed catalog without reading ../SimpleCode', () => {
    const root = fileURLToPath(new URL('../../../../', import.meta.url))
    const output = execFileSync(process.execPath, ['scripts/code-playground-assets.mjs'], {
      cwd: root,
      encoding: 'utf8',
    })
    expect(output).toMatch(/committed runtime catalog|Verified/)
    expect(output).not.toMatch(/SimpleCode\/wasm/)
    const published = JSON.parse(readFileSync(new URL('../../../../public/offline/code/runtime-manifest.json', import.meta.url), 'utf8')) as Manifest
    expect(published.languages.map((lang) => lang.id)).toEqual(codeManifest.languages.map((lang) => lang.id))
    expect(Object.keys(published.assets)).toEqual(Object.keys(assets))
  })
})
