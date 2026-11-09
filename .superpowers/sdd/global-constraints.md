## Global Constraints

- Offline-first toolbox brand; BYOK is an explicit opt-in chat surface, not a registry tool card.
- Do **not** depend on `thirdparty/` (reference-only).
- Do **not** import `@simplechat/element` or use Shadow DOM / web components.
- Do **not** add MCP runtime, multimodal uploads, or Chrome Nano provider tasks in this plan (Nano = Phase 2 stub only).
- UI must reuse `src/components/ui/*` and `src/styles/globals.css` (neutral B&W). Do not port SimpleChat themes.
- Settings (`baseURL`, `apiKey`, `model`, `systemPrompt`) persist in **localStorage only** (key scoped `simpletools-agent:settings`).
- Chat history persists in IndexedDB (`simpletools-agent` DB name / storage key).
- Chrome extension currently has `"permissions": []` and **no** `host_permissions`. P1 must **not** expand permissions unless absolutely required; document that extension BYOK fetch to arbitrary HTTPS APIs will fail until optional host permissions (later). Web build relies on CORS-friendly OpenAI-compat endpoints.
- Commits: author email `zhoulv2000@163.com` (already repo default). Prefer small commits per task.
- Chinese primary user; i18n keys in zh-CN + en at minimum (other locales fall back to `en` via vue-i18n `fallbackLocale`).
- Stack floors: Vue3 / Vite / Yarn4 / Pinia / vue-i18n / Tailwind4 / shadcn-vue as in root `package.json`.

---

