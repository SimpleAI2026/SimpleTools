import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { coiReloadDecision, coiUrls } from './coi'

describe('code playground cross-origin isolation', () => {
  it('builds scoped worker URLs for root, subdirectory, and relative bases', () => {
    expect(coiUrls('/', 'http://localhost:4173/')).toEqual({ script: 'http://localhost:4173/code-coi-serviceworker.js', scope: 'http://localhost:4173/' })
    expect(coiUrls('/tools', 'http://localhost:4173/tools/index.html')).toEqual({ script: 'http://localhost:4173/tools/code-coi-serviceworker.js', scope: 'http://localhost:4173/tools/' })
    expect(coiUrls('./', 'http://localhost:4173/app/index.html').scope).toBe('http://localhost:4173/app/')
  })

  it('reloads at most once and never loops', () => {
    const ready = { isolated: false, canRegister: true, activated: true, alreadyReloaded: false }
    expect(coiReloadDecision({ ...ready, isolated: true })).toBe('use-page')
    expect(coiReloadDecision(ready)).toBe('reload')
    expect(coiReloadDecision({ ...ready, alreadyReloaded: true })).toBe('show-error')
    expect(coiReloadDecision({ ...ready, canRegister: false })).toBe('show-error')
  })

  it('uses a local worker that sets require-corp without remote scripts', () => {
    const source = readFileSync(new URL('../../../../public/code-coi-serviceworker.js', import.meta.url), 'utf8')
    expect(source).toContain('Cross-Origin-Embedder-Policy", "require-corp"')
    expect(source).toContain('Cross-Origin-Opener-Policy", "same-origin"')
    expect(source).not.toMatch(/https?:\/\//)
    expect(source).not.toContain('credentialless')
  })
})
