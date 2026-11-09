### Task 5: IndexedDBStore + settings persistence (TDD)

**Files:**
- Create: `src/agent/IndexedDBStore.ts`
- Create: `src/agent/settings.ts`
- Create: `src/agent/__tests__/settings.test.ts`
- Create: `src/agent/__tests__/IndexedDBStore.test.ts`
- Modify: `package.json` — add devDependency `fake-indexeddb` if missing
- Create: `src/agent/index.ts` barrel
- Create: `src/agent/PHASE2_NANO.md`

**Interfaces:**
- Consumes: `HistoryStore`, `SimpleChatConfig` types
- Produces:
  - `IndexedDBStore` / `indexedDbStore(storageKey)`
  - `AGENT_STORAGE_KEY = 'simpletools-agent'`
  - `PersistedAgentSettings`, `loadAgentSettings()`, `saveAgentSettings()`, `resolveAgentConfig()`
  - Barrel exports for UI/store

- [ ] **Step 1: Install test helper (if needed)**

```bash
yarn add -D fake-indexeddb
```

- [ ] **Step 2: Write settings failing test**

```ts
// src/agent/__tests__/settings.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import {
  AGENT_STORAGE_KEY,
  loadAgentSettings,
  saveAgentSettings,
  resolveAgentConfig,
  DEFAULT_AGENT_MODEL,
} from '../settings'

describe('agent settings', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips settings when rememberKey is true', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: 'gpt-4o-mini',
      systemPrompt: 'You are helpful.',
      rememberKey: true,
    })
    const loaded = loadAgentSettings()
    expect(loaded?.apiKey).toBe('sk-secret')
    expect(loaded?.model).toBe('gpt-4o-mini')

    const cfg = resolveAgentConfig()
    expect(cfg.apiBaseUrl).toBe('https://api.example.com/v1')
    expect(cfg.model).toBe('gpt-4o-mini')
    expect(cfg.provider).toBe('openai')
  })

  it('omits apiKey when rememberKey is false', () => {
    saveAgentSettings({
      apiBaseUrl: 'https://api.example.com/v1',
      apiKey: 'sk-secret',
      model: '',
      systemPrompt: '',
      rememberKey: false,
    })
    expect(loadAgentSettings()?.apiKey).toBeUndefined()
    expect(resolveAgentConfig().model).toBe(DEFAULT_AGENT_MODEL)
  })

  it('uses scoped storage key', () => {
    expect(AGENT_STORAGE_KEY).toBe('simpletools-agent')
  })
})
```

Vitest `environment` is `node` today — for `localStorage` / IndexedDB tests, either:
- set file-level `/** @vitest-environment jsdom */`, or
- add `happy-dom`/`jsdom` per-file pragma (jsdom already in package.json).

Use:

```ts
/** @vitest-environment jsdom */
```

at top of settings + IndexedDB test files.

- [ ] **Step 3: Implement settings**

```ts
// src/agent/settings.ts
import type { ChatProviderId, SimpleChatConfig } from './types'

export const AGENT_STORAGE_KEY = 'simpletools-agent'
export const AGENT_SETTINGS_LS_KEY = `${AGENT_STORAGE_KEY}:settings`
/** Sensible default; user overrides in Settings Dialog */
export const DEFAULT_AGENT_MODEL = 'gpt-4o-mini'

export interface PersistedAgentSettings {
  apiBaseUrl?: string
  apiKey?: string
  model?: string
  systemPrompt?: string
  rememberKey?: boolean
}

export function loadAgentSettings(): PersistedAgentSettings | null {
  try {
    if (typeof localStorage === 'undefined') return null
    const raw = localStorage.getItem(AGENT_SETTINGS_LS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedAgentSettings
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

export function saveAgentSettings(settings: PersistedAgentSettings): void {
  try {
    if (typeof localStorage === 'undefined') return
    const payload: PersistedAgentSettings = {
      apiBaseUrl: settings.apiBaseUrl ?? '',
      model: settings.model ?? '',
      systemPrompt: settings.systemPrompt ?? '',
      rememberKey: !!settings.rememberKey,
    }
    if (payload.rememberKey && settings.apiKey) {
      payload.apiKey = settings.apiKey
    }
    localStorage.setItem(AGENT_SETTINGS_LS_KEY, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

function nonEmpty(v: unknown): string {
  return v == null ? '' : String(v).trim()
}

export function resolveAgentConfig(
  override?: Partial<PersistedAgentSettings>,
): SimpleChatConfig {
  const stored = loadAgentSettings()
  const apiKey =
    nonEmpty(override?.apiKey) ||
    (stored?.rememberKey ? nonEmpty(stored.apiKey) : '') ||
    ''
  return {
    apiBaseUrl:
      nonEmpty(override?.apiBaseUrl) || nonEmpty(stored?.apiBaseUrl) || '',
    apiKey,
    model:
      nonEmpty(override?.model) ||
      nonEmpty(stored?.model) ||
      DEFAULT_AGENT_MODEL,
    systemPrompt:
      nonEmpty(override?.systemPrompt) || nonEmpty(stored?.systemPrompt) || '',
    provider: 'openai' satisfies ChatProviderId,
    maxToolRounds: 5,
    maxMessages: 40,
  }
}
```

- [ ] **Step 4: Port IndexedDBStore**

Copy SimpleChat `IndexedDBStore.ts` → `src/agent/IndexedDBStore.ts`. Change default DB prefix:

```ts
constructor(storageKey = AGENT_STORAGE_KEY) {
  this.dbPromise = openDb(`simpletools-agent:${storageKey}`)
}
```

Import `AGENT_STORAGE_KEY` from `./settings` or hardcode `'simpletools-agent'` to avoid cycles — prefer hardcoding DB name `'simpletools-agent'` and keep settings key separate.

IndexedDB test sketch:

```ts
/** @vitest-environment jsdom */
import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { IndexedDBStore } from '../IndexedDBStore'

describe('IndexedDBStore', () => {
  it('persists threads and messages', async () => {
    const store = new IndexedDBStore('test')
    await store.upsertThread({
      id: 't1',
      title: 'A',
      createdAt: 1,
      updatedAt: 2,
    })
    await store.appendMessage({
      id: 'm1',
      threadId: 't1',
      role: 'user',
      content: 'hi',
      createdAt: 3,
      status: 'done',
    })
    expect((await store.listThreads())[0]?.title).toBe('A')
    expect((await store.getMessages('t1'))[0]?.content).toBe('hi')
    await store.deleteThread('t1')
    expect(await store.listThreads()).toHaveLength(0)
  })
})
```

- [ ] **Step 5: Barrel + Phase2 stub**

```ts
// src/agent/index.ts
export * from './types'
export { MemoryStore } from './MemoryStore'
export { IndexedDBStore, indexedDbStore } from './IndexedDBStore'
export { ToolRegistry } from './ToolRegistry'
export { ChatEngine, createChatClient, type ChatEngineOptions } from './ChatEngine'
export { parseSSEStream, mergeToolCallDeltas } from './sse'
export { parseToolArguments } from './parseToolArgs'
export { normalizeSecret } from './normalizeSecret'
export {
  AGENT_STORAGE_KEY,
  AGENT_SETTINGS_LS_KEY,
  DEFAULT_AGENT_MODEL,
  loadAgentSettings,
  saveAgentSettings,
  resolveAgentConfig,
  type PersistedAgentSettings,
} from './settings'
export { OpenAICompatProvider, isChatProviderId } from './providers'
export type { ChatProvider, ChatProviderId, OpenAICompatMessage } from './providers'
```

```md
<!-- src/agent/PHASE2_NANO.md -->
# Phase 2 — Chrome Built-in AI (Gemini Nano)

Out of scope for BYOK HostTool P1.

Planned reuse:
- `ChatProviderId = 'chrome-ai'`
- Port SimpleChat `ChromeAiProvider` into `src/agent/providers/ChromeAiProvider.ts`
- `ChatEngine.getProvider()` switches when `config.provider === 'chrome-ai'`
- Tools remain disabled on Nano (`supportsTools === false`), matching SimpleChat v1

No tasks in the P1 plan implement this file.
```

- [ ] **Step 6: Run tests + commit**

```bash
yarn test src/agent/__tests__/settings.test.ts src/agent/__tests__/IndexedDBStore.test.ts
git add package.json yarn.lock src/agent/IndexedDBStore.ts src/agent/settings.ts src/agent/index.ts src/agent/PHASE2_NANO.md src/agent/__tests__/settings.test.ts src/agent/__tests__/IndexedDBStore.test.ts
git commit -m "feat(agent): add IndexedDB history and localStorage settings"
```

---

