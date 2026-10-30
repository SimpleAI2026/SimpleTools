#!/usr/bin/env bash
# Build SimpleTools as a VS Code extension (.vsix).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ -t 1 ]]; then
  C_INFO=$'\033[36m'; C_OK=$'\033[32m'; C_ERR=$'\033[31m'; C_RST=$'\033[0m'
else
  C_INFO=''; C_OK=''; C_ERR=''; C_RST=''
fi
info() { printf '%s[info]%s %s\n' "$C_INFO" "$C_RST" "$*"; }
ok() { printf '%s[ok]%s %s\n' "$C_OK" "$C_RST" "$*"; }
error() { printf '%s[error]%s %s\n' "$C_ERR" "$C_RST" "$*" >&2; }

info "Building SPA for VS Code webview (base=./, hash router) → vscode-extension/media"
VITE_TARGET=vscode VITE_ROUTER_MODE=hash VITE_ENABLE_PANDOC=false corepack yarn vite build

info "Installing vscode-extension devDependencies (if needed)"
cd "$EXT"
if [[ ! -d node_modules ]] || [[ package.json -nt node_modules/.yarn-state.yml ]] 2>/dev/null || [[ ! -f node_modules/.package-lock.json && ! -d node_modules/typescript ]]; then
  # Prefer npm for the nested package to avoid Yarn 4 PnP friction with vsce
  npm install --no-fund --no-audit
fi

info "Compiling extension host → out/extension.js"
npx tsc -p ./

# Web-only download artifacts must not ship inside the extension package
rm -rf "$EXT/media/downloads"
# Pandoc is web-only — never ship offline/pandoc (~56MB) in the VS Code package
rm -rf "$EXT/media/offline/pandoc"

info "Packaging .vsix"
# vsce needs a clean package; --no-dependencies because runtime has none
npx vsce package --no-dependencies --allow-missing-repository --allow-package-secrets slack --allow-package-secrets privatekey

VSIX="$(ls -1t "$EXT"/simpletools-*.vsix 2>/dev/null | head -1 || true)"
if [[ -z "$VSIX" ]]; then
  error "No .vsix produced"
  exit 1
fi

# Stable download for the web app header (public/downloads/)
DOWNLOADS="$ROOT/public/downloads"
mkdir -p "$DOWNLOADS"
cp "$VSIX" "$DOWNLOADS/simpletools-vscode.vsix"
ok "Copied download: $DOWNLOADS/simpletools-vscode.vsix"

ok "VS Code extension ready:"
ok "  Install: code --install-extension $VSIX"
ok "  Or:      Extensions → … → Install from VSIX…"
ok "  Folder:  $EXT (media/ + out/)"
ok "  Artifact: $VSIX ($(du -sh "$VSIX" | cut -f1))"
ok "  Web download:  $DOWNLOADS/simpletools-vscode.vsix"
