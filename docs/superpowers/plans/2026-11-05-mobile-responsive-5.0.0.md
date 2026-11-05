# SimpleTools 5.0.0 Mobile Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every SimpleTools main flow usable on narrow-screen Web (≥375px / ~390–430) by fixing shared shell/components first, then Broken tools, then remaining Partial layouts, and ship version **5.0.0** across Web + Chrome + VS Code (no PWA, no push).

**Architecture:** Shared-components-first. Fix `Textarea` / `TextIO` / `ConvertIO`, `PdfPageCanvas`, and `SheetTable` so ~65+ tools inherit mobile heights and container-fit canvas. Shell (`AppHeader`, Agent thread list) gets overflow menu + `<md` drawer. Broken PDF annotate UIs degrade to stacked toolbars + scrollable canvas. Remaining Partial tools are swept by layout pattern (`lg:grid-cols-[1fr_*]`, bare `h-[500px]`, `notepad` / `image-editor`, `PdfPageGrid`). Breakpoints stay Tailwind `sm` / `md` / `lg`.

**Tech Stack:** Vue 3 · Vite · Yarn 4 · Pinia · vue-i18n · Tailwind CSS 4 · shadcn-vue (reka-ui) · Vitest · `@vue/test-utils` · Lucide icons · pdf.js / existing WASM engines unchanged.

## Global Constraints

- Target: narrow-screen Web mobile browsers only (≥375px); acceptance = all **131** tools' main flow completable.
- Hard tools (PDF annotate / canvas): degraded/simplified UI OK if main flow still works.
- No PWA / no `vite-plugin-pwa`.
- Shared-components-first; prefer changing `src/components/shared/*` and `src/components/ui/textarea` over per-tool copies.
- Version must become **5.0.0** in `package.json`, `chrome-extension/manifest.json`, and `vscode-extension/package.json`.
- Chrome / VS Code are version-bumped only (not mobile surfaces).
- Do not depend on `thirdparty/` (reference-only).
- Offline-first; do not expand HostTools whitelist or Chrome `host_permissions` in this plan.
- Multilingual: add any new i18n keys to `src/i18n/locales/zh-CN.ts` (schema source) and `en.ts` at minimum; other locales fall back to `en`.
- Touch targets for primary shell/actions ≥ **44px** (`size-11` / `min-h-11 min-w-11`).
- Commits: author email `zhoulv2000@163.com`. Prefer one commit per task. **No push** unless explicitly asked.
- Verify with `./build.sh lint`, `./build.sh test`, `./build.sh build` (or `yarn lint` / `yarn test` / `yarn build`).
- Do not rewrite tool business logic; layout/CSS/component chrome only unless a tiny helper is required for container-fit width.

---

## File Structure Map

### Modify — shell / layout

| Path | Responsibility |
|------|----------------|
| `src/components/layout/AppHeader.vue` | Narrow overflow ("more") menu; ≥44px touch targets; keep desktop inline controls at `md+` |
| `src/pages/HomePage.vue` | Confirm single-column + chip wrap already OK; bump category chip min height if needed |
| `src/pages/AgentPage.vue` | `<md` hide permanent sidebar; menu button opens thread drawer |
| `src/components/agent/AgentThreadList.vue` | Drawer-capable aside; delete always visible (not `opacity-0 group-hover`) |
| `src/components/agent/AgentComposer.vue` | Send/stop buttons ≥44px on narrow screens |
| `src/App.vue` | Keep agent full-bleed `h-dvh`; ensure main padding does not cause horizontal overflow at 390px |
| `src/i18n/locales/zh-CN.ts` | New keys: `app.moreMenu`, `common.scrollHint`, `agent.openThreads`, `agent.closeThreads` |
| `src/i18n/locales/en.ts` | Same keys in English |

### Modify — shared / UI (highest leverage)

| Path | Responsibility |
|------|----------------|
| `src/components/ui/textarea/Textarea.vue` | Remove baked-in fixed `h-[500px]`; default to responsive `min-h-[min(500px,45dvh)]` |
| `src/components/shared/TextIO.vue` | Responsive pane height; `<lg` Input/Output Tabs; keep `lg:grid-cols-2` dual pane |
| `src/components/shared/ConvertIO.vue` | Inherits TextIO; ensure swap/ModeToggle wrap |
| `src/components/shared/PdfPageCanvas.vue` | `width = min(prop, container)`; outer scroll; touch-friendly pointer handling |
| `src/components/shared/SheetTable.vue` | Keep `overflow-auto`; add horizontal scroll hint |
| `src/components/shared/PdfPageGrid.vue` | Slightly denser minmax on narrow screens |
| `src/components/ui/button/index.ts` | Prefer call-site `size-11` classes over changing global button defaults |

### Modify — Broken tools

| Path | Responsibility |
|------|----------------|
| `src/tools/pdf-redact/index.vue` | Stack sidebar under canvas `<lg`; canvas `overflow-auto max-w-full`; toolbar `flex-wrap` |
| `src/tools/pdf-editor/index.vue` | Same stack + wrap ModeToggle toolbar; degrade inspector under canvas on narrow |
| `src/tools/pdf-auto-redact/index.vue` | Stack match list + preview; wrap presets; container-fit canvas |

### Modify — Partial tools (by pattern; exact ids from Mac audit)

| Pattern | Tool ids |
|---------|----------|
| `lg:grid-cols-[1fr_*]` sidebar | `css-unit-converter`, `image-editor`, `image-filters`, `pdf-crop`, `qr-code-generator` |
| `md:grid-cols-[*]` aside | `notepad`, `color-converter` |
| Bare `grid-cols-4` (no `sm:`) | `image-editor` (crop x/y/w/h) |
| Direct `h-[500px]` / `min-h-[500px]` in tool SFC | `agent-instructions`, `agent-tool-def`, `base64`, `border-radius-generator`, `box-shadow-generator`, `case-converter`, `csv-to-excel`, `diff-checker`, `excel-to-csv`, `excel-to-json`, `gzip-tool`, `hash-generator`, `html-to-image`, `image-base64`, `json-formatter`, `json-viewer`, `lorem-ipsum`, `markdown-preview`, `mcp-config-builder`, `notepad`, `pptx-creator`, `prompt-injection-scanner`, `prompt-secret-redactor`, `random-name-picker`, `random-number-generator`, `regex-tester`, `svg-to-png`, `system-prompt-linter`, `text-size-calculator`, `token-counter`, `url-encoder`, `uuid-generator`, `word-counter`, `word-creator`, `word-to-markdown`, `word-to-text` |
| TextIO / ConvertIO dependents (fixed by Task 3; re-spot-check) | `aes-encryption`, `base32`, `binary-text`, `css-formatter`, `csv-formatter`, `csv-json`, `csv-to-sql`, `html-entities`, `html-formatter`, `html-markdown`, `html-minifier`, `javascript-formatter`, `json-to-typescript`, `json-xml`, `json-yaml`, `md-to-html`, `morse-code`, `px-rem`, `roman-numerals`, `rot13`, `slug-generator`, `sql-formatter`, `svg-formatter`, `text-cleaner`, `text-lines`, `text-repeater`, `toml-json`, `upside-down-text`, `utf8-converter`, `xml-formatter` |
| SheetTable dependents (fixed by Task 5; re-spot-check) | `csv-to-excel`, `excel-to-pdf`, `excel-viewer`, `pdf-to-excel` |
| `PdfPageGrid` | `pdf-rotate`, `pdf-to-image` |
| `lg:flex-row` PDF (also Broken) | `pdf-redact`, `pdf-editor`, `pdf-auto-redact` |

### Modify — version / packaging

| Path | Responsibility |
|------|----------------|
| `package.json` | `"version": "5.0.0"` |
| `chrome-extension/manifest.json` | `"version": "5.0.0"` |
| `vscode-extension/package.json` | `"version": "5.0.0"` |
| `chrome-extension/simpletools-chrome.zip` + `public/downloads/simpletools-chrome.zip` | Produced by `./build.sh chrome` |

### Create — tests

| Path | Responsibility |
|------|----------------|
| `src/components/shared/fitWidth.ts` | Pure helper for container-fit width |
| `src/components/shared/fitWidth.test.ts` | Unit tests for `fitWidth` |
| `src/components/shared/TextIO.test.ts` | jsdom mount: tabs + responsive height classes |
| `src/components/layout/AppHeader.test.ts` | jsdom mount: overflow trigger present |
| `src/components/agent/AgentThreadList.test.ts` | Assert delete not hover-only |
| `src/components/shared/SheetTable.test.ts` | Scroll hint present |

### Out of scope

- PWA, service worker, install prompt
- Native apps; treating Chrome/VS Code webviews as phone surfaces
- HostTools whitelist expansion
- Push to `origin`
- Redesigning HomePage card grid beyond existing `sm:grid-cols-2 lg:grid-cols-3`

### Audit baseline (from approved spec)

- Versions today: Web/Chrome **4.0.0**, VS Code **3.0.1**
- Tools: **131** — OK **38** / Partial **89** / Broken **4** (`agent`, `pdf-redact`, `pdf-editor`, `pdf-auto-redact`)
- Viewport meta already present in `index.html`; no Drawer/Sheet/safe-area/PWA today

---

### Task 1: AppHeader mobile overflow menu + touch targets

**Files:**
- Modify: `src/components/layout/AppHeader.vue`
- Modify: `src/i18n/locales/zh-CN.ts` (add `app.moreMenu`)
- Modify: `src/i18n/locales/en.ts` (add `app.moreMenu`)
- Test: `src/components/layout/AppHeader.test.ts` (create)
- Optional touch-up: `src/pages/HomePage.vue` category chips `min-h-11` if they feel short

**Interfaces:**
- Consumes: existing `useSettingsStore`, `InstallExtensionModal`, `SUPPORTED_LOCALES`, `Button`
- Produces: header with `data-testid="header-more"` opening a panel that contains locale `<select>`, theme toggle, and (when `showExtensionDownloads`) Chrome/VS Code entries; icon controls use ≥44px hit area under `md`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/layout/AppHeader.test.ts
/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppHeader from './AppHeader.vue'
import zhCN from '@/i18n/locales/zh-CN'
import en from '@/i18n/locales/en'

describe('AppHeader mobile overflow', () => {
  it('renders a more-menu trigger with data-testid header-more', async () => {
    setActivePinia(createPinia())
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div />' } }],
    })
    await router.push('/')
    await router.isReady()
    const w = mount(AppHeader, {
      global: { plugins: [i18n, router, createPinia()], stubs: { InstallExtensionModal: true } },
    })
    await flushPromises()
    expect(w.find('[data-testid="header-more"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/components/layout/AppHeader.test.ts -v`

Expected: FAIL — `[data-testid="header-more"]` not found.

- [ ] **Step 3: Add i18n keys**

In `src/i18n/locales/zh-CN.ts` under `app`:

```ts
moreMenu: '更多',
```

In `src/i18n/locales/en.ts` under `app`:

```ts
moreMenu: 'More',
```

Keep MessageSchema in sync (zh-CN is the type source).

- [ ] **Step 4: Implement overflow menu + touch targets in AppHeader**

Collapse language / theme / extension entries into a More panel below `md`; keep GitHub as icon. Use `Menu` from `lucide-vue-next`, `data-testid="header-more"`, panel `role="menu"`, document pointerdown to dismiss. Desktop (`md+`) keeps current inline Chrome / VS Code / locale / theme. All icon buttons use `class="size-11"` (44px). Remove the previous `sm:hidden` icon-only Chrome/VS Code buttons (they move into the more menu).

Concrete mobile cluster:

```vue
<Button variant="ghost" size="icon" class="size-11 md:hidden" as-child data-testid="github-link-mobile">
  <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" :aria-label="$t('app.github')"><Github /></a>
</Button>
<div ref="moreRoot" class="relative md:hidden">
  <Button
    variant="ghost"
    size="icon"
    class="size-11"
    data-testid="header-more"
    :aria-expanded="moreOpen"
    :aria-label="$t('app.moreMenu')"
    @click="moreOpen = !moreOpen"
  >
    <Menu />
  </Button>
  <div v-if="moreOpen" class="bg-popover absolute top-full right-0 z-20 mt-1 w-56 rounded-md border p-2 shadow-md" role="menu">
    <label class="mb-2 flex flex-col gap-1 px-1 text-xs">
      <span class="text-muted-foreground">{{ $t('app.language') }}</span>
      <select class="border-input bg-background h-11 w-full rounded-md border px-2 text-sm" :value="settings.locale" @change="onLocaleChange">
        <option v-for="loc in SUPPORTED_LOCALES" :key="loc" :value="loc">{{ LOCALE_META[loc].nativeLabel }}</option>
      </select>
    </label>
    <Button variant="ghost" class="h-11 w-full justify-start" @click="settings.toggleTheme(); moreOpen = false">
      <Moon v-if="!settings.isDark" /><Sun v-else /> {{ $t('app.toggleTheme') }}
    </Button>
    <template v-if="showExtensionDownloads">
      <Button variant="ghost" class="h-11 w-full justify-start" data-testid="chrome-extension-entry-icon" @click="openInstall('chrome')">
        <Puzzle /> {{ $t('app.extensions.chrome') }}
      </Button>
      <Button variant="ghost" class="h-11 w-full justify-start" data-testid="vscode-extension-entry-icon" @click="openInstall('vscode')">
        <Code2 /> {{ $t('app.extensions.vscode') }}
      </Button>
    </template>
  </div>
</div>
```

Script additions: `moreOpen`, `moreRoot`, `onDocPointerDown` registered in `onMounted` / removed in `onBeforeUnmount`.

- [ ] **Step 5: Re-run the test**

Run: `yarn vitest run src/components/layout/AppHeader.test.ts -v`

Expected: PASS

- [ ] **Step 6: Smoke lint on touched files**

Run: `yarn eslint src/components/layout/AppHeader.vue src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts`

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/AppHeader.vue src/components/layout/AppHeader.test.ts src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
feat(ui): AppHeader mobile overflow menu and 44px targets

EOF
)"
```

---

### Task 2: Agent drawer / hide sidebar <md + always-visible delete

**Files:**
- Modify: `src/pages/AgentPage.vue`
- Modify: `src/components/agent/AgentThreadList.vue`
- Modify: `src/components/agent/AgentComposer.vue`
- Modify: `src/i18n/locales/zh-CN.ts` (`agent.openThreads`, `agent.closeThreads`)
- Modify: `src/i18n/locales/en.ts` (same)
- Test: `src/components/agent/AgentThreadList.test.ts` (create)

**Interfaces:**
- Consumes: `useAgentStore`, existing thread CRUD
- Produces: `AgentThreadList` props `mobileOpen: boolean` + emit `close`; on `<md` aside is fixed left drawer; delete button always `opacity-100`; composer send/stop use `size-11` under `md`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/agent/AgentThreadList.test.ts
/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import AgentThreadList from './AgentThreadList.vue'
import en from '@/i18n/locales/en'
import zhCN from '@/i18n/locales/zh-CN'

vi.mock('@/stores/agent', () => ({
  useAgentStore: () => ({
    threads: [{ id: 't1', title: 'Hello', createdAt: 1, updatedAt: 1 }],
    currentThreadId: 't1',
    newThread: vi.fn(),
    selectThread: vi.fn(),
    deleteThread: vi.fn(),
  }),
}))

describe('AgentThreadList', () => {
  it('keeps delete button visible (no opacity-0 hover gate)', () => {
    setActivePinia(createPinia())
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const w = mount(AgentThreadList, { global: { plugins: [i18n] }, props: { mobileOpen: true } })
    expect(w.html()).not.toMatch(/opacity-0 group-hover:opacity-100/)
    expect(w.find('[data-testid="agent-thread-list"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/components/agent/AgentThreadList.test.ts -v`

Expected: FAIL on `opacity-0 group-hover:opacity-100` still present.

- [ ] **Step 3: Add i18n keys**

`zh-CN.ts` under `agent`:

```ts
openThreads: '会话列表',
closeThreads: '关闭会话列表',
```

`en.ts`:

```ts
openThreads: 'Chats',
closeThreads: 'Close chats',
```

- [ ] **Step 4: Update AgentThreadList**

- Desktop: `aside` with `hidden md:flex`, `data-testid="agent-thread-list"`, delete `class="... opacity-100"` (remove `opacity-0 group-hover:opacity-100`).
- Mobile: `Teleport to="body"` drawer when `mobileOpen`, `data-testid="agent-thread-drawer"`, overlay click emits `close`, width `w-[min(18rem,85vw)]`.
- Selecting a thread calls `agent.selectThread(id)` then `emit('close')`.
- New-chat + delete hit areas ≥44px on narrow (`h-11` / `size-9` minimum).

- [ ] **Step 5: Wire AgentPage menu button**

Add `threadsOpen` ref; header Menu button `data-testid="agent-open-threads"` with `class="size-11 md:hidden"`; pass `:mobile-open="threadsOpen" @close="threadsOpen = false"` to `AgentThreadList`. Keep existing error banners and settings button (`size-11 md:size-9`).

- [ ] **Step 6: Bump AgentComposer send/stop hit targets**

In `src/components/agent/AgentComposer.vue`, change both icon buttons from `size-8` to `size-11 md:size-8`.

- [ ] **Step 7: Run tests**

```bash
yarn vitest run src/components/agent/AgentThreadList.test.ts -v
yarn test
```

Expected: new test PASS; existing agent unit tests still PASS.

- [ ] **Step 8: Commit**

```bash
git add src/pages/AgentPage.vue src/components/agent/AgentThreadList.vue src/components/agent/AgentComposer.vue src/components/agent/AgentThreadList.test.ts src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
feat(agent): mobile thread drawer and always-visible delete

EOF
)"
```

---

### Task 3: Textarea + TextIO + ConvertIO responsive heights / tabs

**Files:**
- Modify: `src/components/ui/textarea/Textarea.vue`
- Modify: `src/components/shared/TextIO.vue`
- Modify: `src/components/shared/ConvertIO.vue` (only if needed for wrap; usually inherits)
- Test: `src/components/shared/TextIO.test.ts` (create)
- Beneficiaries (no per-file edit if they only use TextIO/ConvertIO): the 30 ids in the File Structure Map

**Interfaces:**
- Consumes: existing TextIO props (`output`, `error`, `placeholder`, `mono`, `sample`) + `v-model`
- Produces: pane class `min-h-[min(500px,45dvh)] h-[min(500px,45dvh)]`; `<lg` shows one pane via local `tab: 'input' | 'output'`; `lg+` dual column unchanged; tabs `data-testid="textio-tabs"`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/shared/TextIO.test.ts
/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import TextIO from './TextIO.vue'
import en from '@/i18n/locales/en'
import zhCN from '@/i18n/locales/zh-CN'

describe('TextIO', () => {
  it('uses responsive pane height classes instead of fixed h-[500px]', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const w = mount(TextIO, {
      props: { modelValue: 'a', output: 'b' },
      global: { plugins: [i18n] },
    })
    const html = w.html()
    expect(html).not.toMatch(/min-h-\[500px\] h-\[500px\]/)
    expect(html).toMatch(/min\(500px,\s*45dvh\)/)
    expect(w.find('[data-testid="textio-tabs"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/components/shared/TextIO.test.ts -v`

Expected: FAIL (still contains fixed `h-[500px]` / missing tabs).

- [ ] **Step 3: Fix Textarea default**

In `src/components/ui/textarea/Textarea.vue`, change the default `cn(...)` classes from `min-h-[500px] h-[500px]` to:

```ts
'flex min-h-[min(500px,45dvh)] h-[min(500px,45dvh)] w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50'
```

AgentComposer already overrides with `min-h-[84px] h-auto` — confirm `cn` / `tailwind-merge` keeps that win; if not, use `!h-auto !min-h-[84px]` on the Composer Textarea.

- [ ] **Step 4: Implement TextIO tabs + heights**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import CopyButton from './CopyButton.vue'
import ErrorAlert from './ErrorAlert.vue'

withDefaults(defineProps<{ output: string; error?: string; placeholder?: string; mono?: boolean; sample?: string }>(), {
  error: '',
  placeholder: '',
  mono: true,
  sample: undefined,
})
const input = defineModel<string>({ required: true })
const tab = ref<'input' | 'output'>('input')
const paneClass = 'min-h-[min(500px,45dvh)] h-[min(500px,45dvh)]'
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2"><slot /></div>
    <div class="flex gap-2 lg:hidden" data-testid="textio-tabs">
      <Button size="sm" class="min-h-11 flex-1" :variant="tab === 'input' ? 'default' : 'outline'" @click="tab = 'input'">{{ $t('common.input') }}</Button>
      <Button size="sm" class="min-h-11 flex-1" :variant="tab === 'output' ? 'default' : 'outline'" @click="tab = 'output'">{{ $t('common.output') }}</Button>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex min-h-0 flex-col gap-2" :class="tab === 'input' ? '' : 'hidden lg:flex'">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label class="hidden lg:inline">{{ $t('common.input') }}</Label>
          <div class="ml-auto flex gap-2">
            <button v-if="sample != null && sample !== ''" type="button" class="text-muted-foreground hover:text-foreground min-h-11 px-2 text-xs lg:min-h-0" @click="input = sample">{{ $t('common.sample') }}</button>
            <button type="button" class="text-muted-foreground hover:text-foreground min-h-11 px-2 text-xs lg:min-h-0" @click="input = ''">{{ $t('common.clear') }}</button>
          </div>
        </div>
        <Textarea v-model="input" :placeholder="placeholder" :class="[paneClass, mono ? '' : 'font-sans']" spellcheck="false" data-testid="tool-input" />
      </div>
      <div class="flex min-h-0 flex-col gap-2" :class="tab === 'output' ? '' : 'hidden lg:flex'">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label class="hidden lg:inline">{{ $t('common.output') }}</Label>
          <CopyButton class="ml-auto" :text="output" />
        </div>
        <Textarea :model-value="output" readonly :class="[paneClass, 'bg-muted/40 break-all', mono ? '' : 'font-sans']" data-testid="tool-output" />
      </div>
    </div>
    <ErrorAlert v-if="error" :message="error" />
  </div>
</template>
```

ConvertIO needs no API change — it already wraps TextIO.

- [ ] **Step 5: Run TextIO test + full unit suite**

```bash
yarn vitest run src/components/shared/TextIO.test.ts -v
yarn test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/textarea/Textarea.vue src/components/shared/TextIO.vue src/components/shared/TextIO.test.ts src/components/shared/ConvertIO.vue
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
feat(ui): responsive Textarea/TextIO heights with mobile tabs

EOF
)"
```

---

### Task 4: PdfPageCanvas container-fit width + touch/scroll

**Files:**
- Create: `src/components/shared/fitWidth.ts`
- Create: `src/components/shared/fitWidth.test.ts`
- Modify: `src/components/shared/PdfPageCanvas.vue`
- Consumers (re-verify in Task 6): `pdf-redact`, `pdf-editor`, `pdf-auto-redact`

**Interfaces:**
- Consumes: props `{ doc, page, width?: number, rotation?: number }` (default width 720)
- Produces: `fitWidth(propWidth: number, containerWidth: number): number` → `Math.max(1, Math.min(propWidth, Math.floor(containerWidth)))`; render uses fitted width; outer wrapper `overflow-auto`; prefer `touch-manipulation` over permanent `touch-none` so page scroll is not trapped outside the canvas

- [ ] **Step 1: Write the failing test**

```ts
// src/components/shared/fitWidth.test.ts
import { describe, expect, it } from 'vitest'
import { fitWidth } from './fitWidth'

describe('fitWidth', () => {
  it('caps prop width to container', () => {
    expect(fitWidth(680, 390)).toBe(390)
    expect(fitWidth(680, 900)).toBe(680)
    expect(fitWidth(720, 0)).toBe(1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/components/shared/fitWidth.test.ts -v`

Expected: FAIL — module not found.

- [ ] **Step 3: Implement helper**

```ts
// src/components/shared/fitWidth.ts
/** Render width in CSS px: never exceed the container, never below 1. */
export function fitWidth(propWidth: number, containerWidth: number): number {
  const cap = Number.isFinite(containerWidth) && containerWidth > 0 ? Math.floor(containerWidth) : propWidth
  return Math.max(1, Math.min(Math.floor(propWidth), cap))
}
```

- [ ] **Step 4: Run helper test**

Run: `yarn vitest run src/components/shared/fitWidth.test.ts -v`

Expected: PASS

- [ ] **Step 5: Wire PdfPageCanvas**

```ts
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { fitWidth } from './fitWidth'

const container = ref<HTMLDivElement | null>(null)
const containerW = ref(0)
useResizeObserver(container, (entries) => {
  containerW.value = entries[0]?.contentRect.width ?? 0
})
const renderWidth = computed(() => fitWidth(props.width, containerW.value || props.width))

watch(
  () => [props.doc, props.page, renderWidth.value, props.rotation] as const,
  async ([doc, n, width, rotation]) => {
    // existing render body, but use `width` (= renderWidth) instead of props.width
  },
  { immediate: true },
)
```

Template shell:

```vue
<div ref="container" class="w-full max-w-full overflow-auto overscroll-contain">
  <div
    ref="box"
    class="relative touch-manipulation select-none overflow-hidden border bg-white"
    :style="{ width: `${size.w * scale}px`, height: `${size.h * scale}px` }"
    @pointerdown="onDown"
    @pointermove="(e) => emit('move', pos(e))"
    @pointerup="(e) => emit('up', pos(e))"
  >
    <img v-if="src" :src="src" class="pointer-events-none absolute inset-0 h-full w-full" alt="" draggable="false" />
    <slot :scale="scale" />
  </div>
</div>
```

Keep `defineExpose({ scale })`. Prefer outer `overflow-auto` horizontal scroll over CSS-shrinking the bitmap (coordinate math depends on `scale`).

- [ ] **Step 6: Run related tests**

```bash
yarn vitest run src/components/shared/fitWidth.test.ts -v
yarn test
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/fitWidth.ts src/components/shared/fitWidth.test.ts src/components/shared/PdfPageCanvas.vue
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
feat(pdf): container-fit PdfPageCanvas width with scrollable shell

EOF
)"
```

---

### Task 5: SheetTable mobile hint / overflow

**Files:**
- Modify: `src/components/shared/SheetTable.vue`
- Modify: `src/i18n/locales/zh-CN.ts` (`common.scrollHint`)
- Modify: `src/i18n/locales/en.ts`
- Test: `src/components/shared/SheetTable.test.ts` (create)
- Beneficiaries: `csv-to-excel`, `excel-to-pdf`, `excel-viewer`, `pdf-to-excel`

**Interfaces:**
- Consumes: existing props `{ rows, limit?, header? }`
- Produces: hint `data-testid="sheet-scroll-hint"`; wrapper remains `overflow-auto`; height capped with `max-h-[min(32rem,60dvh)]`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/shared/SheetTable.test.ts
/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import SheetTable from './SheetTable.vue'
import en from '@/i18n/locales/en'
import zhCN from '@/i18n/locales/zh-CN'

describe('SheetTable', () => {
  it('renders a horizontal scroll hint', () => {
    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en, 'zh-CN': zhCN } })
    const w = mount(SheetTable, {
      props: { rows: [['A', 'B', 'C'], ['1', '2', '3']] },
      global: { plugins: [i18n] },
    })
    expect(w.find('[data-testid="sheet-scroll-hint"]').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run src/components/shared/SheetTable.test.ts -v`

Expected: FAIL

- [ ] **Step 3: Add i18n**

`zh-CN` `common.scrollHint`: `'可左右滑动查看表格'`

`en` `common.scrollHint`: `'Swipe horizontally to see more columns'`

- [ ] **Step 4: Implement hint**

```vue
<template>
  <div class="flex flex-col gap-1">
    <p data-testid="sheet-scroll-hint" class="text-muted-foreground text-xs md:hidden">{{ $t('common.scrollHint') }}</p>
    <div class="max-h-[min(32rem,60dvh)] overflow-auto rounded-md border">
      <table class="w-max min-w-full border-collapse text-sm">
        <!-- existing thead/tbody unchanged -->
      </table>
      <div v-if="rows.length > limit" class="text-muted-foreground p-2 text-xs">… {{ rows.length - limit }} more rows</div>
    </div>
  </div>
</template>
```

- [ ] **Step 5: Run tests**

```bash
yarn vitest run src/components/shared/SheetTable.test.ts -v
yarn test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/SheetTable.vue src/components/shared/SheetTable.test.ts src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
feat(ui): SheetTable mobile scroll hint and capped height

EOF
)"
```

---

### Task 6: Fix Broken PDF tools (pdf-redact, pdf-editor, pdf-auto-redact)

**Files:**
- Modify: `src/tools/pdf-redact/index.vue`
- Modify: `src/tools/pdf-editor/index.vue`
- Modify: `src/tools/pdf-auto-redact/index.vue`
- Note: `agent` Broken status is addressed in Task 2 (no further tool SFC work)

**Interfaces:**
- Consumes: Task 4 `PdfPageCanvas` container-fit
- Produces: stacked layout `<lg`; side panels `w-full min-w-0` (not sticky `min-w-60`/`min-w-64` on narrow); toolbars `flex-wrap`; primary Download buttons `min-h-11`

- [ ] **Step 1: Manual failing checklist (document before edit)**

At 390px with `./build.sh dev`, confirm current breakage:

1. `pdf-redact` — canvas wider than viewport; side panel `min-w-60` squeezes layout
2. `pdf-editor` — ModeToggle + pager overflow; inspector min-width issues
3. `pdf-auto-redact` — match list `min-w-64` + canvas side-by-side overflow

- [ ] **Step 2: Patch pdf-redact layout**

```vue
<div class="flex flex-col gap-4 lg:flex-row">
  <div class="min-w-0 max-w-full flex-1 overflow-auto">
    <PdfPageCanvas
      v-slot="{ scale }"
      :doc="doc"
      :page="page"
      :width="680"
      class="cursor-crosshair"
      @down="(p) => (start = p)"
      @move="move"
      @up="up"
    >
      <!-- overlays unchanged -->
    </PdfPageCanvas>
  </div>
  <div class="flex w-full min-w-0 flex-col gap-3 lg:w-60 lg:shrink-0">
    <!-- boxes list, dpi, color -->
    <Button class="min-h-11" :disabled="!rects.length || busy" @click="run">
      <Download /> {{ busy ? $t('common.processing') : $t('tools.pdf-redact.run') }}
    </Button>
  </div>
</div>
```

Pager buttons: `size="icon"` with `class="size-11 md:size-8"`.

- [ ] **Step 3: Patch pdf-editor layout**

Same stack for the `lg:flex-row` block. Wrap ModeToggle row with `flex flex-wrap items-center gap-2`. Inspector: `class="flex w-full min-w-0 flex-col gap-3 lg:w-72"`. Keep all tools (select/text/rect/whiteout/image) — degrade layout only.

- [ ] **Step 4: Patch pdf-auto-redact layout**

```vue
<div v-if="matches.length" class="flex flex-col gap-4 lg:flex-row">
  <ul class="max-h-[min(32rem,40dvh)] w-full min-w-0 overflow-auto text-sm lg:max-h-[32rem] lg:w-64 lg:shrink-0">
    <!-- items -->
  </ul>
  <div class="min-w-0 flex-1 overflow-auto">
    <PdfPageCanvas v-slot="{ scale }" :doc="doc" :page="previewPage" :width="560">
      <!-- overlays -->
    </PdfPageCanvas>
  </div>
</div>
```

Find/Run buttons: `class="min-h-11"`.

- [ ] **Step 5: Verify**

```bash
yarn lint
yarn test
```

Manual at 390px: upload a small PDF → draw/select → download for all three tools without trapped page-level horizontal scroll.

- [ ] **Step 6: Commit**

```bash
git add src/tools/pdf-redact/index.vue src/tools/pdf-editor/index.vue src/tools/pdf-auto-redact/index.vue
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
fix(pdf): stack broken redact/editor toolbars for mobile

EOF
)"
```

---

### Task 7: Sweep Partial — sidebar / dual-pane / notepad / image-editor / h500 leftovers

**Files:**
- Modify each listed tool `src/tools/<id>/index.vue`
- Modify: `src/components/shared/PdfPageGrid.vue`

**Interfaces:**
- Consumes: Task 3 height defaults
- Produces: `<lg` stacks; toolbars `flex-wrap`; no bare `grid-cols-4` without `grid-cols-2 sm:grid-cols-4`; no remaining fixed `h-[500px]` under `src/tools`

#### Batch A — `lg:grid-cols-[1fr_*]`

Exact ids: `css-unit-converter`, `image-editor`, `image-filters`, `pdf-crop`, `qr-code-generator`

- [ ] **Step 1: Harden sidebar grids**

Ensure each work area has `min-w-0 overflow-auto` on the canvas/preview column and `flex flex-wrap` on toolbars. For `image-editor` crop grid:

```vue
<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
```

For `qr-code-generator` (`lg:grid-cols-[1fr_auto]`): preview `max-w-full`.

#### Batch B — `md:grid-cols-[*]` asides

Exact ids: `notepad`, `color-converter`

- [ ] **Step 2: notepad + color-converter**

`notepad`:

```vue
<div class="grid gap-4 md:grid-cols-[14rem_1fr]">
  <aside class="flex max-h-48 flex-col gap-2 overflow-auto md:max-h-none">
    <div class="flex flex-wrap gap-2">...</div>
  </aside>
  <section v-if="active" class="flex min-w-0 flex-col gap-2">
    <div class="flex flex-wrap gap-2">...</div>
    <Textarea
      :model-value="active.body"
      class="min-h-[min(500px,45dvh)] h-[min(500px,45dvh)] font-sans text-base"
      ...
    />
  </section>
</div>
```

`color-converter`: swatch column `w-full` inside existing `md:grid-cols-[12rem_1fr]`.

#### Batch C — replace remaining direct `h-[500px]` in tool SFCs

Exact ids (36):  
`agent-instructions`, `agent-tool-def`, `base64`, `border-radius-generator`, `box-shadow-generator`, `case-converter`, `csv-to-excel`, `diff-checker`, `excel-to-csv`, `excel-to-json`, `gzip-tool`, `hash-generator`, `html-to-image`, `image-base64`, `json-formatter`, `json-viewer`, `lorem-ipsum`, `markdown-preview`, `mcp-config-builder`, `notepad`, `pptx-creator`, `prompt-injection-scanner`, `prompt-secret-redactor`, `random-name-picker`, `random-number-generator`, `regex-tester`, `svg-to-png`, `system-prompt-linter`, `text-size-calculator`, `token-counter`, `url-encoder`, `uuid-generator`, `word-counter`, `word-creator`, `word-to-markdown`, `word-to-text`

- [ ] **Step 3: Bulk-safe class replace inside those files only**

- `min-h-[500px] h-[500px]` → `min-h-[min(500px,45dvh)] h-[min(500px,45dvh)]`
- duplicate `min-h-[500px] min-h-[500px] h-[500px]` → same single responsive pair
- preview-only `min-h-[500px]` → `min-h-[min(500px,45dvh)]`

Do **not** change AgentComposer overrides.

Verify:

```bash
rg -n 'h-\[500px\]|min-h-\[500px\]' src/tools --glob '*.vue' | rg -v 'min\(500px'
```

Expected: no matches left under `src/tools`.

#### Batch D — PdfPageGrid + dual `lg:grid-cols-2`

Exact PdfPageGrid ids: `pdf-rotate`, `pdf-to-image`

- [ ] **Step 4: Densify PdfPageGrid**

```vue
<div class="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] sm:gap-3">
```

For dual-pane `lg:grid-cols-2` tools (`diff-checker`, `markdown-preview`, `html-to-image`, `regex-tester`, etc.): confirm they already stack below `lg`; add `min-w-0` on columns if overflow appears.

- [ ] **Step 5: Lint + test**

```bash
yarn lint
yarn test
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/tools src/components/shared/PdfPageGrid.vue
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
fix(ui): sweep Partial tool layouts for narrow screens

EOF
)"
```

---

### Task 8: Version bump 5.0.0 + rebuild Chrome zip

**Files:**
- Modify: `package.json`
- Modify: `chrome-extension/manifest.json`
- Modify: `vscode-extension/package.json`
- Generate: `chrome-extension/simpletools-chrome.zip`, `public/downloads/simpletools-chrome.zip` via `./build.sh chrome`

**Interfaces:**
- Consumes: none
- Produces: all three manifests report `5.0.0`; Chrome zip refreshed for in-app download modal

- [ ] **Step 1: Bump versions**

```bash
python3 - <<'PY'
import json
from pathlib import Path

def set_ver(path):
    p = Path(path)
    data = json.loads(p.read_text())
    data['version'] = '5.0.0'
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(path, '->', data['version'])

set_ver('package.json')
set_ver('chrome-extension/manifest.json')
set_ver('vscode-extension/package.json')
PY
```

- [ ] **Step 2: Confirm**

```bash
rg -n '"version"' package.json chrome-extension/manifest.json vscode-extension/package.json
```

Expected: all three show `"version": "5.0.0"`.

- [ ] **Step 3: Rebuild Chrome package**

```bash
./build.sh chrome
```

Expected: exits 0; updates `chrome-extension/simpletools-chrome.zip` and syncs `public/downloads/simpletools-chrome.zip`.

- [ ] **Step 4: Commit**

```bash
git add package.json chrome-extension/manifest.json vscode-extension/package.json chrome-extension/simpletools-chrome.zip public/downloads/simpletools-chrome.zip
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
chore: bump Web/Chrome/VS Code version to 5.0.0

EOF
)"
```

Do **not** push.

---

### Task 9: Verification checklist (390px) + lint/test/build

**Files:**
- None required (verification only). If failures found, fix in a follow-up commit naming the failing tool id.

**Interfaces:**
- Consumes: Tasks 1–8 deliverables
- Produces: green local gates + manual checklist evidence

- [ ] **Step 1: Automated gates**

```bash
./build.sh lint
./build.sh test
./build.sh build
```

Expected: all exit 0.

- [ ] **Step 2: Dev server at mobile width**

```bash
./build.sh dev
```

In browser DevTools, set viewport **390×844** (or 375×812).

- [ ] **Step 3: Shell checklist**

| # | Check | Pass? |
|---|-------|-------|
| 1 | Home loads; search + category chips wrap; no page-level horizontal scroll | |
| 2 | AppHeader shows More menu; locale/theme/extensions reachable | |
| 3 | Open `/tools/agent` (or `/agent` redirect): threads via drawer; delete visible; send reachable | |

- [ ] **Step 4: Sample OK tools** (spot-check ≥5)

`password-generator`, `http-status`, `coin-dice-roller`, `chmod-calculator`, `uuid-generator` — complete generate/copy main flow.

- [ ] **Step 5: Sample Partial tools** (spot-check ≥8)

| Tool | Pattern | Main flow |
|------|---------|-----------|
| `json-yaml` | TextIO/ConvertIO | convert + copy |
| `csv-json` | TextIO | convert |
| `excel-viewer` | SheetTable | open xlsx + scroll hint |
| `notepad` | md aside | create note + export |
| `image-editor` | lg sidebar + grid-cols-4 | rotate/export |
| `pdf-crop` | lg sidebar + canvas | crop download |
| `markdown-preview` | dual pane h500 | type + preview |
| `diff-checker` | dual pane | paste + diff |

- [ ] **Step 6: Former Broken tools**

| Tool | Main flow |
|------|-----------|
| `agent` | new thread → send (or missing-settings CTA) |
| `pdf-redact` | load PDF → draw box → download |
| `pdf-editor` | load PDF → add text → save |
| `pdf-auto-redact` | load PDF → find → download |

Hard-tool degradation OK if UI is simplified but download works.

- [ ] **Step 7: Regression scan**

```bash
rg -n 'h-\[500px\]|min-h-\[500px\]' src/components/shared src/components/ui/textarea src/tools --glob '*.vue'
rg -n 'opacity-0 group-hover:opacity-100' src/components/agent
rg -n '"version": "5.0.0"' package.json chrome-extension/manifest.json vscode-extension/package.json
```

Expected: no fixed 500px left (except intentional comments); no hover-only delete; versions 5.0.0.

- [ ] **Step 8: Final commit only if verification fixes were needed**

```bash
git add -A
git commit --author="linkxzhou <zhoulv2000@163.com>" -m "$(cat <<'EOF'
fix(ui): mobile verification follow-ups for 5.0.0

EOF
)"
```

If everything already green, **no empty commit**.

- [ ] **Step 9: Stop — do not push**

```bash
git status -sb
git log -5 --oneline
```

Confirm branch may be ahead of origin; do not `git push`.

---

## Self-Review

### 1. Spec coverage

| Spec requirement | Task |
|------------------|------|
| Narrow Web ≥375px; all 131 tools main flow | Tasks 1–7, 9 |
| Hard PDF/canvas may degrade UI | Task 6 |
| No PWA | Global Constraints |
| Shared-components-first | Tasks 3–5 before 6–7 |
| AppHeader overflow menu + touch ≥44px | Task 1 |
| Agent `<md` drawer + always-visible delete | Task 2 |
| TextIO/ConvertIO responsive heights / tabs | Task 3 |
| PdfPageCanvas container-fit + scroll/touch | Task 4 |
| SheetTable hint / overflow | Task 5 |
| Broken: agent + 3 PDF tools | Tasks 2, 6 |
| Sweep Partial by pattern with exact ids | Task 7 |
| Version 5.0.0 ×3 + `./build.sh chrome` | Task 8 |
| Verify at ~390px + lint/test/build | Task 9 |
| No push | Tasks 8–9 + Global Constraints |

### 2. Placeholder scan

No TBD / TODO / “similar to Task N” / “add appropriate error handling” left. Tool id lists are concrete from `src/tools/*/index.vue` audit. Code blocks show the actual class strings and file paths to edit.

### 3. Type / interface consistency

- i18n keys: `app.moreMenu`, `common.scrollHint`, `agent.openThreads`, `agent.closeThreads`
- Helper: `fitWidth(propWidth, containerWidth): number` in `src/components/shared/fitWidth.ts`
- TextIO mobile tabs: `data-testid="textio-tabs"`; panes still `tool-input` / `tool-output`
- Agent drawer: `data-testid="agent-thread-drawer"`; open button `agent-open-threads`
- Header more: `data-testid="header-more"`
- Versions: string `5.0.0` in three package manifests
- Breakpoints: Tailwind `md` for shell drawer/overflow; `lg` for dual-pane / sidebars (matches approved design)

### Known follow-ups (not blockers)

- Other locales besides zh-CN/en inherit new strings via `fallbackLocale: 'en'`.
- Optional dedicated shadcn `DropdownMenu` / `Sheet` components can replace the lightweight popover/drawer later; not required for 5.0.0.
- VS Code `.vsix` rebuild (`./build.sh vscode`) is optional for this plan; version field is bumped, zip rebuild is Chrome-only per outline.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-11-05-mobile-responsive-5.0.0.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks (`superpowers:subagent-driven-development`)
2. **Inline Execution** — execute tasks in-session with `superpowers:executing-plans` and checkpoints

Which approach?
