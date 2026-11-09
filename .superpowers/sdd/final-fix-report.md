
## Pre-merge Important fixes (2026-11-04 Asia/Shanghai)

### Fix 1 — rememberKey:false session apiKey
- **Bug:** `send()` called `resolveAgentConfig()` without draft; after save with `rememberKey: false` LS omits apiKey → always opens settings. `loadSettingsIntoDraft` also wiped in-memory key.
- **Fix:** Always `resolveAgentConfig(draftSettings.value)` in `ensureEngine` / `init` / `send`. When LS omits apiKey, preserve existing draft/session key in `loadSettingsIntoDraft`.
- **Test:** `settings.test.ts` — `uses draft/session apiKey override when rememberKey is false`.
- **Manual verify:** Settings → enter key → uncheck remember → Save → send a message without reopening settings; reload draft/settings dialog should keep session key until tab refresh if not remembered.

### Fix 2 — abort leaves assistant status streaming
- **Bug:** AbortError exited before assistant `status` left `streaming`; UI showed 生成中 forever.
- **Fix:** `runCompletion` catch sets in-flight assistant to `done` (abort) / `error` (other) and persists; `send` catch also `finalizeStreamingAssistants`.
- **Test:** ChatEngine abort test asserts final assistant message `status === 'done'`.

### Verification
- `yarn vitest run src/agent` — 8 files / 23 tests passed
- `yarn typecheck` — clean
