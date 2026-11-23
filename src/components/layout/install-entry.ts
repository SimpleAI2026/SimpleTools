export const CHROME_WEB_STORE_URL = 'https://chromewebstore.google.com/detail/simpletools/fkokpmlmjopflpadegcjnhbelolaihgl'

export const GITHUB_REPO_URL = 'https://github.com/SimpleAI2026/SimpleTools'

export type AppHost = 'web' | 'chrome' | 'vscode'

export function appHost(target: string | undefined): AppHost {
  if (target === 'chrome' || target === 'vscode') return target
  return 'web'
}

/** The website can offer an install. The Chrome and VS Code hosts already are the install. */
export function showExtensionInstall(host: AppHost): boolean {
  return host === 'web'
}

/**
 * Phones and tablets use a narrow layout and a coarse pointer.
 * A desktop window that is only narrow can still install the extension.
 */
export function handheldChrome(narrow: boolean, coarsePointer: boolean): boolean {
  return narrow && coarsePointer
}
