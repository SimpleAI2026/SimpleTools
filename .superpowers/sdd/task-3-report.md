# Task 3 Report: SSE + normalizeSecret + OpenAICompatProvider

**Status:** DONE_WITH_CONCERNS  
**Branch:** `feature/agent-byok-hosttools`  
**Base HEAD:** `fc661a4` (feat(agent): add ToolRegistry and parseToolArgs)  
**Commit:** `8dac170` feat(agent): add SSE parser and OpenAICompatProvider  
**Time (Asia/Shanghai):** 2026-11-04 ~17:29 UTC+8

## What was delivered

| File | Role |
|------|------|
| `src/agent/sse.ts` | `parseSSEStream`, `mergeToolCallDeltas`, `StreamDelta`, `AccumulatedToolCall` |
| `src/agent/normalizeSecret.ts` | `normalizeSecret` (`my-` + URL-safe Base64 decode) |
| `src/agent/providers/types.ts` | `ChatProvider`, `ProviderStream*`, `OpenAICompatMessage`, `isChatProviderId` |
| `src/agent/providers/OpenAICompatProvider.ts` | SSE streaming OpenAI-compat provider |
| `src/agent/providers/index.ts` | openai + types only (no ChromeAiProvider) |
| `src/agent/__tests__/sse.test.ts` | Brief SSE + mergeToolCallDeltas tests |
| `src/agent/__tests__/OpenAICompatProvider.test.ts` | Brief provider smoke test |
| `src/agent/__tests__/types.test.ts` | Hygiene: drop unused `normalizeBaseUrl` import |

### APIs produced

- `parseSSEStream(body, signal?)` / `mergeToolCallDeltas(acc, deltas)`
- `normalizeSecret(secret)`
- `OpenAICompatProvider.stream(req)` → `text-delta` | `tool-call-deltas` | `finish`
- `ChatProvider` interface + `isChatProviderId`
- Consumes `SimpleChatConfig`, `chatCompletionsUrl`, `ChatProviderId` from Task 1

### Import adjustments vs SimpleChat

- Dropped `.js` suffixes (`../types`, `../sse`, `./types`)
- `ChatProviderId` imported/re-exported from `../types` (already defined in Task 1) instead of redefining the union
- `providers/index.ts` exports openai + types only — **no** `ChromeAiProvider` (P1)

## TDD evidence

1. **RED (SSE):** Wrote brief `sse.test.ts` first → `Cannot find module '../sse'`
2. **GREEN (SSE):** Added `sse.ts` (+ `normalizeSecret.ts`) → **2 passed**
3. **RED (provider):** Wrote `OpenAICompatProvider.test.ts` → `Cannot find module '../providers/OpenAICompatProvider'`
4. **GREEN (provider):** Added `providers/*` → provider + SSE **3 passed**; full `src/agent` **7 passed**
5. **Typecheck:** `yarn typecheck` clean after `?.[0]` on `fetchImpl.mock.calls[0]` (`noUncheckedIndexedAccess`)

## Self-review

### Checklist vs brief

- [x] Create sse / normalizeSecret / providers/{types,OpenAICompatProvider,index} + both tests
- [x] `parseSSEStream` yields delta until `[DONE]`
- [x] `mergeToolCallDeltas` accumulates name/args by index
- [x] Provider POSTs `.../chat/completions`, yields `text-delta` + `finish`
- [x] No ChromeAiProvider port
- [x] Commit subject matches brief
- [x] Global constraints: no `@simplechat`, no thirdparty runtime, no MCP/UI/permissions expansion
- [x] Optional hygiene: removed unused `normalizeBaseUrl` import from `types.test.ts`

### Style

- Semicolon-free to match local `src/agent/*` (Task 1–2)
- `normalizeSecret` warning string kept Chinese as in SimpleChat

## Concerns

1. **Brief-minimal coverage:** No dedicated `normalizeSecret` unit tests; provider smoke does not cover `tool-call-deltas`, HTTP error path, `my-` secret decode, abort/`signal`, or missing body. Enough for Task 4 ChatEngine wiring; expand if failures appear.
2. **`noUncheckedIndexedAccess` test tweak:** Brief used `fetchImpl.mock.calls[0][0]`; needed `?.[0]` for `yarn typecheck` under SimpleTools TS settings.
3. **`ChatProviderId` location:** Lives in `src/agent/types.ts` (Task 1) and is re-exported from `providers/types` — differs from SimpleChat where the union lived only under providers. Intentional to avoid duplicate unions.

## Verification commands (fresh)

```bash
yarn test src/agent/__tests__/sse.test.ts src/agent/__tests__/OpenAICompatProvider.test.ts  # 3 passed
yarn test src/agent                                                               # 7 passed
yarn typecheck                                                                    # clean
```

## Follow-ups for next tasks

- Task 4 ChatEngine should consume `OpenAICompatProvider` + `mergeToolCallDeltas` / `parseToolArguments` / `ToolRegistry`
- Still no host_permissions; BYOK fetch from extension remains blocked until later optional permission work
