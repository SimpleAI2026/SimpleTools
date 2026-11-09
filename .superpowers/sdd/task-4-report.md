# Task 4 Report: ChatEngine send + tool loop

**Status:** DONE  
**Branch:** `feature/agent-byok-hosttools`  
**Commit:** `c3e47fb` — `feat(agent): add ChatEngine with streaming tool loop`  
**Author:** linkxzhou \<zhoulv2000@163.com\>  
**Date:** 2026-11-04 (Asia/Shanghai)

## Deliverables

| File | Action |
|------|--------|
| `src/agent/ChatEngine.ts` | Created |
| `src/agent/__tests__/ChatEngine.test.ts` | Created |

## TDD evidence

1. **RED:** Wrote tests first → `yarn test src/agent/__tests__/ChatEngine.test.ts` failed with `Cannot find module '../ChatEngine'`.
2. **GREEN:** Ported ChatEngine (P1 adaptations) → same command: **2 passed**.
3. **Regression:** `yarn test src/agent/__tests__/` → **5 files / 9 tests passed**.

## P1 adaptations vs SimpleChat

- Import paths without `.js`.
- Removed `ChromeAiProvider` construction / import; no `getChromeAiProvider()`.
- `getProvider()` returns injected provider or `openaiProvider` (Phase2 chrome-ai switch commented).
- `getProviderId()` still defaults to `'openai'` via `isChatProviderId`.
- No `@simplechat/*` dependency.

## API surface (as required)

`on`, `updateConfig`, `registerTool`, `unregisterTool`, `stop`, `listThreads`, `getMessages`, `createThread`, `selectThread`, `deleteThread`, `ensureThread`, `send(userText): AsyncGenerator<ChatEvent>`, `createChatClient(opts)`, plus `getProvider` / `getProviderId`.

## Behavior preserved

- `send()` yields `message` → tool rounds (`tool-result` + tool `message`) → `done` / `error`.
- Title auto-rename when title is `新会话` / `New chat`.
- Tool loop capped by `maxToolRounds` (default 5).
- Abort → `error` with `Aborted`.

## Self-review

**Strengths**
- Faithful port of SimpleChat tool loop with DI (`fetchImpl`, `store`, optional `provider`).
- Tests cover streaming text deltas and multi-round tool feedback (2 fetch calls).
- Aligns with Tasks 1–3 types / MemoryStore / ToolRegistry / SSE / OpenAICompatProvider.

**Concerns / follow-ups (non-blocking)**
- Brief tests omit SimpleChat extras (HTTP 401 surface, thread persistence rename assertions, request body shape). Optional to add later for parity.
- `getProviderId()` can report `'chrome-ai'` from config while `getProvider()` still returns OpenAI — intentional Phase1 stub; document for Phase2.
- `storageKey` on `ChatEngineOptions` is unused (API parity with SimpleChat; IndexedDB wiring is a later task).

## Constraints check

- No `thirdparty/` or `@simplechat/*`.
- No MCP / multimodal / Nano provider.
- No permission expansion.
