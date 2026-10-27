#!/usr/bin/env bash
# SimpleTools build entry point. Usage: ./build.sh <dev|build|preview|lint|test> [extra args]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MIN_NODE_MAJOR=20
LOCK_HASH_FILE="node_modules/.st-lock-hash"

if [[ -t 1 ]]; then
  C_INFO=$'\033[36m'; C_WARN=$'\033[33m'; C_ERR=$'\033[31m'; C_OK=$'\033[32m'; C_RST=$'\033[0m'
else
  C_INFO=''; C_WARN=''; C_ERR=''; C_OK=''; C_RST=''
fi
info() { printf '%s[info]%s %s\n' "$C_INFO" "$C_RST" "$*"; }
warn() { printf '%s[warn]%s %s\n' "$C_WARN" "$C_RST" "$*" >&2; }
error() { printf '%s[error]%s %s\n' "$C_ERR" "$C_RST" "$*" >&2; }
ok() { printf '%s[ok]%s %s\n' "$C_OK" "$C_RST" "$*"; }

usage() {
  cat <<USAGE
Usage: ./build.sh <command> [extra args]

Commands:
  dev       Start the Vite dev server (HOST, PORT env vars; default 127.0.0.1:5173)
  build     Type-check and build for production into dist/
  preview   Serve dist/ locally (builds first if dist/ is missing; HOST, PORT default 127.0.0.1:4173)
  lint      Run ESLint and vue-tsc type checking
  test      Run unit tests (Vitest)

Options:
  -h, --help  Show this help

Extra args are passed through to the underlying tool (vite / eslint / vitest).
Requires Node >= ${MIN_NODE_MAJOR} and Yarn 4 (via corepack).
USAGE
}

YARN=()
check_env() {
  if ! command -v node >/dev/null 2>&1; then
    error "Node.js not found. Install Node >= ${MIN_NODE_MAJOR} (e.g. via nvm or Homebrew)."
    exit 1
  fi
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if (( major < MIN_NODE_MAJOR )); then
    error "Node $(node -v) is too old; need >= ${MIN_NODE_MAJOR}."
    exit 1
  fi
  if command -v corepack >/dev/null 2>&1; then
    YARN=(corepack yarn)
  elif command -v yarn >/dev/null 2>&1; then
    YARN=(yarn)
  else
    error "Neither corepack nor yarn found. Run: npm i -g corepack && corepack enable"
    exit 1
  fi
  local yv
  if ! yv="$("${YARN[@]}" --version 2>/dev/null)"; then
    error "Failed to run yarn via '${YARN[*]}'."
    exit 1
  fi
  if [[ "${yv%%.*}" -lt 4 ]]; then
    error "Yarn ${yv} detected; this project needs Yarn 4 (run: corepack enable)."
    exit 1
  fi
}

lock_hash() {
  cat package.json yarn.lock .yarnrc.yml 2>/dev/null | shasum -a 256 | cut -d' ' -f1
}

ensure_deps() {
  local current reason=""
  current="$(lock_hash)"
  if [[ ! -d node_modules ]]; then
    reason="node_modules missing"
  elif [[ ! -f "$LOCK_HASH_FILE" ]] || [[ "$(cat "$LOCK_HASH_FILE")" != "$current" ]]; then
    reason="package.json / yarn.lock changed"
  fi
  if [[ -z "$reason" ]]; then
    info "Dependencies up to date."
    return
  fi
  info "Installing dependencies (${reason})..."
  if [[ "${CI:-}" == "true" ]]; then
    "${YARN[@]}" install --immutable
  else
    "${YARN[@]}" install
  fi
  lock_hash >"$LOCK_HASH_FILE"
  ok "Dependencies installed."
}

cmd_dev() {
  exec "${YARN[@]}" vite --host "${HOST:-127.0.0.1}" --port "${PORT:-5173}" "$@"
}

cmd_build() {
  info "Type-checking..."
  "${YARN[@]}" vue-tsc -b
  info "Building..."
  "${YARN[@]}" vite build "$@"
  ok "Build finished: ${ROOT}/dist ($(du -sh dist | cut -f1))"
}

cmd_preview() {
  if [[ ! -f dist/index.html ]]; then
    warn "dist/ not found, building first."
    cmd_build
  fi
  exec "${YARN[@]}" vite preview --host "${HOST:-127.0.0.1}" --port "${PORT:-4173}" --strictPort "$@"
}

cmd_lint() {
  info "ESLint..."
  "${YARN[@]}" eslint . "$@"
  info "Type-checking..."
  "${YARN[@]}" vue-tsc -b
  ok "Lint passed."
}

cmd_test() {
  "${YARN[@]}" vitest run "$@"
}

main() {
  if [[ $# -eq 0 ]]; then
    usage >&2
    exit 1
  fi
  local cmd="$1"
  shift
  case "$cmd" in
    -h | --help | help)
      usage
      exit 0
      ;;
    dev | build | preview | lint | test) ;;
    *)
      error "Unknown command: ${cmd}"
      usage >&2
      exit 1
      ;;
  esac
  check_env
  ensure_deps
  trap 'error "Command \"${cmd}\" failed."' ERR
  "cmd_${cmd}" "$@"
}

main "$@"
