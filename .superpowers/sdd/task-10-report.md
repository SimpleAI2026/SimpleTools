# Task 10 Report — Chrome constraint docs + E2E verification

## Status
DONE_WITH_CONCERNS

## Commits
- `0c06712` docs(agent): note BYOK chrome host-permission constraint
- `4823729` fix(agent): chrome BYOK host-permission warning and HostTool args typing

## What shipped
- `chrome-extension/README.md` Agent（BYOK）section (manifest unchanged; no host_permissions)
- Root `README.md` / `README_EN.md` short Agent (BYOK) feature bullets (offline brand clear)
- Settings UI warning when `import.meta.env.VITE_TARGET === 'chrome'` (`data-testid="agent-settings-chrome-warning"`) + `agent.chromeHostWarning` i18n (zh-CN/en + EN stubs other locales)
- Lint fix: `HostTool.handler` args `any` → `unknown` (+ hostTools/test narrowing)

## Verification
- `yarn test` — 156 files / 402 tests passed
- `yarn lint` — 0 errors; 1 pre-existing warning in `src/tools/pdf-editor/index.vue` (vue/attributes-order) — not Agent; left untouched
- `yarn typecheck` — pass

## E2E checklist (Chrome headless @ http://127.0.0.1:5173, no real API key)
1. `/agent` from header — PASS
2. Settings → `localStorage['simpletools-agent:settings']` — PASS
3. Stream tokens + Stop — SKIPPED (no CORS-friendly BYOK endpoint)
4. `list_tools` tool card — SKIPPED (same); HostTool unit tests cover path
5. `open_tool` → token-counter — SKIPPED; unit tests cover
6. `run_offline_tool` redactor — SKIPPED; unit tests cover
7. Refresh → threads from IndexedDB (`simpletools-agent:simpletools-agent`) — PASS
8. Chat not a Home registry tool card (header-only `/agent`; no `/tools/agent`) — PASS
- Extra: chrome warning hidden on web build — PASS

## Concerns
- Live BYOK streaming/tool loop (checklist 3–6) not exercised without a CORS-friendly endpoint + key
- Chrome-extension build warning UI not separately smoke-tested under `VITE_TARGET=chrome` (gated in code; web confirms hidden)
- Pre-existing pdf-editor lint warning remains
