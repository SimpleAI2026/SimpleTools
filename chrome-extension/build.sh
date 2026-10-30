#!/usr/bin/env bash
# Build SimpleTools as a Chrome MV3 extension (Load unpacked / zip).
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

# Ensure icons exist (regenerate from favicon if missing)
if [[ ! -f "$EXT/icons/icon-128.png" ]]; then
  if command -v rsvg-convert >/dev/null 2>&1; then
    mkdir -p "$EXT/icons"
    for s in 16 32 48 128; do
      rsvg-convert -w "$s" -h "$s" "$ROOT/public/favicon.svg" -o "$EXT/icons/icon-${s}.png"
    done
  else
    error "Missing icons and rsvg-convert not found. Install librsvg or add chrome-extension/icons/*.png"
    exit 1
  fi
fi

info "Building SPA for Chrome (base=./, hash router) → chrome-extension/dist"
VITE_TARGET=chrome VITE_ROUTER_MODE=hash VITE_ENABLE_PANDOC=false corepack yarn vite build

info "Copying manifest, background, icons into dist/"
cp "$EXT/manifest.json" "$EXT/background.js" "$EXT/dist/"
mkdir -p "$EXT/dist/icons"
cp "$EXT/icons/"*.png "$EXT/dist/icons/"

# Web-only download artifacts must not ship inside the extension package
rm -rf "$EXT/dist/downloads"
# Pandoc is web-only — never ship offline/pandoc (~56MB) in the Chrome package
rm -rf "$EXT/dist/offline/pandoc"

ZIP_PATH="$EXT/simpletools-chrome.zip"
info "Zipping → ${ZIP_PATH}"
rm -f "$ZIP_PATH"
(
  cd "$EXT/dist"
  zip -r -q "$ZIP_PATH" .
)

# Stable download for the web app header (public/downloads/)
DOWNLOADS="$ROOT/public/downloads"
mkdir -p "$DOWNLOADS"
cp "$ZIP_PATH" "$DOWNLOADS/simpletools-chrome.zip"
ok "Copied download: $DOWNLOADS/simpletools-chrome.zip"

ok "Chrome extension ready:"
ok "  Load unpacked: $EXT/dist"
ok "  Zip:           $ZIP_PATH ($(du -sh "$ZIP_PATH" | cut -f1))"
ok "  Web download:  $DOWNLOADS/simpletools-chrome.zip"
