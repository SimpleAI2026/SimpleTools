#!/usr/bin/env bash
# Rebuild the committed anydoc browser WASM. Normal `yarn build` does not run this.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
crate="$root/vendor/anydoc/wasm"
out="$root/public/offline/anydoc"
pack="${WASM_PACK:-wasm-pack}"

if [[ ! -f "$crate/Cargo.toml" ]]; then
  echo "missing $crate (git submodule vendor/anydoc)" >&2
  exit 1
fi
if ! command -v rustc >/dev/null 2>&1; then
  echo "rustc is required to rebuild anydoc WASM" >&2
  exit 1
fi
if ! rustup target list --installed | grep -qx 'wasm32-unknown-unknown'; then
  echo "rustup target wasm32-unknown-unknown is not installed" >&2
  exit 1
fi
if ! command -v "$pack" >/dev/null 2>&1; then
  echo "wasm-pack is required (tried: $pack)" >&2
  exit 1
fi

"$pack" build "$crate" --release --target web --scope firecrawl

pkg="$crate/pkg"
mkdir -p "$out"
for name in anydoc_wasm_bg.wasm anydoc_wasm.js anydoc_wasm.d.ts; do
  if [[ ! -f "$pkg/$name" ]]; then
    echo "wasm-pack did not produce $pkg/$name" >&2
    exit 1
  fi
  cp "$pkg/$name" "$out/$name"
done

(
  cd "$out"
  sha256sum anydoc_wasm_bg.wasm anydoc_wasm.js anydoc_wasm.d.ts > SHA256SUMS
  sha256sum -c SHA256SUMS
)

echo "wrote $out"
