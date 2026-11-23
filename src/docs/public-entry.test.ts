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
      expect(text).not.toMatch(/All rights reserved|未经许可|不授予|all rights reserved|do not grant|without permission/i)
      expect(text).not.toMatch(/public domain|公有领域|Open Source Initiative|OSI-approved|open-source license|开源许可/i)
      expect(text).toContain('code-playground-assets.mjs --sync')
      expect(text).toContain('../SimpleCode')
      expect(text).toContain('./build.sh build')
      expect(text).toContain('./build.sh preview')
      expect(text.toLowerCase()).not.toContain('mit license')
      expect(text).not.toMatch(/Permission is hereby granted|Apache License|GNU General Public/)
    }
    expect(readme).toContain('本项目允许自由分发。')
    expect(readmeEn).toContain('This project may be freely distributed.')
    expect(readme).toContain('不代替这些组件授予分发权')
    expect(readmeEn).toContain('does not grant distribution rights for those components')
  })

  it('keeps feedback steps and the same distribution sentence in both languages', () => {
    expect(contributing).toContain(source)
    expect(contributing).toContain('本项目允许自由分发。')
    expect(contributing).toContain('This project may be freely distributed.')
    expect(contributing).toContain('操作步骤')
    expect(contributing.toLowerCase()).toContain('expected result')
    expect(contributing).not.toMatch(/All rights reserved|未经许可|不授予|CLA|contributor license agreement/i)
    expect(contributing.toLowerCase()).not.toContain('mit license')
    expect(contributing.toLowerCase()).not.toContain('by submitting a pull request')
  })
})
