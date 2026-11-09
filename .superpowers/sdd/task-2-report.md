# Task 2 Report: parseToolArgs + ToolRegistry

**Status:** DONE_WITH_CONCERNS  
**Branch:** `feature/agent-byok-hosttools`  
**Base HEAD:** `d5e0bce` (feat(agent): add chat types and MemoryStore)  
**Commit:** `fc661a4` feat(agent): add ToolRegistry and parseToolArgs  
**Time (Asia/Shanghai):** 2026-11-04 ~17:24 UTC+8

## What was delivered

| File | Role |
|------|------|
| `src/agent/parseToolArgs.ts` | `parseToolArguments` + CSS-repair helpers (`extractBrokenCssField`, fences, single-quote repair) |
| `src/agent/ToolRegistry.ts` | `register` / `unregister` / `clear` / `has` / `list` / `toOpenAI` / `run` |
| `src/agent/__tests__/ToolRegistry.test.ts` | Brief-specified TDD test |

### APIs produced

- `parseToolArguments(argsJson: string): unknown`
- `ToolRegistry` with `register`, `unregister`, `clear`, `has`, `list`, `toOpenAI`, `run`
- Consumes `HostTool`, `ToolContext` from `./types` (Task 1)

### Import adjustments vs SimpleChat

- `./types.js` / `./parseToolArgs.js` → `./types` / `./parseToolArgs` (no `.js` suffix)
- No `@simplechat/*` imports; no `thirdparty/` usage

## TDD evidence

1. **RED:** Wrote brief test first → `yarn test src/agent/__tests__/ToolRegistry.test.ts` failed with `Cannot find module '../ToolRegistry'`
2. **GREEN:** Ported `parseToolArgs.ts` + `ToolRegistry.ts` → same command **1 passed**
3. **Regression:** `yarn test src/agent/__tests__/` → **2 files / 4 tests passed**

## Self-review

### Checklist vs brief

- [x] Create `parseToolArgs.ts`, `ToolRegistry.ts`, `__tests__/ToolRegistry.test.ts`
- [x] Invalid name throws `/Invalid tool name/`
- [x] `run` returns `{ ok: true, result }` for registered handler
- [x] Unknown tool → `ok: false`
- [x] `toOpenAI()[0].function.name === 'echo'`
- [x] Commit subject matches brief
- [x] Global constraints: no `@simplechat`, no thirdparty runtime dep, no MCP/UI/permissions expansion

### Adaptation note

SimpleTools enables `noUncheckedIndexedAccess`. Ported `parseToolArgs` needed one minimal fix:

```ts
// before (TS2345 under noUncheckedIndexedAccess)
while (i < raw.length && /\s/.test(raw[i])) i++;
// after
while (i < raw.length && /\s/.test(raw[i]!)) i++;
```

Behavior unchanged; tests still green after the patch.

### Style

- `ToolRegistry.ts` matches local agent style (no semicolons)
- `parseToolArgs.ts` kept SimpleChat semicolon style (direct port + CSS helpers per brief)

## Concerns

1. **Pre-existing typecheck noise (Task 1):** `yarn typecheck` still reports  
   `src/agent/__tests__/types.test.ts(2,40): error TS6133: 'normalizeBaseUrl' is declared but its value is never read.`  
   Not introduced by this task; left untouched to keep the commit scoped.
2. **Test coverage is brief-minimal:** one integration-style test covers register validation, run success, missing tool, and toOpenAI. Does not explicitly assert invalid-JSON `run` path, handler throw → `{ ok: false }`, unregister/clear/has/list, or CSS-repair branches in `parseToolArgs`. Sufficient for plan Step 1–4; later tasks may want focused unit tests if ChatEngine depends on repair behavior.
3. **Handler typing:** register test uses `(args: { text: string })` while `HostTool.handler` is `(args: any, ctx: ToolContext) => ...` — compatible, no change needed.

## Verification commands (fresh)

```bash
yarn test src/agent/__tests__/ToolRegistry.test.ts   # 1 passed
yarn test src/agent/__tests__/                       # 4 passed
yarn typecheck  # only pre-existing types.test unused import
```

## Follow-ups for next tasks

- ChatEngine (Task 3+) can import `ToolRegistry` + `parseToolArguments` from `src/agent/`
- Optional: drop unused `normalizeBaseUrl` import in `types.test.ts` to clear typecheck
