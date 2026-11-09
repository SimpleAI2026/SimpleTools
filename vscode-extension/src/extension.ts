import * as fs from 'node:fs'
import * as path from 'node:path'
import * as vscode from 'vscode'

const VIEW_TYPE = 'simpletools.panel'

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('simpletools.open', () => {
      const panel = vscode.window.createWebviewPanel(VIEW_TYPE, 'SimpleTools', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
      })
      panel.webview.html = getWebviewHtml(panel.webview, context.extensionUri)
    }),
  )
}

export function deactivate(): void {}

/**
 * Load the Vite-built SPA and rewrite asset URLs for the webview CSP origin.
 * Hash router (VITE_ROUTER_MODE=hash) is required inside webviews.
 */
function getWebviewHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const mediaFs = path.join(extensionUri.fsPath, 'media')
  const indexPath = path.join(mediaFs, 'index.html')
  if (!fs.existsSync(indexPath)) {
    return `<!DOCTYPE html><html><body><p>SimpleTools media/ missing. Run <code>./build.sh vscode</code> first.</p></body></html>`
  }

  const mediaRoot = vscode.Uri.joinPath(extensionUri, 'media')
  const baseHref = webview.asWebviewUri(mediaRoot).toString().replace(/\/?$/, '/')

  let html = fs.readFileSync(indexPath, 'utf8')

  // Prefer a <base> so relative ./assets and public paths resolve under asWebviewUri.
  if (/<base\s/i.test(html)) {
    html = html.replace(/<base\s[^>]*>/i, `<base href="${baseHref}">`)
  } else {
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`)
  }

  // Rewrite any remaining absolute root paths that slipped past Vite base.
  html = html.replace(/(href|src)="\/(?!\/)([^"]+)"/g, (_m, attr: string, rel: string) => {
    const uri = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, rel))
    return `${attr}="${uri}"`
  })

  const csp = [
    `default-src 'none'`,
    `style-src ${webview.cspSource} 'unsafe-inline'`,
    `script-src ${webview.cspSource} 'wasm-unsafe-eval'`,
    `img-src ${webview.cspSource} data: blob:`,
    `font-src ${webview.cspSource} data:`,
    `worker-src ${webview.cspSource} blob:`,
    `connect-src ${webview.cspSource} blob: data:`,
    `media-src ${webview.cspSource} blob: data:`,
    `frame-src 'none'`,
  ].join('; ')

  if (/http-equiv=["']Content-Security-Policy["']/i.test(html)) {
    html = html.replace(
      /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i,
      `<meta http-equiv="Content-Security-Policy" content="${csp}">`,
    )
  } else {
    html = html.replace(/<head([^>]*)>/i, `<head$1><meta http-equiv="Content-Security-Policy" content="${csp}">`)
  }

  return html
}
