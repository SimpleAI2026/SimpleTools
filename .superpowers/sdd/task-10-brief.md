### Task 10: Chrome constraint docs + end-to-end verification

**Files:**
- Modify: `chrome-extension/README.md` (note only)
- Optionally modify: root `README.md` / `README_EN.md` — one short “Agent (BYOK)” bullet (keep offline brand clear)

**Chrome / fetch constraint (document, do not expand permissions in P1):**

1. **Web build:** Browser enforces CORS. User must point `apiBaseUrl` at an OpenAI-compatible endpoint that allows the SimpleTools origin (or use a local proxy). No manifest change.
2. **Chrome extension build (`chrome-extension/manifest.json`):** Currently `"permissions": []` and no `host_permissions`. Extension pages **cannot** `fetch` arbitrary HTTPS APIs without host permission. P1 leaves manifest unchanged; Agent settings UI should show a short warning when `import.meta.env.VITE_TARGET === 'chrome'` that BYOK may fail until a later release adds `optional_host_permissions` + `chrome.permissions.request` for the configured origin.
3. **Future (not this plan):** `optional_host_permissions: ["https://*/*"]` (or per-origin) requested only after user saves Base URL.

README snippet to append:

```md
## Agent（BYOK，实验）

应用内路由 `/agent` 提供自带密钥的 OpenAI 兼容对话，并可调用 HostTools 打开/运行白名单离线工具。
密钥仅存本机。Chrome 插件版暂未申请 host 权限，扩展内直连云端 API 可能失败；请优先用网页版或等待后续 optional host permissions。
```

- [ ] **Step 1: Update chrome-extension/README.md + root README brief note**

- [ ] **Step 2: Full test suite**

```bash
yarn test
yarn lint
```

Expected: all green (fix any Agent-related type/i18n MessageSchema breakage — zh-CN drives `MessageSchema`, so en must have the same `agent` key shape).

- [ ] **Step 3: Manual E2E checklist**

1. `/agent` loads from header.
2. Settings save → `localStorage['simpletools-agent:settings']` present.
3. With a real CORS-friendly endpoint: stream tokens appear; Stop aborts.
4. Prompt model to `list_tools` → tool card + result.
5. Prompt `open_tool` with `token-counter` → navigates to `/tools/token-counter`.
6. Prompt `run_offline_tool` for redactor → redacted text in tool result.
7. Refresh page → threads restored from IndexedDB.
8. Confirm chat is **not** listed as a registry tool card on Home.

- [ ] **Step 4: Commit**

```bash
git add chrome-extension/README.md README.md README_EN.md
git commit -m "docs(agent): note BYOK chrome host-permission constraint"
```

---

## Self-Review

### 1. Spec coverage

| Requirement | Task |
|-------------|------|
| Phase1 BYOK OpenAI-compat + HostTool | Tasks 3–7, 9 |
| Nano = Phase2 stub only | Task 5 `PHASE2_NANO.md` |
| Port engine into `src/agent/`, no element/Shadow DOM | Tasks 1–5 |
| shadcn-vue + B&W UI | Task 9 |
| Route `/agent` + AppHeader | Task 8 |
| Left threads / right messages+composer | Task 9 |
| HostTools `list_tools` / `open_tool` / `run_offline_tool` whitelist | Task 6 |
| Settings Dialog localStorage | Tasks 5, 7, 9 |
| Chrome permissions constraint documented, not expanded | Task 10 |
| Out of scope MCP/multimodal/tool-card | Global Constraints + File map |
| TDD for engine | Tasks 1–6 |
| Frequent commits | Every task Step commit |
| Commit author email | Global Constraints (`zhoulv2000@163.com`) |

### 2. Placeholder scan

No TBD / “implement later” / “similar to Task N” left in steps. Code sketches are concrete and match SimpleChat real APIs (`HostTool`, `ChatEngine.send`, `ToolRegistry.run`, `ChatEvent` union).

### 3. Type consistency

- Storage key: `simpletools-agent` / `simpletools-agent:settings`
- HostTool names: `list_tools`, `open_tool`, `run_offline_tool`
- Whitelist: `token-counter`, `prompt-secret-redactor`
- Pinia store id: `agent`
- Route name: `agent`, path `/agent`
- Provider P1: always `'openai'`

### Known follow-ups (not blockers)

- Other locales (ja/ko/de/fr/es/pt-BR) inherit English via `fallbackLocale: 'en'` until translated.
- Optional `scroll-area` / typography plugin not required.
- Expanding offline whitelist beyond two tools is a later change to `OFFLINE_TOOL_WHITELIST` + `run_offline_tool` switch.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-04-agent-byok-hosttools.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks (`superpowers:subagent-driven-development`)
2. **Inline Execution** — execute tasks in-session with `superpowers:executing-plans` and checkpoints

Which approach?
