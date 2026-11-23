import { describe, expect, it } from 'vitest'
import { CHROME_WEB_STORE_URL, GITHUB_REPO_URL, appHost, handheldChrome, showExtensionInstall } from './install-entry'

describe('install entry targets', () => {
  it('points the store and the repository at the public listings', () => {
    expect(CHROME_WEB_STORE_URL).toBe('https://chromewebstore.google.com/detail/simpletools/fkokpmlmjopflpadegcjnhbelolaihgl')
    expect(GITHUB_REPO_URL).toBe('https://github.com/SimpleAI2026/SimpleTools')
    expect(GITHUB_REPO_URL).not.toContain('api.github.com')
  })

  it('offers extension install on the website and hides it inside Chrome and VS Code', () => {
    expect(appHost(undefined)).toBe('web')
    expect(appHost('')).toBe('web')
    expect(appHost('preview')).toBe('web')
    expect(showExtensionInstall('web')).toBe(true)
    expect(appHost('chrome')).toBe('chrome')
    expect(showExtensionInstall('chrome')).toBe(false)
    expect(appHost('vscode')).toBe('vscode')
    expect(showExtensionInstall('vscode')).toBe(false)
  })

  it('treats only a narrow coarse pointer as a handheld device', () => {
    expect(handheldChrome(true, true)).toBe(true)
    expect(handheldChrome(true, false)).toBe(false)
    expect(handheldChrome(false, true)).toBe(false)
    expect(handheldChrome(false, false)).toBe(false)
  })
})
