# Task 8 Report: Route, AppHeader entry, App layout, i18n

## Status
DONE_WITH_CONCERNS

## What was implemented
- i18n: `app.agent` / `app.agentTitle` plus top-level `agent.*` keys in zh-CN and en (per brief).
- English stub copies of those keys in de/es/fr/ja/ko/pt-BR so `MessageSchema` typechecks (required; not listed in brief file list).
- Named route `agent` at `/agent` with lazy `AgentPage.vue`; `router.afterEach` sets document title via `app.agentTitle`.
- AppHeader Bot icon entry (sm text + icon-only) before GitHub, matching existing extension button patterns (`data-testid="agent-entry"` / `agent-entry-icon`).
- `App.vue` full-bleed agent layout (`max-w-7xl`, hide footer when `route.name === 'agent'`).
- Minimal `AgentPage.vue` shell: mounts `useAgentStore().init()`, shows `$t('agent.empty')`.

## Files changed
- Modify: `src/router/index.ts`, `src/components/layout/AppHeader.vue`, `src/App.vue`
- Modify: `src/i18n/locales/zh-CN.ts`, `en.ts`, and (extra) `de.ts`, `es.ts`, `fr.ts`, `ja.ts`, `ko.ts`, `pt-BR.ts`
- Create: `src/pages/AgentPage.vue`

## Verification
- `yarn typecheck` → exit 0
- Scoped eslint on touched files → exit 0
- Full `yarn lint` → exit 1 (pre-existing: `src/agent/types.ts` no-explicit-any; `pdf-editor` attributes-order) — not introduced by this task
- `yarn test src/i18n/messages.test.ts` → 9/9 passing

## Commits
- `3a31e12` feat(agent): add /agent route, header entry, and i18n

## Self-review
- Matches brief steps 1–6; AgentPage is intentionally a placeholder for Task 9.
- Did not expand Chrome permissions, import thirdparty/@simplechat/element, or port themes.
- Header still uses `max-w-6xl` (brief only changed App main to `max-w-7xl`).

## Concerns
1. Brief listed only zh-CN + en, but MessageSchema typing forces identical keys on all locales; added English stubs to other locales (runtime still has `fallbackLocale: 'en'`).
2. AppHeader container remains `max-w-6xl` while agent main is `max-w-7xl` — may look slightly misaligned on agent route; out of brief scope.
