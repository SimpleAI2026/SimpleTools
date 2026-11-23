import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf8')
const readmeEn = readFileSync(new URL('../../README_EN.md', import.meta.url), 'utf8')
const contributing = readFileSync(new URL('../../CONTRIBUTING.md', import.meta.url), 'utf8')

const site = 'https://simpletools-kappa.vercel.app/'
const store = 'https://chromewebstore.google.com/detail/simpletools/fkokpmlmjopflpadegcjnhbelolaihgl'
const source = 'https://github.com/SimpleAI2026/SimpleTools'

describe('public entry documents', () => {
  it('opens both READMEs with the live site, the store, and the source', () => {
    for (const text of [readme, readmeEn]) {
      const head = text.slice(0, 1200)
      expect(head).toContain(site)
      expect(head).toContain(store)
      expect(head).toContain(source)
      expect(head).toContain('./docs/screenshots/1.png')
      expect(text).not.toContain('私有仓库')
      expect(text.toLowerCase()).not.toContain('private repository')
      expect(text).not.toMatch(/never leaves|从不离开|从不联网|does not connect to the network/i)
      expect(text).toContain('All rights reserved')
      expect(text).toContain('code-playground-assets.mjs --sync')
      expect(text).toContain('../SimpleCode')
      expect(text).toContain('./build.sh build')
      expect(text).toContain('./build.sh preview')
      expect(text.toLowerCase()).not.toContain('mit license')
      expect(text).not.toMatch(/Permission is hereby granted|Apache License|GNU General Public/)
    }
    expect(readme).toContain('不授予')
    expect(readmeEn.toLowerCase()).toContain('do not grant')
  })

  it('asks for reproducible reports and does not license contributions or promise merges', () => {
    expect(contributing).toContain(source)
    expect(contributing).toContain('不构成')
    expect(contributing).toContain('不承诺')
    expect(contributing.toLowerCase()).toContain('does not grant')
    expect(contributing.toLowerCase()).toContain('does not promise')
    expect(contributing.toLowerCase()).not.toContain('mit license')
    expect(contributing.toLowerCase()).not.toContain('by submitting a pull request')
  })
})
