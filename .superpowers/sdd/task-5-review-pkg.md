# Review package Task 5
BASE: c3e47fbd880ff1fd4e92d48f2fe978d51254237b
HEAD: 0b5a694acf6e6c558e7bb26eb0cb1cb8af9bda2a

## Commits
0b5a694 feat(agent): add IndexedDB history and localStorage settings

## Stat
 package.json                               |   1 +
 src/agent/IndexedDBStore.ts                | 104 +++++++++++++++++++++++++++++
 src/agent/PHASE2_NANO.md                   |  11 +++
 src/agent/__tests__/IndexedDBStore.test.ts |  28 ++++++++
 src/agent/__tests__/settings.test.ts       |  49 ++++++++++++++
 src/agent/index.ts                         |  19 ++++++
 src/agent/settings.ts                      |  72 ++++++++++++++++++++
 yarn.lock                                  |   8 +++
 8 files changed, 292 insertions(+)

## Diff
diff --git a/package.json b/package.json
index 305854d..ae49444 100644
--- a/package.json
+++ b/package.json
@@ -63,20 +63,21 @@
     "@tailwindcss/vite": "^4.3.3",
     "@types/node": "^26.6.5",
     "@types/papaparse": "^5.5.2",
     "@types/qrcode": "^1.5.6",
     "@types/turndown": "^5.0.6",
     "@vitejs/plugin-vue": "^6.0.10",
     "@vue/eslint-config-typescript": "^14.9.0",
     "@vue/test-utils": "^2.5.1",
     "eslint": "^10.13.0",
     "eslint-plugin-vue": "^10.11.1",
+    "fake-indexeddb": "^6.2.7",
     "globals": "^17.13.0",
     "jiti": "^2.7.0",
     "jsdom": "^30.1.3",
     "tailwindcss": "^4.3.3",
     "tw-animate-css": "^1.4.0",
     "typescript": "~5.9.0",
     "typescript-eslint": "^8.71.2",
     "vite": "^8.3.4",
     "vitest": "^5.0.5",
     "vue-tsc": "^3.3.13"
diff --git a/src/agent/IndexedDBStore.ts b/src/agent/IndexedDBStore.ts
new file mode 100644
index 0000000..c835e80
--- /dev/null
+++ b/src/agent/IndexedDBStore.ts
@@ -0,0 +1,104 @@
+import type { ChatMessage, ChatThread, HistoryStore } from './types'
+
+const DB_VERSION = 1
+const DB_NAME_PREFIX = 'simpletools-agent'
+
+function openDb(dbName: string): Promise<IDBDatabase> {
+  return new Promise((resolve, reject) => {
+    const req = indexedDB.open(dbName, DB_VERSION)
+    req.onupgradeneeded = () => {
+      const db = req.result
+      if (!db.objectStoreNames.contains('threads')) {
+        db.createObjectStore('threads', { keyPath: 'id' })
+      }
+      if (!db.objectStoreNames.contains('messages')) {
+        const store = db.createObjectStore('messages', { keyPath: 'id' })
+        store.createIndex('byThread', 'threadId', { unique: false })
+      }
+    }
+    req.onsuccess = () => resolve(req.result)
+    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
+  })
+}
+
+function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
+  return new Promise((resolve, reject) => {
+    req.onsuccess = () => resolve(req.result)
+    req.onerror = () => reject(req.error ?? new Error('IDB request failed'))
+  })
+}
+
+export class IndexedDBStore implements HistoryStore {
+  private dbPromise: Promise<IDBDatabase>
+
+  /** storageKey scopes the DB; default matches AGENT_STORAGE_KEY without importing settings. */
+  constructor(storageKey = DB_NAME_PREFIX) {
+    this.dbPromise = openDb(`${DB_NAME_PREFIX}:${storageKey}`)
+  }
+
+  private async db(): Promise<IDBDatabase> {
+    return this.dbPromise
+  }
+
+  async listThreads(): Promise<ChatThread[]> {
+    const db = await this.db()
+    const tx = db.transaction('threads', 'readonly')
+    const all = await reqToPromise(tx.objectStore('threads').getAll())
+    return (all as ChatThread[]).sort((a, b) => b.updatedAt - a.updatedAt)
+  }
+
+  async getMessages(threadId: string): Promise<ChatMessage[]> {
+    const db = await this.db()
+    const tx = db.transaction('messages', 'readonly')
+    const idx = tx.objectStore('messages').index('byThread')
+    const all = await reqToPromise(idx.getAll(threadId))
+    return (all as ChatMessage[]).sort((a, b) => a.createdAt - b.createdAt)
+  }
+
+  async upsertThread(t: ChatThread): Promise<void> {
+    const db = await this.db()
+    const tx = db.transaction('threads', 'readwrite')
+    await reqToPromise(tx.objectStore('threads').put(t))
+  }
+
+  async appendMessage(m: ChatMessage): Promise<void> {
+    const db = await this.db()
+    const tx = db.transaction('messages', 'readwrite')
+    await reqToPromise(tx.objectStore('messages').put(m))
+  }
+
+  async updateMessage(m: ChatMessage): Promise<void> {
+    const db = await this.db()
+    const tx = db.transaction('messages', 'readwrite')
+    await reqToPromise(tx.objectStore('messages').put(m))
+  }
+
+  async deleteThread(id: string): Promise<void> {
+    const db = await this.db()
+    const msgs = await this.getMessages(id)
+    const tx = db.transaction(['threads', 'messages'], 'readwrite')
+    tx.objectStore('threads').delete(id)
+    for (const m of msgs) {
+      tx.objectStore('messages').delete(m.id)
+    }
+    await new Promise<void>((resolve, reject) => {
+      tx.oncomplete = () => resolve()
+      tx.onerror = () => reject(tx.error ?? new Error('delete failed'))
+    })
+  }
+
+  async clearAll(): Promise<void> {
+    const db = await this.db()
+    const tx = db.transaction(['threads', 'messages'], 'readwrite')
+    tx.objectStore('threads').clear()
+    tx.objectStore('messages').clear()
+    await new Promise<void>((resolve, reject) => {
+      tx.oncomplete = () => resolve()
+      tx.onerror = () => reject(tx.error ?? new Error('clear failed'))
+    })
+  }
+}
+
+export function indexedDbStore(storageKey = DB_NAME_PREFIX): IndexedDBStore {
+  return new IndexedDBStore(storageKey)
+}
diff --git a/src/agent/PHASE2_NANO.md b/src/agent/PHASE2_NANO.md
new file mode 100644
index 0000000..e4d9258
--- /dev/null
+++ b/src/agent/PHASE2_NANO.md
@@ -0,0 +1,11 @@
+# Phase 2 — Chrome Built-in AI (Gemini Nano)
+
+Out of scope for BYOK HostTool P1.
+
+Planned reuse:
+- `ChatProviderId = 'chrome-ai'`
+- Port SimpleChat `ChromeAiProvider` into `src/agent/providers/ChromeAiProvider.ts`
+- `ChatEngine.getProvider()` switches when `config.provider === 'chrome-ai'`
+- Tools remain disabled on Nano (`supportsTools === false`), matching SimpleChat v1
+
+No tasks in the P1 plan implement this file.
diff --git a/src/agent/__tests__/IndexedDBStore.test.ts b/src/agent/__tests__/IndexedDBStore.test.ts
new file mode 100644
index 0000000..d5676b1
--- /dev/null
+++ b/src/agent/__tests__/IndexedDBStore.test.ts
@@ -0,0 +1,28 @@
+/** @vitest-environment jsdom */
+import 'fake-indexeddb/auto'
+import { describe, expect, it } from 'vitest'
+import { IndexedDBStore } from '../IndexedDBStore'
+
+describe('IndexedDBStore', () => {
+  it('persists threads and messages', async () => {
+    const store = new IndexedDBStore('test')
+    await store.upsertThread({
+      id: 't1',
+      title: 'A',
+      createdAt: 1,
+      updatedAt: 2,
+    })
+    await store.appendMessage({
+      id: 'm1',
+      threadId: 't1',
+      role: 'user',
+      content: 'hi',
+      createdAt: 3,
+      status: 'done',
+    })
+    expect((await store.listThreads())[0]?.title).toBe('A')
+    expect((await store.getMessages('t1'))[0]?.content).toBe('hi')
+    await store.deleteThread('t1')
+    expect(await store.listThreads()).toHaveLength(0)
+  })
+})
diff --git a/src/agent/__tests__/settings.test.ts b/src/agent/__tests__/settings.test.ts
new file mode 100644
index 0000000..963e113
--- /dev/null
+++ b/src/agent/__tests__/settings.test.ts
@@ -0,0 +1,49 @@
+/** @vitest-environment jsdom */
+import { beforeEach, describe, expect, it } from 'vitest'
+import {
+  AGENT_STORAGE_KEY,
+  loadAgentSettings,
+  saveAgentSettings,
+  resolveAgentConfig,
+  DEFAULT_AGENT_MODEL,
+} from '../settings'
+
+describe('agent settings', () => {
+  beforeEach(() => {
+    localStorage.clear()
+  })
+
+  it('round-trips settings when rememberKey is true', () => {
+    saveAgentSettings({
+      apiBaseUrl: 'https://api.example.com/v1',
+      apiKey: 'sk-secret',
+      model: 'gpt-4o-mini',
+      systemPrompt: 'You are helpful.',
+      rememberKey: true,
+    })
+    const loaded = loadAgentSettings()
+    expect(loaded?.apiKey).toBe('sk-secret')
+    expect(loaded?.model).toBe('gpt-4o-mini')
+
+    const cfg = resolveAgentConfig()
+    expect(cfg.apiBaseUrl).toBe('https://api.example.com/v1')
+    expect(cfg.model).toBe('gpt-4o-mini')
+    expect(cfg.provider).toBe('openai')
+  })
+
+  it('omits apiKey when rememberKey is false', () => {
+    saveAgentSettings({
+      apiBaseUrl: 'https://api.example.com/v1',
+      apiKey: 'sk-secret',
+      model: '',
+      systemPrompt: '',
+      rememberKey: false,
+    })
+    expect(loadAgentSettings()?.apiKey).toBeUndefined()
+    expect(resolveAgentConfig().model).toBe(DEFAULT_AGENT_MODEL)
+  })
+
+  it('uses scoped storage key', () => {
+    expect(AGENT_STORAGE_KEY).toBe('simpletools-agent')
+  })
+})
diff --git a/src/agent/index.ts b/src/agent/index.ts
new file mode 100644
index 0000000..6b7fc70
--- /dev/null
+++ b/src/agent/index.ts
@@ -0,0 +1,19 @@
+export * from './types'
+export { MemoryStore } from './MemoryStore'
+export { IndexedDBStore, indexedDbStore } from './IndexedDBStore'
+export { ToolRegistry } from './ToolRegistry'
+export { ChatEngine, createChatClient, type ChatEngineOptions } from './ChatEngine'
+export { parseSSEStream, mergeToolCallDeltas } from './sse'
+export { parseToolArguments } from './parseToolArgs'
+export { normalizeSecret } from './normalizeSecret'
+export {
+  AGENT_STORAGE_KEY,
+  AGENT_SETTINGS_LS_KEY,
+  DEFAULT_AGENT_MODEL,
+  loadAgentSettings,
+  saveAgentSettings,
+  resolveAgentConfig,
+  type PersistedAgentSettings,
+} from './settings'
+export { OpenAICompatProvider, isChatProviderId } from './providers'
+export type { ChatProvider, ChatProviderId, OpenAICompatMessage } from './providers'
diff --git a/src/agent/settings.ts b/src/agent/settings.ts
new file mode 100644
index 0000000..3d94325
--- /dev/null
+++ b/src/agent/settings.ts
@@ -0,0 +1,72 @@
+import type { ChatProviderId, SimpleChatConfig } from './types'
+
+export const AGENT_STORAGE_KEY = 'simpletools-agent'
+export const AGENT_SETTINGS_LS_KEY = `${AGENT_STORAGE_KEY}:settings`
+/** Sensible default; user overrides in Settings Dialog */
+export const DEFAULT_AGENT_MODEL = 'gpt-4o-mini'
+
+export interface PersistedAgentSettings {
+  apiBaseUrl?: string
+  apiKey?: string
+  model?: string
+  systemPrompt?: string
+  rememberKey?: boolean
+}
+
+export function loadAgentSettings(): PersistedAgentSettings | null {
+  try {
+    if (typeof localStorage === 'undefined') return null
+    const raw = localStorage.getItem(AGENT_SETTINGS_LS_KEY)
+    if (!raw) return null
+    const parsed = JSON.parse(raw) as PersistedAgentSettings
+    return parsed && typeof parsed === 'object' ? parsed : null
+  } catch {
+    return null
+  }
+}
+
+export function saveAgentSettings(settings: PersistedAgentSettings): void {
+  try {
+    if (typeof localStorage === 'undefined') return
+    const payload: PersistedAgentSettings = {
+      apiBaseUrl: settings.apiBaseUrl ?? '',
+      model: settings.model ?? '',
+      systemPrompt: settings.systemPrompt ?? '',
+      rememberKey: !!settings.rememberKey,
+    }
+    if (payload.rememberKey && settings.apiKey) {
+      payload.apiKey = settings.apiKey
+    }
+    localStorage.setItem(AGENT_SETTINGS_LS_KEY, JSON.stringify(payload))
+  } catch {
+    /* quota / private mode */
+  }
+}
+
+function nonEmpty(v: unknown): string {
+  return v == null ? '' : String(v).trim()
+}
+
+export function resolveAgentConfig(
+  override?: Partial<PersistedAgentSettings>,
+): SimpleChatConfig {
+  const stored = loadAgentSettings()
+  const apiKey =
+    nonEmpty(override?.apiKey) ||
+    (stored?.rememberKey ? nonEmpty(stored.apiKey) : '') ||
+    ''
+  return {
+    apiBaseUrl:
+      nonEmpty(override?.apiBaseUrl) || nonEmpty(stored?.apiBaseUrl) || '',
+    apiKey,
+    model:
+      nonEmpty(override?.model) ||
+      nonEmpty(stored?.model) ||
+      DEFAULT_AGENT_MODEL,
+    systemPrompt:
+      nonEmpty(override?.systemPrompt) || nonEmpty(stored?.systemPrompt) || '',
+    provider: 'openai' satisfies ChatProviderId,
+    maxToolRounds: 5,
+    maxMessages: 40,
+  }
+}
diff --git a/yarn.lock b/yarn.lock
index 4de9e3a..1f5507f 100644
--- a/yarn.lock
+++ b/yarn.lock
@@ -2933,20 +2933,27 @@ __metadata:
   languageName: node
   linkType: hard
 
 "exsolve@npm:^1.1.1":
   version: 1.1.3
   resolution: "exsolve@npm:1.1.3"
   checksum: 10c0/6359d8b6cc1ed9c48efadfe67cc434dcbc01bc727f14a0c899696c5bbd95202089cf6105a738c7fb0fd2ee62d5181842c8c098e63f185647832a631a50badf81
   languageName: node
   linkType: hard
 
+"fake-indexeddb@npm:^6.2.7":
+  version: 6.2.7
+  resolution: "fake-indexeddb@npm:6.2.7"
+  checksum: 10c0/634bf90ba77ffd834a347661a6f7a6dc00d97b18ae49d49e437d454a42b9250dfe92144799605255b25428df577349b9195d0c150df3507edc003e26120f81ae
+  languageName: node
+  linkType: hard
+
 "fast-csv@npm:^4.3.1":
   version: 4.3.6
   resolution: "fast-csv@npm:4.3.6"
   dependencies:
     "@fast-csv/format": "npm:4.3.5"
     "@fast-csv/parse": "npm:4.3.6"
   checksum: 10c0/45118395a75dbb4fb3a074ee76f03abefe8414accbde6613ec3f326c3fef7098b8dc6297de65b6f15755f7520079aac58249cc939010033285161af8b1e007c9
   languageName: node
   linkType: hard
 
@@ -5541,20 +5548,21 @@ __metadata:
     "@vueuse/core": "npm:^15.0.0"
     class-variance-authority: "npm:^0.7.1"
     clsx: "npm:^2.1.1"
     cron-parser: "npm:^5.10.2"
     diff: "npm:^9.0.0"
     docx: "npm:^9.12.0"
     dompurify: "npm:^3.4.17"
     eslint: "npm:^10.13.0"
     eslint-plugin-vue: "npm:^10.11.1"
     exceljs: "npm:^4.4.0"
+    fake-indexeddb: "npm:^6.2.7"
     fast-xml-parser: "npm:^5.11.2"
     fflate: "npm:^0.8.3"
     globals: "npm:^17.13.0"
     gpt-tokenizer: "npm:^4.1.0"
     html-to-image: "npm:^1.11.13"
     jiti: "npm:^2.7.0"
     jsdom: "npm:^30.1.3"
     lucide-vue-next: "npm:^1.0.0"
     mammoth: "npm:^1.13.0"
     marked: "npm:^18.1.1"
