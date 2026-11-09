# Final branch review package
MERGE_BASE: a1d427fd0564959e3bd71c4a5f53ec7f6b4369a2
HEAD: 48237293e5232c91180a7f74bfd80373fbdad9aa

## Commits
4823729 fix(agent): chrome BYOK host-permission warning and HostTool args typing
0c06712 docs(agent): note BYOK chrome host-permission constraint
78a0f5a fix(agent): i18n role labels and restore composer draft
7834791 feat(agent): add chat UI threads messages composer settings
3a31e12 feat(agent): add /agent route, header entry, and i18n
f7a06f0 fix(agent): stop abort UX and reduce stream message refreshes
fd6c98b feat(agent): add Pinia agent store wiring ChatEngine
180a780 test(agent): cover open_tool reject and token-counter HostTool
2a15723 feat(agent): add HostTools list_tools open_tool run_offline_tool
0b5a694 feat(agent): add IndexedDB history and localStorage settings
c3e47fb feat(agent): add ChatEngine with streaming tool loop
8dac170 feat(agent): add SSE parser and OpenAICompatProvider
fc661a4 feat(agent): add ToolRegistry and parseToolArgs
d5e0bce feat(agent): add chat types and MemoryStore

## Stat
 README.md                                        |   1 +
 README_EN.md                                     |   1 +
 chrome-extension/README.md                       |   5 +
 package.json                                     |   1 +
 src/App.vue                                      |  19 +-
 src/agent/ChatEngine.ts                          | 354 +++++++++++++++++++++++
 src/agent/IndexedDBStore.ts                      | 104 +++++++
 src/agent/MemoryStore.ts                         |  42 +++
 src/agent/PHASE2_NANO.md                         |  11 +
 src/agent/ToolRegistry.ts                        |  72 +++++
 src/agent/__tests__/ChatEngine.test.ts           | 209 +++++++++++++
 src/agent/__tests__/IndexedDBStore.test.ts       |  28 ++
 src/agent/__tests__/OpenAICompatProvider.test.ts |  42 +++
 src/agent/__tests__/ToolRegistry.test.ts         |  41 +++
 src/agent/__tests__/hostTools.test.ts            |  98 +++++++
 src/agent/__tests__/settings.test.ts             |  49 ++++
 src/agent/__tests__/sse.test.ts                  |  35 +++
 src/agent/__tests__/types.test.ts                |  43 +++
 src/agent/hostTools/createHostTools.ts           | 131 +++++++++
 src/agent/hostTools/index.ts                     |   6 +
 src/agent/hostTools/whitelist.ts                 |  11 +
 src/agent/index.ts                               |  22 ++
 src/agent/normalizeSecret.ts                     |  30 ++
 src/agent/parseToolArgs.ts                       | 146 ++++++++++
 src/agent/providers/OpenAICompatProvider.ts      |  70 +++++
 src/agent/providers/index.ts                     |   9 +
 src/agent/providers/types.ts                     |  35 +++
 src/agent/settings.ts                            |  72 +++++
 src/agent/sse.ts                                 |  77 +++++
 src/agent/types.ts                               |  86 ++++++
 src/components/agent/AgentComposer.vue           |  66 +++++
 src/components/agent/AgentMarkdown.vue           |  17 ++
 src/components/agent/AgentMessage.vue            |  93 ++++++
 src/components/agent/AgentMessageList.vue        |  45 +++
 src/components/agent/AgentSettingsDialog.vue     | 112 +++++++
 src/components/agent/AgentThreadList.vue         |  43 +++
 src/components/layout/AppHeader.vue              |  32 +-
 src/i18n/locales/de.ts                           |  32 +-
 src/i18n/locales/en.ts                           |  30 ++
 src/i18n/locales/es.ts                           |  32 +-
 src/i18n/locales/fr.ts                           |  32 +-
 src/i18n/locales/ja.ts                           |  32 +-
 src/i18n/locales/ko.ts                           |  32 +-
 src/i18n/locales/pt-BR.ts                        |  32 +-
 src/i18n/locales/zh-CN.ts                        |  30 ++
 src/pages/AgentPage.vue                          |  51 ++++
 src/router/index.ts                              |   7 +
 src/stores/agent.ts                              | 204 +++++++++++++
 yarn.lock                                        |   8 +
 49 files changed, 2768 insertions(+), 12 deletions(-)

## Diff
diff --git a/README.md b/README.md
index a097992..aa57a8d 100644
--- a/README.md
+++ b/README.md
@@ -25,10 +25,11 @@
 - **125 个工具**（以 `src/registry` 注册表为准，非 `src/tools` 目录计数）
 - **中英双语**界面，语言与主题（亮/暗）本地持久化
 - **注册表驱动**：搜索、分类、收藏、最近使用、按工具代码分割
 - **纯前端 / 可离线**：无业务后端；文件在浏览器内处理并下载
 - 技术栈：Vue 3、Vite、TypeScript、Tailwind CSS 4、shadcn-vue（reka-ui）、vue-i18n、Pinia、Yarn 4
+- **Agent（BYOK，实验）**：应用内 `/agent` 自带密钥的 OpenAI 兼容对话 + HostTools；密钥仅存本机。Chrome 插件版暂无 host 权限，扩展内直连云端 API 可能失败（优先网页版）。
 
 ## 工具分类
 
 | 分类 | 数量 | 说明 |
 |---|---:|---|
diff --git a/README_EN.md b/README_EN.md
index fe0cc08..5891d1b 100644
--- a/README_EN.md
+++ b/README_EN.md
@@ -25,10 +25,11 @@ Repository: https://github.com/SimpleAI2026/SimpleTools
 - **125 tools** (counted from the `src/registry` registry, not from `src/tools` folder count)
 - **Bilingual** UI (Chinese / English), with persisted locale and light/dark theme
 - **Registry-driven** search, categories, favorites, recent tools, and per-tool code splitting
 - **No backend**: files are processed locally and downloaded from the browser
 - Stack: Vue 3, Vite, TypeScript, Tailwind CSS 4, shadcn-vue (reka-ui), vue-i18n, Pinia, Yarn 4
+- **Agent (BYOK, experimental):** in-app `/agent` OpenAI-compatible chat with your own key + HostTools; keys stay on-device. The Chrome extension has no host permissions yet, so direct cloud API calls may fail (prefer the web build).
 
 ## Categories
 
 | Category | Count | Examples |
 |---|---:|---|
diff --git a/chrome-extension/README.md b/chrome-extension/README.md
index 7deb765..3584557 100644
--- a/chrome-extension/README.md
+++ b/chrome-extension/README.md
@@ -27,5 +27,10 @@
 ## 说明
 
 - `permissions` 为空；仅访问扩展自身 `chrome-extension://` 页面
 - SPA 使用相对路径 `base: './'` + **Hash 路由**（`VITE_ROUTER_MODE=hash`）
 - 图标由 `public/favicon.svg` 生成（16 / 32 / 48 / 128）
+
+## Agent（BYOK，实验）
+
+应用内路由 `/agent` 提供自带密钥的 OpenAI 兼容对话，并可调用 HostTools 打开/运行白名单离线工具。
+密钥仅存本机。Chrome 插件版暂未申请 host 权限，扩展内直连云端 API 可能失败；请优先用网页版或等待后续 optional host permissions。
diff --git a/package.json b/package.json
index 305854d..ae49444 100644
--- a/package.json
+++ b/package.json
@@ -68,10 +68,11 @@
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
diff --git a/src/App.vue b/src/App.vue
index 388b71c..e00abcb 100644
--- a/src/App.vue
+++ b/src/App.vue
@@ -1,18 +1,31 @@
 <script setup lang="ts">
+import { computed } from 'vue'
+import { useRoute } from 'vue-router'
 import AppHeader from '@/components/layout/AppHeader.vue'
 import { useSettingsStore } from '@/stores/settings'
 
 useSettingsStore()
+const route = useRoute()
+const isAgent = computed(() => route.name === 'agent')
 </script>
 
 <template>
-  <div class="min-h-screen">
+  <div class="min-h-screen" :class="isAgent ? 'flex h-dvh flex-col overflow-hidden' : ''">
     <AppHeader />
-    <main class="mx-auto w-full max-w-6xl px-4 py-6">
+    <main
+      :class="
+        isAgent
+          ? 'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-0 sm:px-4'
+          : 'mx-auto w-full max-w-6xl px-4 py-6'
+      "
+    >
       <RouterView />
     </main>
-    <footer class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs">
+    <footer
+      v-if="!isAgent"
+      class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs"
+    >
       {{ $t('app.privacy') }}
     </footer>
   </div>
 </template>
diff --git a/src/agent/ChatEngine.ts b/src/agent/ChatEngine.ts
new file mode 100644
index 0000000..e62c19f
--- /dev/null
+++ b/src/agent/ChatEngine.ts
@@ -0,0 +1,354 @@
+import { ToolRegistry } from './ToolRegistry'
+import { MemoryStore } from './MemoryStore'
+import {
+  createId,
+  type ChatEvent,
+  type ChatMessage,
+  type ChatThread,
+  type HistoryStore,
+  type HostTool,
+  type SimpleChatConfig,
+  type ToolCall,
+  type ChatProviderId,
+} from './types'
+import { mergeToolCallDeltas, type AccumulatedToolCall } from './sse'
+import { OpenAICompatProvider } from './providers/OpenAICompatProvider'
+import type { ChatProvider, OpenAICompatMessage } from './providers/types'
+import { isChatProviderId } from './providers/types'
+
+export interface ChatEngineOptions {
+  config: SimpleChatConfig
+  store?: HistoryStore
+  storageKey?: string
+  fetchImpl?: typeof fetch
+  /** Optional override; otherwise resolved from config.provider. */
+  provider?: ChatProvider
+}
+
+interface CompletionResult {
+  finishReason: string | null
+  toolCalls: ToolCall[]
+  assistantMessage: ChatMessage
+}
+
+export class ChatEngine {
+  config: SimpleChatConfig
+  readonly tools = new ToolRegistry()
+  readonly store: HistoryStore
+  private fetchImpl: typeof fetch
+  private abort: AbortController | null = null
+  private listeners = new Set<(ev: ChatEvent) => void>()
+  private openaiProvider: OpenAICompatProvider
+  private injectedProvider: ChatProvider | null = null
+  currentThreadId: string | null = null
+
+  constructor(opts: ChatEngineOptions) {
+    this.config = { ...opts.config }
+    this.store = opts.store ?? new MemoryStore()
+    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis)
+    this.openaiProvider = new OpenAICompatProvider(this.fetchImpl)
+    this.injectedProvider = opts.provider ?? null
+  }
+
+  on(listener: (ev: ChatEvent) => void): () => void {
+    this.listeners.add(listener)
+    return () => this.listeners.delete(listener)
+  }
+
+  private emit(ev: ChatEvent): void {
+    for (const l of this.listeners) l(ev)
+  }
+
+  updateConfig(partial: Partial<SimpleChatConfig>): void {
+    this.config = { ...this.config, ...partial }
+  }
+
+  /** Active provider id (openai | chrome-ai). Phase1 defaults to openai. */
+  getProviderId(): ChatProviderId {
+    const p = this.config.provider
+    if (isChatProviderId(p)) return p
+    return 'openai'
+  }
+
+  getProvider(): ChatProvider {
+    if (this.injectedProvider) return this.injectedProvider
+    // Phase2: switch on this.getProviderId() === 'chrome-ai'
+    return this.openaiProvider
+  }
+
+  registerTool(tool: HostTool): void {
+    this.tools.register(tool)
+  }
+
+  unregisterTool(name: string): void {
+    this.tools.unregister(name)
+  }
+
+  stop(): void {
+    this.abort?.abort()
+    this.abort = null
+  }
+
+  async listThreads(): Promise<ChatThread[]> {
+    return this.store.listThreads()
+  }
+
+  async getMessages(threadId: string): Promise<ChatMessage[]> {
+    return this.store.getMessages(threadId)
+  }
+
+  async createThread(title = '新会话'): Promise<ChatThread> {
+    const now = Date.now()
+    const thread: ChatThread = {
+      id: createId('thread'),
+      title,
+      createdAt: now,
+      updatedAt: now,
+    }
+    await this.store.upsertThread(thread)
+    this.currentThreadId = thread.id
+    this.emit({ type: 'thread', thread })
+    return thread
+  }
+
+  async selectThread(id: string): Promise<void> {
+    this.currentThreadId = id
+  }
+
+  async deleteThread(id: string): Promise<void> {
+    await this.store.deleteThread(id)
+    if (this.currentThreadId === id) this.currentThreadId = null
+  }
+
+  async ensureThread(): Promise<ChatThread> {
+    if (this.currentThreadId) {
+      const threads = await this.store.listThreads()
+      const found = threads.find((t) => t.id === this.currentThreadId)
+      if (found) return found
+    }
+    return this.createThread()
+  }
+
+  async *send(userText: string): AsyncGenerator<ChatEvent> {
+    const text = userText.trim()
+    if (!text) return
+
+    const thread = await this.ensureThread()
+
+    const userMsg: ChatMessage = {
+      id: createId('msg'),
+      threadId: thread.id,
+      role: 'user',
+      content: text,
+      createdAt: Date.now(),
+      status: 'done',
+    }
+    await this.store.appendMessage(userMsg)
+    if (thread.title === '新会话' || thread.title === 'New chat') {
+      thread.title = text.slice(0, 40) + (text.length > 40 ? '…' : '')
+    }
+    thread.updatedAt = Date.now()
+    await this.store.upsertThread(thread)
+
+    const userEv: ChatEvent = { type: 'message', message: userMsg }
+    this.emit(userEv)
+    yield userEv
+    const threadEv: ChatEvent = { type: 'thread', thread }
+    this.emit(threadEv)
+    yield threadEv
+
+    this.abort = new AbortController()
+    const signal = this.abort.signal
+    const maxRounds = this.config.maxToolRounds ?? 5
+    const provider = this.getProvider()
+    // Nano path does not run OpenAI tools (v1).
+    const toolsEnabled = provider.supportsTools && this.tools.list().length > 0
+
+    try {
+      for (let round = 0; round <= maxRounds; round++) {
+        const history = await this.store.getMessages(thread.id)
+        const events: ChatEvent[] = []
+        const result = await this.runCompletion(
+          thread,
+          history,
+          signal,
+          (ev) => {
+            events.push(ev)
+            this.emit(ev)
+          },
+          toolsEnabled,
+        )
+        for (const ev of events) yield ev
+
+        if (toolsEnabled && result.finishReason === 'tool_calls' && result.toolCalls.length) {
+          for (const call of result.toolCalls) {
+            const run = await this.tools.run(call.name, call.arguments, {
+              threadId: thread.id,
+              abortSignal: signal,
+            })
+            const content = run.ok
+              ? JSON.stringify(run.result ?? null)
+              : JSON.stringify({ error: run.error })
+            const toolMsg: ChatMessage = {
+              id: createId('msg'),
+              threadId: thread.id,
+              role: 'tool',
+              content,
+              toolCallId: call.id,
+              createdAt: Date.now(),
+              status: 'done',
+            }
+            await this.store.appendMessage(toolMsg)
+            const toolEv: ChatEvent = {
+              type: 'tool-result',
+              toolCallId: call.id,
+              name: call.name,
+              result: run.ok ? run.result : run.error,
+              error: !run.ok,
+            }
+            this.emit(toolEv)
+            yield toolEv
+            const msgEv: ChatEvent = { type: 'message', message: toolMsg }
+            this.emit(msgEv)
+            yield msgEv
+          }
+          continue
+        }
+
+        const doneEv: ChatEvent = { type: 'done', message: result.assistantMessage }
+        this.emit(doneEv)
+        yield doneEv
+        return
+      }
+
+      const err = new Error(`Exceeded maxToolRounds (${maxRounds})`)
+      this.emit({ type: 'error', error: err })
+      yield { type: 'error', error: err }
+    } catch (err) {
+      if (signal.aborted) {
+        const aborted = new Error('Aborted')
+        this.emit({ type: 'error', error: aborted })
+        yield { type: 'error', error: aborted }
+        return
+      }
+      const error = err instanceof Error ? err : new Error(String(err))
+      this.emit({ type: 'error', error })
+      yield { type: 'error', error }
+    } finally {
+      this.abort = null
+    }
+  }
+
+  private async runCompletion(
+    thread: ChatThread,
+    history: ChatMessage[],
+    signal: AbortSignal,
+    onEvent: (ev: ChatEvent) => void,
+    toolsEnabled: boolean,
+  ): Promise<CompletionResult> {
+    const { systemPrompt, maxMessages } = this.config
+    const provider = this.getProvider()
+    const openaiMessages = this.toOpenAIMessages(history, systemPrompt, maxMessages ?? 40)
+    const tools = toolsEnabled ? this.tools.toOpenAI() : []
+
+    const assistantId = createId('msg')
+    const assistantMessage: ChatMessage = {
+      id: assistantId,
+      threadId: thread.id,
+      role: 'assistant',
+      content: '',
+      createdAt: Date.now(),
+      status: 'streaming',
+    }
+    await this.store.appendMessage(assistantMessage)
+    onEvent({ type: 'message', message: { ...assistantMessage } })
+
+    const toolAcc = new Map<number, AccumulatedToolCall>()
+    let finishReason: string | null = null
+
+    for await (const ev of provider.stream({
+      config: this.config,
+      messages: openaiMessages,
+      tools,
+      signal,
+    })) {
+      if (ev.type === 'text-delta') {
+        assistantMessage.content += ev.delta
+        await this.store.updateMessage({ ...assistantMessage })
+        onEvent({
+          type: 'text-delta',
+          delta: ev.delta,
+          messageId: assistantId,
+        })
+      } else if (ev.type === 'tool-call-deltas') {
+        mergeToolCallDeltas(toolAcc, ev.deltas)
+      } else if (ev.type === 'finish') {
+        finishReason = ev.finishReason
+      }
+    }
+
+    let toolCalls: ToolCall[] = []
+    if (toolAcc.size) {
+      toolCalls = [...toolAcc.entries()]
+        .sort((a, b) => a[0] - b[0])
+        .map(([, v]) => ({
+          id: v.id || createId('call'),
+          name: v.name,
+          arguments: v.arguments || '{}',
+        }))
+      assistantMessage.toolCalls = toolCalls
+      for (const tc of toolCalls) {
+        onEvent({ type: 'tool-call', toolCall: tc, messageId: assistantId })
+      }
+      if (!finishReason) finishReason = 'tool_calls'
+    }
+
+    assistantMessage.status = 'done'
+    await this.store.updateMessage({ ...assistantMessage })
+    thread.updatedAt = Date.now()
+    await this.store.upsertThread(thread)
+    onEvent({ type: 'message', message: { ...assistantMessage } })
+
+    return { finishReason, toolCalls, assistantMessage }
+  }
+
+  private toOpenAIMessages(
+    history: ChatMessage[],
+    systemPrompt: string | undefined,
+    maxMessages: number,
+  ): OpenAICompatMessage[] {
+    const out: OpenAICompatMessage[] = []
+    if (systemPrompt) {
+      out.push({ role: 'system', content: systemPrompt })
+    }
+    const sliced = history.slice(-maxMessages)
+    for (const m of sliced) {
+      if (m.role === 'tool') {
+        out.push({
+          role: 'tool',
+          content: m.content,
+          tool_call_id: m.toolCallId ?? '',
+        })
+      } else if (m.role === 'assistant' && m.toolCalls?.length) {
+        out.push({
+          role: 'assistant',
+          content: m.content || '',
+          tool_calls: m.toolCalls.map((tc) => ({
+            id: tc.id,
+            type: 'function',
+            function: { name: tc.name, arguments: tc.arguments },
+          })),
+        })
+      } else if (m.role === 'system') {
+        // injected from config each turn
+      } else {
+        out.push({ role: m.role as 'user' | 'assistant', content: m.content })
+      }
+    }
+    return out
+  }
+}
+
+export function createChatClient(opts: ChatEngineOptions): ChatEngine {
+  return new ChatEngine(opts)
+}
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
diff --git a/src/agent/MemoryStore.ts b/src/agent/MemoryStore.ts
new file mode 100644
index 0000000..efdd60d
--- /dev/null
+++ b/src/agent/MemoryStore.ts
@@ -0,0 +1,42 @@
+import type { ChatMessage, ChatThread, HistoryStore } from './types'
+
+export class MemoryStore implements HistoryStore {
+  private threads = new Map<string, ChatThread>()
+  private messages = new Map<string, ChatMessage[]>()
+
+  async listThreads(): Promise<ChatThread[]> {
+    return [...this.threads.values()].sort((a, b) => b.updatedAt - a.updatedAt)
+  }
+
+  async getMessages(threadId: string): Promise<ChatMessage[]> {
+    return [...(this.messages.get(threadId) ?? [])]
+  }
+
+  async upsertThread(t: ChatThread): Promise<void> {
+    this.threads.set(t.id, { ...t })
+  }
+
+  async appendMessage(m: ChatMessage): Promise<void> {
+    const list = this.messages.get(m.threadId) ?? []
+    list.push({ ...m })
+    this.messages.set(m.threadId, list)
+  }
+
+  async updateMessage(m: ChatMessage): Promise<void> {
+    const list = this.messages.get(m.threadId) ?? []
+    const idx = list.findIndex((x) => x.id === m.id)
+    if (idx >= 0) list[idx] = { ...m }
+    else list.push({ ...m })
+    this.messages.set(m.threadId, list)
+  }
+
+  async deleteThread(id: string): Promise<void> {
+    this.threads.delete(id)
+    this.messages.delete(id)
+  }
+
+  async clearAll(): Promise<void> {
+    this.threads.clear()
+    this.messages.clear()
+  }
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
diff --git a/src/agent/ToolRegistry.ts b/src/agent/ToolRegistry.ts
new file mode 100644
index 0000000..aa7e9df
--- /dev/null
+++ b/src/agent/ToolRegistry.ts
@@ -0,0 +1,72 @@
+import type { HostTool, ToolContext } from './types'
+import { parseToolArguments } from './parseToolArgs'
+
+export class ToolRegistry {
+  private tools = new Map<string, HostTool>()
+
+  register(tool: HostTool): void {
+    if (!/^[a-zA-Z0-9_-]+$/.test(tool.name)) {
+      throw new Error(`Invalid tool name: ${tool.name}`)
+    }
+    // Silent replace — Vue hosts often re-register on prop sync.
+    this.tools.set(tool.name, tool)
+  }
+
+  unregister(name: string): void {
+    this.tools.delete(name)
+  }
+
+  clear(): void {
+    this.tools.clear()
+  }
+
+  has(name: string): boolean {
+    return this.tools.has(name)
+  }
+
+  list(): HostTool[] {
+    return [...this.tools.values()]
+  }
+
+  /** OpenAI tools schema for chat.completions */
+  toOpenAI(): Array<{
+    type: 'function'
+    function: { name: string; description: string; parameters: object }
+  }> {
+    return this.list().map((t) => ({
+      type: 'function' as const,
+      function: {
+        name: t.name,
+        description: t.description,
+        parameters: t.parameters,
+      },
+    }))
+  }
+
+  async run(
+    name: string,
+    argsJson: string,
+    ctx: ToolContext,
+  ): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
+    const tool = this.tools.get(name)
+    if (!tool) {
+      return { ok: false, error: `Unknown tool: ${name}` }
+    }
+    let args: unknown = {}
+    try {
+      args = parseToolArguments(argsJson || '')
+    } catch {
+      return {
+        ok: false,
+        error: `Invalid JSON arguments for ${name}`,
+      }
+    }
+    try {
+      const result = await tool.handler(args, ctx)
+      return { ok: true, result }
+    } catch (err) {
+      const message = err instanceof Error ? err.message : String(err)
+      return { ok: false, error: message }
+    }
+  }
+}
diff --git a/src/agent/__tests__/ChatEngine.test.ts b/src/agent/__tests__/ChatEngine.test.ts
new file mode 100644
index 0000000..04fa785
--- /dev/null
+++ b/src/agent/__tests__/ChatEngine.test.ts
@@ -0,0 +1,209 @@
+import { describe, it, expect, vi, beforeEach } from 'vitest'
+import { ChatEngine } from '../ChatEngine'
+import { MemoryStore } from '../MemoryStore'
+import type { ChatEvent } from '../types'
+
+function sseChunk(obj: unknown): string {
+  return `data: ${JSON.stringify(obj)}\n\n`
+}
+
+function streamResponse(chunks: string[]): Response {
+  const encoder = new TextEncoder()
+  const stream = new ReadableStream<Uint8Array>({
+    start(controller) {
+      for (const c of chunks) controller.enqueue(encoder.encode(c))
+      controller.close()
+    },
+  })
+  return new Response(stream, {
+    status: 200,
+    headers: { 'Content-Type': 'text/event-stream' },
+  })
+}
+
+describe('ChatEngine', () => {
+  let fetchMock: ReturnType<typeof vi.fn>
+
+  beforeEach(() => {
+    fetchMock = vi.fn()
+  })
+
+  it('streams text deltas from mock SSE', async () => {
+    fetchMock.mockResolvedValue(
+      streamResponse([
+        sseChunk({ choices: [{ delta: { content: 'Hello' }, finish_reason: null }] }),
+        sseChunk({ choices: [{ delta: { content: ' world' }, finish_reason: null }] }),
+        sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
+        'data: [DONE]\n\n',
+      ]),
+    )
+
+    const engine = new ChatEngine({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'test-model',
+        provider: 'openai',
+      },
+      store: new MemoryStore(),
+      fetchImpl: fetchMock as unknown as typeof fetch,
+    })
+
+    const deltas: string[] = []
+    let doneContent = ''
+    for await (const ev of engine.send('hi')) {
+      if (ev.type === 'text-delta') deltas.push(ev.delta)
+      if (ev.type === 'done') doneContent = ev.message.content
+    }
+
+    expect(deltas.join('')).toBe('Hello world')
+    expect(doneContent).toBe('Hello world')
+  })
+
+  it('runs tool loop and feeds result back', async () => {
+    fetchMock
+      .mockResolvedValueOnce(
+        streamResponse([
+          sseChunk({
+            choices: [
+              {
+                delta: {
+                  tool_calls: [
+                    {
+                      index: 0,
+                      id: 'call_1',
+                      type: 'function',
+                      function: { name: 'echo', arguments: '{"x":1}' },
+                    },
+                  ],
+                },
+                finish_reason: null,
+              },
+            ],
+          }),
+          sseChunk({ choices: [{ delta: {}, finish_reason: 'tool_calls' }] }),
+          'data: [DONE]\n\n',
+        ]),
+      )
+      .mockResolvedValueOnce(
+        streamResponse([
+          sseChunk({ choices: [{ delta: { content: 'done' }, finish_reason: null }] }),
+          sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
+          'data: [DONE]\n\n',
+        ]),
+      )
+
+    const engine = new ChatEngine({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'test-model',
+        provider: 'openai',
+      },
+      store: new MemoryStore(),
+      fetchImpl: fetchMock as unknown as typeof fetch,
+    })
+    engine.registerTool({
+      name: 'echo',
+      description: 'Echo args',
+      parameters: { type: 'object', properties: { x: { type: 'number' } } },
+      handler: async (args) => args,
+    })
+
+    const toolResults: unknown[] = []
+    let final = ''
+    for await (const ev of engine.send('run echo')) {
+      if (ev.type === 'tool-result') toolResults.push(ev.result)
+      if (ev.type === 'done') final = ev.message.content
+    }
+    expect(toolResults[0]).toEqual({ x: 1 })
+    expect(final).toBe('done')
+    expect(fetchMock).toHaveBeenCalledTimes(2)
+  })
+
+  it('yields thread event when title updates on send', async () => {
+    fetchMock.mockResolvedValue(
+      streamResponse([
+        sseChunk({ choices: [{ delta: { content: 'ok' }, finish_reason: null }] }),
+        sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
+        'data: [DONE]\n\n',
+      ]),
+    )
+
+    const engine = new ChatEngine({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'test-model',
+        provider: 'openai',
+      },
+      store: new MemoryStore(),
+      fetchImpl: fetchMock as unknown as typeof fetch,
+    })
+
+    const types: string[] = []
+    let threadTitle = ''
+    for await (const ev of engine.send('hello there')) {
+      types.push(ev.type)
+      if (ev.type === 'thread') threadTitle = ev.thread.title
+    }
+
+    expect(types).toContain('thread')
+    expect(types.indexOf('thread')).toBeGreaterThan(types.indexOf('message'))
+    expect(threadTitle.startsWith('hello there')).toBe(true)
+  })
+
+  it('yields Aborted error when stop() aborts in-flight send', async () => {
+    let release!: () => void
+    const gate = new Promise<void>((r) => {
+      release = r
+    })
+    let fetchStarted!: () => void
+    const fetchStartedP = new Promise<void>((r) => {
+      fetchStarted = r
+    })
+
+    fetchMock.mockImplementation(async (_url: unknown, init?: RequestInit) => {
+      fetchStarted()
+      await gate
+      if (init?.signal?.aborted) {
+        const err = new Error('The operation was aborted')
+        err.name = 'AbortError'
+        throw err
+      }
+      return streamResponse([
+        sseChunk({ choices: [{ delta: { content: 'late' }, finish_reason: null }] }),
+        sseChunk({ choices: [{ delta: {}, finish_reason: 'stop' }] }),
+        'data: [DONE]\n\n',
+      ])
+    })
+
+    const engine = new ChatEngine({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'test-model',
+        provider: 'openai',
+      },
+      store: new MemoryStore(),
+      fetchImpl: fetchMock as unknown as typeof fetch,
+    })
+
+    const eventsPromise = (async () => {
+      const collected: ChatEvent[] = []
+      for await (const ev of engine.send('abort me')) {
+        collected.push(ev)
+      }
+      return collected
+    })()
+
+    await fetchStartedP
+    engine.stop()
+    release()
+
+    const collected = await eventsPromise
+    const errEv = collected.find((e) => e.type === 'error')
+    expect(errEv).toBeTruthy()
+    expect(errEv && errEv.type === 'error' ? errEv.error.message : '').toBe('Aborted')
+  })
+})
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
diff --git a/src/agent/__tests__/OpenAICompatProvider.test.ts b/src/agent/__tests__/OpenAICompatProvider.test.ts
new file mode 100644
index 0000000..410567e
--- /dev/null
+++ b/src/agent/__tests__/OpenAICompatProvider.test.ts
@@ -0,0 +1,42 @@
+import { describe, expect, it, vi } from 'vitest'
+import { OpenAICompatProvider } from '../providers/OpenAICompatProvider'
+
+function sseResponse(chunks: string[]): Response {
+  const enc = new TextEncoder()
+  const stream = new ReadableStream({
+    start(c) {
+      for (const x of chunks) c.enqueue(enc.encode(x))
+      c.close()
+    },
+  })
+  return new Response(stream, { status: 200 })
+}
+
+describe('OpenAICompatProvider', () => {
+  it('POSTs chat.completions and yields text-delta + finish', async () => {
+    const fetchImpl = vi.fn().mockResolvedValue(
+      sseResponse([
+        'data: {"choices":[{"delta":{"content":"A"},"finish_reason":null}]}\n\n',
+        'data: {"choices":[{"delta":{},"finish_reason":"stop"}]}\n\n',
+        'data: [DONE]\n\n',
+      ]),
+    )
+    const provider = new OpenAICompatProvider(fetchImpl as unknown as typeof fetch)
+    const events = []
+    for await (const ev of provider.stream({
+      config: {
+        apiBaseUrl: 'https://api.example.com/v1',
+        apiKey: 'sk-test',
+        model: 'm',
+      },
+      messages: [{ role: 'user', content: 'hi' }],
+      tools: [],
+      signal: new AbortController().signal,
+    })) {
+      events.push(ev)
+    }
+    expect(events.some((e) => e.type === 'text-delta' && e.delta === 'A')).toBe(true)
+    expect(events.at(-1)).toEqual({ type: 'finish', finishReason: 'stop' })
+    expect(fetchImpl.mock.calls[0]?.[0]).toBe('https://api.example.com/v1/chat/completions')
+  })
+})
diff --git a/src/agent/__tests__/ToolRegistry.test.ts b/src/agent/__tests__/ToolRegistry.test.ts
new file mode 100644
index 0000000..0dbbefb
--- /dev/null
+++ b/src/agent/__tests__/ToolRegistry.test.ts
@@ -0,0 +1,41 @@
+import { describe, expect, it } from 'vitest'
+import { ToolRegistry } from '../ToolRegistry'
+
+describe('ToolRegistry', () => {
+  it('rejects invalid names and runs handlers', async () => {
+    const reg = new ToolRegistry()
+    expect(() =>
+      reg.register({
+        name: 'bad name',
+        description: 'x',
+        parameters: { type: 'object', properties: {} },
+        handler: () => null,
+      }),
+    ).toThrow(/Invalid tool name/)
+
+    reg.register({
+      name: 'echo',
+      description: 'Echo',
+      parameters: {
+        type: 'object',
+        properties: { text: { type: 'string' } },
+        required: ['text'],
+      },
+      handler: (args) => ({ text: String((args as { text?: string }).text ?? '') }),
+    })
+
+    const ok = await reg.run('echo', '{"text":"hi"}', {
+      threadId: 't1',
+      abortSignal: new AbortController().signal,
+    })
+    expect(ok).toEqual({ ok: true, result: { text: 'hi' } })
+
+    const missing = await reg.run('nope', '{}', {
+      threadId: 't1',
+      abortSignal: new AbortController().signal,
+    })
+    expect(missing.ok).toBe(false)
+
+    expect(reg.toOpenAI()[0]?.function.name).toBe('echo')
+  })
+})
diff --git a/src/agent/__tests__/hostTools.test.ts b/src/agent/__tests__/hostTools.test.ts
new file mode 100644
index 0000000..0e045cc
--- /dev/null
+++ b/src/agent/__tests__/hostTools.test.ts
@@ -0,0 +1,98 @@
+import { describe, expect, it, vi } from 'vitest'
+import { createHostTools } from '../hostTools/createHostTools'
+import { OFFLINE_TOOL_WHITELIST } from '../hostTools/whitelist'
+import * as tokenCounterLogic from '@/tools/token-counter/logic'
+import * as secretRedactorLogic from '@/tools/prompt-secret-redactor/logic'
+
+describe('createHostTools', () => {
+  const router = { push: vi.fn().mockResolvedValue(undefined) }
+  const t = (key: string) => key
+  const tools = createHostTools({ router: router as never, t })
+  const byName = Object.fromEntries(tools.map((x) => [x.name, x]))
+  const ctx = { threadId: 't', abortSignal: new AbortController().signal }
+
+  it('exposes the three P1 tools', () => {
+    expect(Object.keys(byName).sort()).toEqual([
+      'list_tools',
+      'open_tool',
+      'run_offline_tool',
+    ])
+    expect([...OFFLINE_TOOL_WHITELIST]).toEqual([
+      'token-counter',
+      'prompt-secret-redactor',
+    ])
+  })
+
+  it('list_tools returns registry entries', async () => {
+    const list = (await byName.list_tools!.handler({}, ctx)) as Array<{ slug: string }>
+    expect(list.some((x) => x.slug === 'token-counter')).toBe(true)
+  })
+
+  it('open_tool navigates for known slug', async () => {
+    router.push.mockClear()
+    const res = await byName.open_tool!.handler({ slug: 'token-counter' }, ctx)
+    expect(res).toMatchObject({ ok: true, slug: 'token-counter' })
+    expect(router.push).toHaveBeenCalled()
+  })
+
+  it('open_tool rejects unknown slug without navigating or running offline logic', async () => {
+    router.push.mockClear()
+    const analyzeSpy = vi.spyOn(tokenCounterLogic, 'analyzeText')
+    const redactSpy = vi.spyOn(secretRedactorLogic, 'redactSecrets')
+    try {
+      const res = (await byName.open_tool!.handler(
+        { slug: 'definitely-unknown-slug-xyz' },
+        ctx,
+      )) as { ok: boolean; error?: string }
+      expect(res.ok).toBe(false)
+      expect(res.error).toMatch(/unknown/i)
+      expect(router.push).not.toHaveBeenCalled()
+      expect(analyzeSpy).not.toHaveBeenCalled()
+      expect(redactSpy).not.toHaveBeenCalled()
+    } finally {
+      analyzeSpy.mockRestore()
+      redactSpy.mockRestore()
+    }
+  })
+
+  it('run_offline_tool redacts secrets', async () => {
+    const res = (await byName.run_offline_tool!.handler(
+      {
+        slug: 'prompt-secret-redactor',
+        input: { text: 'key sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCD' },
+      },
+      ctx,
+    )) as { ok: boolean; result: { total: number } }
+    expect(res.ok).toBe(true)
+    expect(res.result.total).toBeGreaterThan(0)
+  })
+
+  it('run_offline_tool token-counter analyzes text', async () => {
+    const res = (await byName.run_offline_tool!.handler(
+      {
+        slug: 'token-counter',
+        input: { text: 'hello world', family: 'o200k', contextWindow: 128000 },
+      },
+      ctx,
+    )) as {
+      ok: boolean
+      slug: string
+      result: { tokens: number; chars: number; words: number; accurate: boolean; contextWindow: number }
+    }
+    expect(res.ok).toBe(true)
+    expect(res.slug).toBe('token-counter')
+    expect(res.result.tokens).toBeGreaterThan(0)
+    expect(res.result.chars).toBeGreaterThan(0)
+    expect(res.result.words).toBeGreaterThan(0)
+    expect(res.result.accurate).toBe(true)
+    expect(res.result.contextWindow).toBe(128000)
+  })
+
+  it('run_offline_tool rejects non-whitelist', async () => {
+    const res = (await byName.run_offline_tool!.handler(
+      { slug: 'ffmpeg', input: {} },
+      ctx,
+    )) as { ok: boolean }
+    expect(res.ok).toBe(false)
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
diff --git a/src/agent/__tests__/sse.test.ts b/src/agent/__tests__/sse.test.ts
new file mode 100644
index 0000000..1efa311
--- /dev/null
+++ b/src/agent/__tests__/sse.test.ts
@@ -0,0 +1,35 @@
+import { describe, expect, it } from 'vitest'
+import { mergeToolCallDeltas, parseSSEStream } from '../sse'
+
+function streamOf(text: string): ReadableStream<Uint8Array> {
+  const enc = new TextEncoder()
+  return new ReadableStream({
+    start(c) {
+      c.enqueue(enc.encode(text))
+      c.close()
+    },
+  })
+}
+
+describe('parseSSEStream', () => {
+  it('yields deltas until [DONE]', async () => {
+    const body = streamOf(
+      'data: {"choices":[{"delta":{"content":"Hi"},"finish_reason":null}]}\n\n' +
+        'data: [DONE]\n\n',
+    )
+    const chunks = []
+    for await (const c of parseSSEStream(body)) chunks.push(c)
+    expect(chunks[0]?.delta?.content).toBe('Hi')
+  })
+})
+
+describe('mergeToolCallDeltas', () => {
+  it('accumulates name and arguments by index', () => {
+    const acc = new Map()
+    mergeToolCallDeltas(acc, [
+      { index: 0, id: 'call_1', function: { name: 'list_', arguments: '' } },
+      { index: 0, function: { name: 'tools', arguments: '{}' } },
+    ])
+    expect(acc.get(0)).toEqual({ id: 'call_1', name: 'list_tools', arguments: '{}' })
+  })
+})
diff --git a/src/agent/__tests__/types.test.ts b/src/agent/__tests__/types.test.ts
new file mode 100644
index 0000000..bb9eff9
--- /dev/null
+++ b/src/agent/__tests__/types.test.ts
@@ -0,0 +1,43 @@
+import { describe, expect, it } from 'vitest'
+import { chatCompletionsUrl, createId } from '../types'
+import { MemoryStore } from '../MemoryStore'
+
+describe('chatCompletionsUrl', () => {
+  it('appends /chat/completions and strips trailing slash', () => {
+    expect(chatCompletionsUrl('https://api.example.com/v1')).toBe(
+      'https://api.example.com/v1/chat/completions',
+    )
+    expect(chatCompletionsUrl('https://api.example.com/v1/')).toBe(
+      'https://api.example.com/v1/chat/completions',
+    )
+  })
+})
+
+describe('MemoryStore', () => {
+  it('upserts threads and appends messages in order', async () => {
+    const store = new MemoryStore()
+    const thread = {
+      id: 'thread_1',
+      title: '新会话',
+      createdAt: 1,
+      updatedAt: 1,
+    }
+    await store.upsertThread(thread)
+    await store.appendMessage({
+      id: 'msg_1',
+      threadId: 'thread_1',
+      role: 'user',
+      content: 'hi',
+      createdAt: 2,
+      status: 'done',
+    })
+    expect(await store.listThreads()).toEqual([thread])
+    expect((await store.getMessages('thread_1'))[0]?.content).toBe('hi')
+  })
+})
+
+describe('createId', () => {
+  it('prefixes ids', () => {
+    expect(createId('thread').startsWith('thread_')).toBe(true)
+  })
+})
diff --git a/src/agent/hostTools/createHostTools.ts b/src/agent/hostTools/createHostTools.ts
new file mode 100644
index 0000000..3e4ae51
--- /dev/null
+++ b/src/agent/hostTools/createHostTools.ts
@@ -0,0 +1,131 @@
+import type { Router } from 'vue-router'
+import type { HostTool } from '../types'
+import { TOOLS, getTool } from '@/registry'
+import { isOfflineToolWhitelisted } from './whitelist'
+import { analyzeText } from '@/tools/token-counter/logic'
+import {
+  DEFAULT_REDACT_OPTIONS,
+  redactSecrets,
+  type RedactOptions,
+} from '@/tools/prompt-secret-redactor/logic'
+
+export interface HostToolDeps {
+  router: Router
+  /** Localized name/description lookup */
+  t: (key: string) => string
+}
+
+export function createHostTools(deps: HostToolDeps): HostTool[] {
+  const list_tools: HostTool = {
+    name: 'list_tools',
+    description:
+      'List SimpleTools offline toolbox entries (slug, category, name, description, keywords).',
+    parameters: {
+      type: 'object',
+      properties: {
+        category: {
+          type: 'string',
+          description: 'Optional category id filter (e.g. ai, developer, text)',
+        },
+        query: {
+          type: 'string',
+          description: 'Optional search string over slug/keywords/name',
+        },
+      },
+    },
+    handler: (args) => {
+      const a = (args ?? {}) as { category?: string; query?: string }
+      let tools = TOOLS
+      if (a.category) {
+        tools = tools.filter((t) => t.category === a.category)
+      }
+      const q = (a.query ?? '').trim().toLowerCase()
+      if (q) {
+        tools = tools.filter((t) => {
+          const name = deps.t(`tools.${t.slug}.name`).toLowerCase()
+          const desc = deps.t(`tools.${t.slug}.description`).toLowerCase()
+          const hay = [t.slug, t.category, ...t.keywords, name, desc].join(' ').toLowerCase()
+          return hay.includes(q)
+        })
+      }
+      return tools.map((t) => ({
+        slug: t.slug,
+        category: t.category,
+        name: deps.t(`tools.${t.slug}.name`),
+        description: deps.t(`tools.${t.slug}.description`),
+        keywords: t.keywords,
+        runnableOffline: isOfflineToolWhitelisted(t.slug),
+      }))
+    },
+  }
+
+  const open_tool: HostTool = {
+    name: 'open_tool',
+    description:
+      'Navigate the SimpleTools UI to an offline tool page by slug (e.g. token-counter).',
+    parameters: {
+      type: 'object',
+      properties: {
+        slug: { type: 'string', description: 'Tool slug from list_tools' },
+      },
+      required: ['slug'],
+    },
+    handler: async (args) => {
+      const slug = String((args as { slug?: string } | null)?.slug || '').trim()
+      if (!getTool(slug)) {
+        return { ok: false, error: `Unknown tool slug: ${slug}` }
+      }
+      await deps.router.push({ name: 'tool', params: { slug } })
+      return { ok: true, slug, path: `/tools/${slug}` }
+    },
+  }
+
+  const run_offline_tool: HostTool = {
+    name: 'run_offline_tool',
+    description:
+      'Run a whitelisted offline tool purely in-logic (no UI). P1 whitelist: token-counter, prompt-secret-redactor.',
+    parameters: {
+      type: 'object',
+      properties: {
+        slug: {
+          type: 'string',
+          enum: ['token-counter', 'prompt-secret-redactor'],
+        },
+        input: {
+          type: 'object',
+          description:
+            'Tool-specific payload. token-counter: { text, family?, contextWindow? }. prompt-secret-redactor: { text, options? }.',
+        },
+      },
+      required: ['slug', 'input'],
+    },
+    handler: (args) => {
+      const a = (args ?? {}) as { slug?: string; input?: Record<string, unknown> }
+      const slug = String(a.slug || '').trim()
+      if (!isOfflineToolWhitelisted(slug)) {
+        return {
+          ok: false,
+          error: `Slug not in offline whitelist: ${slug}. Allowed: token-counter, prompt-secret-redactor`,
+        }
+      }
+      const input = a.input ?? {}
+      if (slug === 'token-counter') {
+        const text = String(input.text ?? '')
+        const family = (input.family as 'o200k' | 'cl100k' | 'claude' | 'gemini' | 'deepseek') || 'o200k'
+        const contextWindow = Number(input.contextWindow ?? 128000) as 8000 | 32000 | 128000 | 200000
+        return { ok: true, slug, result: analyzeText(text, family, contextWindow) }
+      }
+      if (slug === 'prompt-secret-redactor') {
+        const text = String(input.text ?? '')
+        const options = {
+          ...DEFAULT_REDACT_OPTIONS,
+          ...(input.options as Partial<RedactOptions> | undefined),
+        }
+        return { ok: true, slug, result: redactSecrets(text, options) }
+      }
+      return { ok: false, error: 'Unreachable' }
+    },
+  }
+
+  return [list_tools, open_tool, run_offline_tool]
+}
diff --git a/src/agent/hostTools/index.ts b/src/agent/hostTools/index.ts
new file mode 100644
index 0000000..fc7be2d
--- /dev/null
+++ b/src/agent/hostTools/index.ts
@@ -0,0 +1,6 @@
+export { createHostTools, type HostToolDeps } from './createHostTools'
+export {
+  OFFLINE_TOOL_WHITELIST,
+  isOfflineToolWhitelisted,
+  type OfflineToolSlug,
+} from './whitelist'
diff --git a/src/agent/hostTools/whitelist.ts b/src/agent/hostTools/whitelist.ts
new file mode 100644
index 0000000..2b42a24
--- /dev/null
+++ b/src/agent/hostTools/whitelist.ts
@@ -0,0 +1,11 @@
+/** Only pure offline logic tools may be executed by the model in P1. */
+export const OFFLINE_TOOL_WHITELIST = [
+  'token-counter',
+  'prompt-secret-redactor',
+] as const
+
+export type OfflineToolSlug = (typeof OFFLINE_TOOL_WHITELIST)[number]
+
+export function isOfflineToolWhitelisted(slug: string): slug is OfflineToolSlug {
+  return (OFFLINE_TOOL_WHITELIST as readonly string[]).includes(slug)
+}
diff --git a/src/agent/index.ts b/src/agent/index.ts
new file mode 100644
index 0000000..ef06306
--- /dev/null
+++ b/src/agent/index.ts
@@ -0,0 +1,22 @@
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
+
+export { createHostTools, type HostToolDeps } from './hostTools'
+export { OFFLINE_TOOL_WHITELIST, isOfflineToolWhitelisted } from './hostTools/whitelist'
diff --git a/src/agent/normalizeSecret.ts b/src/agent/normalizeSecret.ts
new file mode 100644
index 0000000..653ba6a
--- /dev/null
+++ b/src/agent/normalizeSecret.ts
@@ -0,0 +1,30 @@
+/**
+ * When secret starts with `my-`, strip the prefix and Base64-decode
+ * (URL-safe alphabet + padding). On decode failure, fall back to the original.
+ */
+export function normalizeSecret(secret: unknown): string {
+  if (!secret) return ''
+  const s = String(secret).trim()
+  if (!s.startsWith('my-')) return s
+
+  const encoded = s.slice(3).replace(/\s+/g, '')
+  // URL-safe Base64 → standard
+  const urlsafe = encoded.replace(/-/g, '+').replace(/_/g, '/')
+  const padded = urlsafe + '='.repeat((4 - (urlsafe.length % 4)) % 4)
+
+  try {
+    if (typeof atob === 'function') {
+      return atob(padded)
+    }
+    const Buf = (globalThis as { Buffer?: { from(data: string, enc: string): { toString(enc: string): string } } })
+      .Buffer
+    if (Buf) {
+      return Buf.from(padded, 'base64').toString('utf-8')
+    }
+  } catch (e) {
+    console.warn('秘钥Base64解码失败，回退原值：', e)
+    return s
+  }
+
+  return s
+}
diff --git a/src/agent/parseToolArgs.ts b/src/agent/parseToolArgs.ts
new file mode 100644
index 0000000..25390d1
--- /dev/null
+++ b/src/agent/parseToolArgs.ts
@@ -0,0 +1,146 @@
+/**
+ * Resilient parsing of OpenAI-style tool `arguments` strings.
+ * Models often emit invalid JSON when values contain quotes/newlines (e.g. CSS).
+ */
+
+function looksLikeCss(s: string): boolean {
+  const t = s.trim();
+  if (!t) return false;
+  if (/^:host\b/i.test(t)) return true;
+  if (/--sc-[\w-]+\s*:/.test(t)) return true;
+  if (/\{[\s\S]*--sc-/.test(t)) return true;
+  return false;
+}
+
+function stripFences(s: string): string {
+  return s
+    .replace(/^```(?:json|css|javascript)?\s*/i, '')
+    .replace(/\s*```$/i, '')
+    .trim();
+}
+
+/** Extract a (possibly broken) JSON string value for key "css". */
+export function extractBrokenCssField(raw: string): string | null {
+  const key = /"css"\s*:\s*/.exec(raw);
+  if (!key) return null;
+  let i = key.index + key[0].length;
+  while (i < raw.length && /\s/.test(raw[i]!)) i++;
+  if (i >= raw.length) return null;
+
+  // Quoted string — tolerate raw newlines and unescaped quotes inside CSS.
+  if (raw[i] === '"' || raw[i] === "'") {
+    const quote = raw[i];
+    i += 1;
+    let out = '';
+    while (i < raw.length) {
+      const ch = raw[i];
+      if (ch === '\\' && i + 1 < raw.length) {
+        const n = raw[i + 1];
+        out +=
+          n === 'n'
+            ? '\n'
+            : n === 'r'
+              ? '\r'
+              : n === 't'
+                ? '\t'
+                : n === '"' || n === "'" || n === '\\'
+                  ? n
+                  : n;
+        i += 2;
+        continue;
+      }
+      if (ch === quote) {
+        const rest = raw.slice(i + 1).trimStart();
+        // End of value if followed by , } or EOS — else treat as literal quote in CSS.
+        if (!rest || rest.startsWith(',') || rest.startsWith('}')) {
+          return out;
+        }
+        out += ch;
+        i += 1;
+        continue;
+      }
+      out += ch;
+      i += 1;
+    }
+    return out.trim() ? out : null;
+  }
+
+  // Unquoted value: take until ,"note" or trailing }
+  const rest = raw.slice(i);
+  const cut = rest.search(/\s*,\s*"note"\s*:|\s*\}\s*$/);
+  const body = (cut >= 0 ? rest.slice(0, cut) : rest).trim().replace(/,$/, '');
+  return body || null;
+}
+
+function extractNoteField(raw: string): string | undefined {
+  const m = /"note"\s*:\s*"((?:\\.|[^"\\])*)"/.exec(raw);
+  if (!m) return undefined;
+  try {
+    return JSON.parse(`"${m[1]}"`);
+  } catch {
+    return m[1];
+  }
+}
+
+function tryParse(s: string): unknown | undefined {
+  try {
+    return JSON.parse(s);
+  } catch {
+    return undefined;
+  }
+}
+
+/**
+ * Parse tool call arguments JSON with repairs.
+ * Never throws — returns `{}` for empty input; throws Error only if completely unusable
+ * when `strict` (ToolRegistry catches and surfaces Invalid JSON).
+ */
+export function parseToolArguments(argsJson: string): unknown {
+  const original = (argsJson ?? '').trim();
+  if (!original) return {};
+
+  const candidates = [original, stripFences(original)];
+  for (const c of candidates) {
+    const parsed = tryParse(c);
+    if (parsed !== undefined) return parsed;
+  }
+
+  // Whole payload is CSS (model skipped JSON wrapper)
+  if (looksLikeCss(original) || looksLikeCss(stripFences(original))) {
+    return { css: stripFences(original) };
+  }
+
+  // Single-quoted JSON-ish keys/strings
+  const singleToDouble = tryParse(
+    original.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3').replace(/:\s*'([^']*)'/g, ': "$1"'),
+  );
+  if (singleToDouble !== undefined) return singleToDouble;
+
+  // Broken {"css": "...multiline / unescaped..."}
+  const css = extractBrokenCssField(original);
+  if (css != null && css.trim()) {
+    const note = extractNoteField(original);
+    return note ? { css, note } : { css };
+  }
+
+  // Extract first {...} blob
+  const brace = original.indexOf('{');
+  const last = original.lastIndexOf('}');
+  if (brace >= 0 && last > brace) {
+    const slice = original.slice(brace, last + 1);
+    const parsed = tryParse(slice);
+    if (parsed !== undefined) return parsed;
+    const css2 = extractBrokenCssField(slice);
+    if (css2 != null && css2.trim()) {
+      const note = extractNoteField(slice);
+      return note ? { css: css2, note } : { css: css2 };
+    }
+  }
+
+  // Last resort: if it mentions design tokens, treat as CSS
+  if (/:host|--sc-/.test(original)) {
+    return { css: stripFences(original) };
+  }
+
+  throw new Error('Invalid JSON arguments');
+}
diff --git a/src/agent/providers/OpenAICompatProvider.ts b/src/agent/providers/OpenAICompatProvider.ts
new file mode 100644
index 0000000..d74e03c
--- /dev/null
+++ b/src/agent/providers/OpenAICompatProvider.ts
@@ -0,0 +1,70 @@
+import { chatCompletionsUrl } from '../types'
+import { normalizeSecret } from '../normalizeSecret'
+import { parseSSEStream } from '../sse'
+import type { ChatProvider, ProviderStreamEvent, ProviderStreamRequest } from './types'
+
+/**
+ * OpenAI-compatible Chat Completions (SSE streaming) provider.
+ * Extracted from the original ChatEngine fetch/SSE path.
+ */
+export class OpenAICompatProvider implements ChatProvider {
+  readonly id = 'openai' as const
+  readonly supportsTools = true
+
+  constructor(private fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis)) {}
+
+  async *stream(req: ProviderStreamRequest): AsyncGenerator<ProviderStreamEvent> {
+    const { config, messages, tools, signal } = req
+    const { apiBaseUrl, apiKey, model, temperature, maxTokens, headers } = config
+
+    if (!apiBaseUrl || !apiKey || !model) {
+      throw new Error('apiBaseUrl, apiKey, and model are required')
+    }
+
+    const body: Record<string, unknown> = {
+      model,
+      messages,
+      stream: true,
+    }
+    if (temperature != null) body.temperature = temperature
+    if (maxTokens != null) body.max_tokens = maxTokens
+    if (tools.length) {
+      body.tools = tools
+      body.tool_choice = 'auto'
+    }
+
+    const res = await this.fetchImpl(chatCompletionsUrl(apiBaseUrl), {
+      method: 'POST',
+      headers: {
+        'Content-Type': 'application/json',
+        Authorization: `Bearer ${normalizeSecret(apiKey)}`,
+        ...headers,
+      },
+      body: JSON.stringify(body),
+      signal,
+    })
+
+    if (!res.ok) {
+      const errText = await res.text().catch(() => res.statusText)
+      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 400)}`)
+    }
+    if (!res.body) throw new Error('No response body')
+
+    let finishReason: string | null = null
+
+    for await (const chunk of parseSSEStream(res.body, signal)) {
+      if (chunk.finish_reason) finishReason = chunk.finish_reason
+      const delta = chunk.delta
+      if (!delta) continue
+
+      if (delta.content) {
+        yield { type: 'text-delta', delta: delta.content }
+      }
+      if (delta.tool_calls?.length) {
+        yield { type: 'tool-call-deltas', deltas: delta.tool_calls }
+      }
+    }
+
+    yield { type: 'finish', finishReason }
+  }
+}
diff --git a/src/agent/providers/index.ts b/src/agent/providers/index.ts
new file mode 100644
index 0000000..1d88f6f
--- /dev/null
+++ b/src/agent/providers/index.ts
@@ -0,0 +1,9 @@
+export type {
+  ChatProvider,
+  ChatProviderId,
+  OpenAICompatMessage,
+  ProviderStreamEvent,
+  ProviderStreamRequest,
+} from './types'
+export { isChatProviderId } from './types'
+export { OpenAICompatProvider } from './OpenAICompatProvider'
diff --git a/src/agent/providers/types.ts b/src/agent/providers/types.ts
new file mode 100644
index 0000000..584becc
--- /dev/null
+++ b/src/agent/providers/types.ts
@@ -0,0 +1,35 @@
+import type { ChatProviderId, SimpleChatConfig } from '../types'
+import type { StreamDelta } from '../sse'
+
+export type { ChatProviderId }
+
+export type OpenAICompatMessage =
+  | { role: 'system' | 'user' | 'assistant'; content: string; tool_calls?: unknown[] }
+  | { role: 'tool'; content: string; tool_call_id: string }
+
+export interface ProviderStreamRequest {
+  config: SimpleChatConfig
+  messages: OpenAICompatMessage[]
+  /** OpenAI tools JSON; chrome-ai ignores (no tools on Nano in v1). */
+  tools: unknown[]
+  signal: AbortSignal
+}
+
+export type ProviderStreamEvent =
+  | { type: 'text-delta'; delta: string }
+  | {
+      type: 'tool-call-deltas'
+      deltas: NonNullable<StreamDelta['tool_calls']>
+    }
+  | { type: 'finish'; finishReason: string | null }
+
+export interface ChatProvider {
+  readonly id: ChatProviderId
+  /** Whether this provider can run OpenAI-style function tools. */
+  readonly supportsTools: boolean
+  stream(req: ProviderStreamRequest): AsyncGenerator<ProviderStreamEvent>
+}
+
+export function isChatProviderId(v: unknown): v is ChatProviderId {
+  return v === 'openai' || v === 'chrome-ai'
+}
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
diff --git a/src/agent/sse.ts b/src/agent/sse.ts
new file mode 100644
index 0000000..d56d602
--- /dev/null
+++ b/src/agent/sse.ts
@@ -0,0 +1,77 @@
+/** Parse SSE chunks from an OpenAI-compatible chat.completions stream. */
+
+export interface StreamDelta {
+  content?: string
+  tool_calls?: Array<{
+    index: number
+    id?: string
+    type?: string
+    function?: { name?: string; arguments?: string }
+  }>
+  finish_reason?: string | null
+}
+
+export async function* parseSSEStream(
+  body: ReadableStream<Uint8Array>,
+  signal?: AbortSignal,
+): AsyncGenerator<{ delta?: StreamDelta; finish_reason?: string | null; raw?: unknown }> {
+  const reader = body.getReader()
+  const decoder = new TextDecoder()
+  let buffer = ''
+
+  try {
+    while (true) {
+      if (signal?.aborted) break
+      const { done, value } = await reader.read()
+      if (done) break
+      buffer += decoder.decode(value, { stream: true })
+      const parts = buffer.split('\n')
+      buffer = parts.pop() ?? ''
+
+      for (const line of parts) {
+        const trimmed = line.trim()
+        if (!trimmed || trimmed.startsWith(':')) continue
+        if (!trimmed.startsWith('data:')) continue
+        const data = trimmed.slice(5).trim()
+        if (data === '[DONE]') return
+        try {
+          const json = JSON.parse(data)
+          const choice = json.choices?.[0]
+          yield {
+            delta: choice?.delta,
+            finish_reason: choice?.finish_reason ?? null,
+            raw: json,
+          }
+        } catch {
+          // ignore malformed chunks
+        }
+      }
+    }
+  } finally {
+    try {
+      reader.releaseLock()
+    } catch {
+      /* ignore */
+    }
+  }
+}
+
+export interface AccumulatedToolCall {
+  id: string
+  name: string
+  arguments: string
+}
+
+/** Merge incremental tool_calls deltas into a map keyed by index. */
+export function mergeToolCallDeltas(
+  acc: Map<number, AccumulatedToolCall>,
+  deltas: NonNullable<StreamDelta['tool_calls']>,
+): void {
+  for (const d of deltas) {
+    const existing = acc.get(d.index) ?? { id: '', name: '', arguments: '' }
+    if (d.id) existing.id = d.id
+    if (d.function?.name) existing.name += d.function.name
+    if (d.function?.arguments) existing.arguments += d.function.arguments
+    acc.set(d.index, existing)
+  }
+}
diff --git a/src/agent/types.ts b/src/agent/types.ts
new file mode 100644
index 0000000..35b7079
--- /dev/null
+++ b/src/agent/types.ts
@@ -0,0 +1,86 @@
+export type ChatProviderId = 'openai' | 'chrome-ai'
+
+export interface SimpleChatConfig {
+  /** OpenAI-compatible base URL without trailing /chat/completions */
+  apiBaseUrl: string
+  apiKey: string
+  model: string
+  systemPrompt?: string
+  temperature?: number
+  maxTokens?: number
+  headers?: Record<string, string>
+  maxMessages?: number
+  maxToolRounds?: number
+  /** Phase1 always 'openai'; 'chrome-ai' reserved for Phase2 Nano */
+  provider?: ChatProviderId
+}
+
+export interface ChatThread {
+  id: string
+  title: string
+  createdAt: number
+  updatedAt: number
+  metadata?: Record<string, unknown>
+}
+
+export type Role = 'system' | 'user' | 'assistant' | 'tool'
+
+export interface ToolCall {
+  id: string
+  name: string
+  arguments: string
+}
+
+export interface ChatMessage {
+  id: string
+  threadId: string
+  role: Role
+  content: string
+  toolCallId?: string
+  toolCalls?: ToolCall[]
+  createdAt: number
+  status?: 'streaming' | 'done' | 'error'
+}
+
+export interface ToolContext {
+  threadId: string
+  abortSignal: AbortSignal
+}
+
+export interface HostTool {
+  name: string
+  description: string
+  parameters: object
+  handler: (args: unknown, ctx: ToolContext) => Promise<unknown> | unknown
+}
+
+export interface HistoryStore {
+  listThreads(): Promise<ChatThread[]>
+  getMessages(threadId: string): Promise<ChatMessage[]>
+  upsertThread(t: ChatThread): Promise<void>
+  appendMessage(m: ChatMessage): Promise<void>
+  updateMessage(m: ChatMessage): Promise<void>
+  deleteThread(id: string): Promise<void>
+  clearAll?(): Promise<void>
+}
+
+export type ChatEvent =
+  | { type: 'text-delta'; delta: string; messageId: string }
+  | { type: 'tool-call'; toolCall: ToolCall; messageId: string }
+  | { type: 'tool-result'; toolCallId: string; name: string; result: unknown; error?: boolean }
+  | { type: 'message'; message: ChatMessage }
+  | { type: 'thread'; thread: ChatThread }
+  | { type: 'done'; message: ChatMessage }
+  | { type: 'error'; error: Error }
+
+export function createId(prefix = 'id'): string {
+  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
+}
+
+export function normalizeBaseUrl(base: string): string {
+  return base.replace(/\/+$/, '')
+}
+
+export function chatCompletionsUrl(apiBaseUrl: string): string {
+  return `${normalizeBaseUrl(apiBaseUrl)}/chat/completions`
+}
diff --git a/src/components/agent/AgentComposer.vue b/src/components/agent/AgentComposer.vue
new file mode 100644
index 0000000..248d5ca
--- /dev/null
+++ b/src/components/agent/AgentComposer.vue
@@ -0,0 +1,66 @@
+<script setup lang="ts">
+import { computed, ref } from 'vue'
+import { Send, Square } from 'lucide-vue-next'
+import { Button } from '@/components/ui/button'
+import { Textarea } from '@/components/ui/textarea'
+import { useAgentStore } from '@/stores/agent'
+
+const agent = useAgentStore()
+const draft = ref('')
+
+const canSend = computed(() => draft.value.trim().length > 0 && !agent.streaming)
+
+async function submit() {
+  const text = draft.value.trim()
+  if (!text || agent.streaming) return
+  draft.value = ''
+  const accepted = await agent.send(text)
+  // Restore input if send rejected before starting (e.g. missing BYOK settings).
+  if (!accepted) draft.value = text
+}
+
+function onKeydown(e: KeyboardEvent) {
+  if (e.key === 'Enter' && !e.shiftKey) {
+    e.preventDefault()
+    void submit()
+  }
+}
+</script>
+
+<template>
+  <div class="border-t p-3" data-testid="agent-composer">
+    <div class="mx-auto flex max-w-3xl items-end gap-2">
+      <Textarea
+        v-model="draft"
+        class="min-h-[72px] h-auto max-h-40 font-sans"
+        :placeholder="$t('agent.placeholder')"
+        :disabled="agent.streaming"
+        rows="2"
+        data-testid="agent-composer-input"
+        @keydown="onKeydown"
+      />
+      <Button
+        v-if="agent.streaming"
+        variant="outline"
+        size="icon"
+        class="shrink-0"
+        data-testid="agent-stop"
+        :aria-label="$t('agent.stop')"
+        @click="agent.stop()"
+      >
+        <Square class="size-3.5 fill-current" />
+      </Button>
+      <Button
+        v-else
+        size="icon"
+        class="shrink-0"
+        data-testid="agent-send"
+        :disabled="!canSend"
+        :aria-label="$t('agent.send')"
+        @click="submit"
+      >
+        <Send class="size-4" />
+      </Button>
+    </div>
+  </div>
+</template>
diff --git a/src/components/agent/AgentMarkdown.vue b/src/components/agent/AgentMarkdown.vue
new file mode 100644
index 0000000..e5f4b0c
--- /dev/null
+++ b/src/components/agent/AgentMarkdown.vue
@@ -0,0 +1,17 @@
+<script setup lang="ts">
+import { computed } from 'vue'
+import { Marked } from 'marked'
+import DOMPurify from 'dompurify'
+
+const props = defineProps<{ content: string }>()
+const marked = new Marked({ gfm: true, breaks: true })
+const html = computed(() =>
+  DOMPurify.sanitize(marked.parse(props.content || '') as string),
+)
+</script>
+
+<template>
+  <!-- sanitized with DOMPurify -->
+  <!-- eslint-disable-next-line vue/no-v-html -->
+  <div class="agent-md space-y-2 text-sm [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs [&_ul]:list-disc [&_ul]:pl-5" v-html="html" />
+</template>
diff --git a/src/components/agent/AgentMessage.vue b/src/components/agent/AgentMessage.vue
new file mode 100644
index 0000000..9e38e83
--- /dev/null
+++ b/src/components/agent/AgentMessage.vue
@@ -0,0 +1,93 @@
+<script setup lang="ts">
+import { useI18n } from 'vue-i18n'
+import type { ChatMessage } from '@/agent'
+import AgentMarkdown from '@/components/agent/AgentMarkdown.vue'
+
+defineProps<{ message: ChatMessage }>()
+
+const { t } = useI18n()
+
+function roleLabel(role: ChatMessage['role']): string {
+  if (role === 'user') return t('agent.roleUser')
+  if (role === 'assistant') return t('agent.roleAssistant')
+  if (role === 'tool') return t('agent.roleTool')
+  return role
+}
+
+function prettyJson(raw: string): string {
+  try {
+    return JSON.stringify(JSON.parse(raw), null, 2)
+  } catch {
+    return raw
+  }
+}
+
+function formatToolContent(content: string): string {
+  try {
+    return JSON.stringify(JSON.parse(content), null, 2)
+  } catch {
+    return content
+  }
+}
+</script>
+
+<template>
+  <article
+    class="flex flex-col gap-1.5"
+    :data-role="message.role"
+    :data-testid="`agent-message-${message.role}`"
+  >
+    <div class="text-muted-foreground text-xs font-medium tracking-wide">
+      {{ roleLabel(message.role) }}
+      <span v-if="message.status === 'streaming'" class="ml-2 font-normal">
+        {{ $t('agent.streaming') }}
+      </span>
+    </div>
+
+    <div
+      v-if="message.role === 'assistant'"
+      class="bg-muted/40 rounded-lg border px-3 py-2"
+    >
+      <AgentMarkdown :content="message.content" />
+      <div
+        v-if="message.toolCalls?.length"
+        class="mt-2 space-y-2 border-t pt-2"
+      >
+        <div
+          v-for="tc in message.toolCalls"
+          :key="tc.id"
+          class="bg-background rounded-md border p-2 text-xs"
+        >
+          <div class="mb-1 font-medium">{{ $t('agent.toolCall') }}: {{ tc.name }}</div>
+          <pre class="overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed">{{
+            prettyJson(tc.arguments)
+          }}</pre>
+        </div>
+      </div>
+    </div>
+
+    <div
+      v-else-if="message.role === 'user'"
+      class="bg-background rounded-lg border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
+    >
+      {{ message.content }}
+    </div>
+
+    <div
+      v-else-if="message.role === 'tool'"
+      class="bg-muted/30 text-muted-foreground rounded-lg border px-3 py-2"
+    >
+      <div class="mb-1 text-xs font-medium">{{ $t('agent.toolResult') }}</div>
+      <pre class="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">{{
+        formatToolContent(message.content)
+      }}</pre>
+    </div>
+
+    <div
+      v-else
+      class="text-muted-foreground rounded-lg border px-3 py-2 text-xs whitespace-pre-wrap"
+    >
+      {{ message.content }}
+    </div>
+  </article>
+</template>
diff --git a/src/components/agent/AgentMessageList.vue b/src/components/agent/AgentMessageList.vue
new file mode 100644
index 0000000..e0890a3
--- /dev/null
+++ b/src/components/agent/AgentMessageList.vue
@@ -0,0 +1,45 @@
+<script setup lang="ts">
+import { nextTick, ref, watch } from 'vue'
+import { useAgentStore } from '@/stores/agent'
+import AgentMessage from '@/components/agent/AgentMessage.vue'
+
+const agent = useAgentStore()
+const scroller = ref<HTMLElement | null>(null)
+
+async function scrollToBottom() {
+  await nextTick()
+  const el = scroller.value
+  if (!el) return
+  el.scrollTop = el.scrollHeight
+}
+
+watch(
+  () => [agent.messages.length, agent.messages.at(-1)?.content, agent.streaming] as const,
+  () => {
+    void scrollToBottom()
+  },
+  { flush: 'post' },
+)
+</script>
+
+<template>
+  <div
+    ref="scroller"
+    class="min-h-0 flex-1 overflow-y-auto px-3 py-4"
+    data-testid="agent-message-list"
+  >
+    <p
+      v-if="!agent.messages.length"
+      class="text-muted-foreground py-12 text-center text-sm"
+    >
+      {{ $t('agent.empty') }}
+    </p>
+    <div v-else class="mx-auto flex max-w-3xl flex-col gap-4">
+      <AgentMessage
+        v-for="m in agent.messages"
+        :key="m.id"
+        :message="m"
+      />
+    </div>
+  </div>
+</template>
diff --git a/src/components/agent/AgentSettingsDialog.vue b/src/components/agent/AgentSettingsDialog.vue
new file mode 100644
index 0000000..b7e3a59
--- /dev/null
+++ b/src/components/agent/AgentSettingsDialog.vue
@@ -0,0 +1,112 @@
+<script setup lang="ts">
+import { watch } from 'vue'
+import { storeToRefs } from 'pinia'
+import { Button } from '@/components/ui/button'
+import {
+  Dialog,
+  DialogContent,
+  DialogDescription,
+  DialogFooter,
+  DialogHeader,
+  DialogTitle,
+} from '@/components/ui/dialog'
+import { Input } from '@/components/ui/input'
+import { Label } from '@/components/ui/label'
+import { Switch } from '@/components/ui/switch'
+import { Textarea } from '@/components/ui/textarea'
+import { useAgentStore } from '@/stores/agent'
+
+const agent = useAgentStore()
+const { settingsOpen, draftSettings } = storeToRefs(agent)
+
+watch(settingsOpen, (isOpen) => {
+  if (isOpen) agent.loadSettingsIntoDraft()
+})
+
+function onCancel() {
+  agent.loadSettingsIntoDraft()
+  settingsOpen.value = false
+}
+
+const isChrome = import.meta.env.VITE_TARGET === 'chrome'
+
+function onSave() {
+  agent.saveSettings()
+}
+</script>
+
+<template>
+  <Dialog v-model:open="settingsOpen">
+    <DialogContent class="sm:max-w-lg">
+      <DialogHeader data-testid="agent-settings-dialog">
+        <DialogTitle>{{ $t('agent.settingsTitle') }}</DialogTitle>
+        <DialogDescription>{{ $t('agent.settingsDesc') }}</DialogDescription>
+      </DialogHeader>
+
+      <p
+        v-if="isChrome"
+        class="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
+        data-testid="agent-settings-chrome-warning"
+      >
+        {{ $t('agent.chromeHostWarning') }}
+      </p>
+
+      <div class="grid gap-3">
+        <div class="grid gap-1.5">
+          <Label for="agent-api-base">{{ $t('agent.apiBaseUrl') }}</Label>
+          <Input
+            id="agent-api-base"
+            v-model="draftSettings.apiBaseUrl"
+            data-testid="agent-settings-base-url"
+            placeholder="https://api.openai.com/v1"
+          />
+        </div>
+        <div class="grid gap-1.5">
+          <Label for="agent-api-key">{{ $t('agent.apiKey') }}</Label>
+          <Input
+            id="agent-api-key"
+            v-model="draftSettings.apiKey"
+            type="password"
+            autocomplete="off"
+            data-testid="agent-settings-api-key"
+          />
+        </div>
+        <div class="grid gap-1.5">
+          <Label for="agent-model">{{ $t('agent.model') }}</Label>
+          <Input
+            id="agent-model"
+            v-model="draftSettings.model"
+            data-testid="agent-settings-model"
+            placeholder="gpt-4o-mini"
+          />
+        </div>
+        <div class="grid gap-1.5">
+          <Label for="agent-system-prompt">{{ $t('agent.systemPrompt') }}</Label>
+          <Textarea
+            id="agent-system-prompt"
+            v-model="draftSettings.systemPrompt"
+            class="min-h-[96px] h-24 font-sans"
+            data-testid="agent-settings-system-prompt"
+          />
+        </div>
+        <div class="flex items-center gap-2">
+          <Switch
+            id="agent-remember-key"
+            v-model="draftSettings.rememberKey"
+            data-testid="agent-settings-remember-key"
+          />
+          <Label for="agent-remember-key">{{ $t('agent.rememberKey') }}</Label>
+        </div>
+      </div>
+
+      <DialogFooter>
+        <Button variant="outline" data-testid="agent-settings-cancel" @click="onCancel">
+          {{ $t('agent.cancel') }}
+        </Button>
+        <Button data-testid="agent-settings-save" @click="onSave">
+          {{ $t('agent.save') }}
+        </Button>
+      </DialogFooter>
+    </DialogContent>
+  </Dialog>
+</template>
diff --git a/src/components/agent/AgentThreadList.vue b/src/components/agent/AgentThreadList.vue
new file mode 100644
index 0000000..444e40a
--- /dev/null
+++ b/src/components/agent/AgentThreadList.vue
@@ -0,0 +1,43 @@
+<script setup lang="ts">
+import { Plus, Trash2 } from 'lucide-vue-next'
+import { Button } from '@/components/ui/button'
+import { useAgentStore } from '@/stores/agent'
+import { cn } from '@/lib/utils'
+
+const agent = useAgentStore()
+</script>
+
+<template>
+  <aside class="flex h-full w-56 shrink-0 flex-col border-r sm:w-64" data-testid="agent-thread-list">
+    <div class="flex items-center gap-2 border-b p-2">
+      <Button size="sm" class="w-full" data-testid="agent-new-thread" @click="agent.newThread()">
+        <Plus /> {{ $t('agent.newChat') }}
+      </Button>
+    </div>
+    <ul class="min-h-0 flex-1 overflow-y-auto p-2">
+      <li v-for="th in agent.threads" :key="th.id" class="group mb-1 flex items-center gap-1">
+        <button
+          type="button"
+          :class="
+            cn(
+              'hover:bg-accent flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm',
+              th.id === agent.currentThreadId && 'bg-accent font-medium',
+            )
+          "
+          @click="agent.selectThread(th.id)"
+        >
+          {{ th.title || $t('agent.newChat') }}
+        </button>
+        <Button
+          variant="ghost"
+          size="icon"
+          class="size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
+          :aria-label="$t('agent.deleteThread')"
+          @click="agent.deleteThread(th.id)"
+        >
+          <Trash2 class="size-3.5" />
+        </Button>
+      </li>
+    </ul>
+  </aside>
+</template>
diff --git a/src/components/layout/AppHeader.vue b/src/components/layout/AppHeader.vue
index d83d96f..b47cd76 100644
--- a/src/components/layout/AppHeader.vue
+++ b/src/components/layout/AppHeader.vue
@@ -1,14 +1,17 @@
 <script setup lang="ts">
-import { ref } from 'vue'
-import { Code2, Github, Languages, Moon, Puzzle, Sun, Wrench } from 'lucide-vue-next'
+import { computed, ref } from 'vue'
+import { useRoute } from 'vue-router'
+import { Bot, Code2, Github, Languages, Moon, Puzzle, Sun, Wrench } from 'lucide-vue-next'
 import { Button } from '@/components/ui/button'
 import InstallExtensionModal, { type ExtensionKind } from '@/components/layout/InstallExtensionModal.vue'
 import { LOCALE_META, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'
 import { useSettingsStore } from '@/stores/settings'
 
 const settings = useSettingsStore()
+const route = useRoute()
+const isAgent = computed(() => route.name === 'agent')
 
 function onLocaleChange(event: Event) {
   settings.setLocale((event.target as HTMLSelectElement).value as AppLocale)
 }
 
@@ -27,11 +30,11 @@ function openInstall(kind: ExtensionKind) {
 }
 </script>
 
 <template>
   <header class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
-    <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
+    <div class="mx-auto flex h-14 items-center gap-3 px-4" :class="isAgent ? 'max-w-7xl' : 'max-w-6xl'">
       <RouterLink to="/" class="flex items-center gap-2 font-semibold">
         <Wrench class="size-5" />
         {{ $t('app.name') }}
       </RouterLink>
       <div class="ml-auto flex items-center gap-1">
@@ -77,10 +80,33 @@ function openInstall(kind: ExtensionKind) {
             @click="openInstall('vscode')"
           >
             <Code2 />
           </Button>
         </template>
+        <Button
+          variant="ghost"
+          size="sm"
+          class="hidden sm:inline-flex"
+          as-child
+          data-testid="agent-entry"
+        >
+          <RouterLink to="/agent" :aria-label="$t('app.agent')">
+            <Bot />
+            <span>{{ $t('app.agent') }}</span>
+          </RouterLink>
+        </Button>
+        <Button
+          variant="ghost"
+          size="icon"
+          class="sm:hidden"
+          as-child
+          data-testid="agent-entry-icon"
+        >
+          <RouterLink to="/agent" :aria-label="$t('app.agent')">
+            <Bot />
+          </RouterLink>
+        </Button>
         <Button
           variant="ghost"
           size="icon"
           as-child
           data-testid="github-link"
diff --git a/src/i18n/locales/de.ts b/src/i18n/locales/de.ts
index 6878d22..1c23f08 100644
--- a/src/i18n/locales/de.ts
+++ b/src/i18n/locales/de.ts
@@ -20,10 +20,12 @@ const de: MessageSchema = {
     notFoundDesc: "Die von Ihnen angeforderte Seite oder das von Ihnen angeforderte Tool existiert nicht.",
     loading: "Laden…",
     loadError: "Das Werkzeug konnte nicht geladen werden. Bitte aktualisieren.",
     privacy: "Alles läuft lokal in Ihrem Browser.",
     toolCount: "{n} Werkzeuge",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Chrome-Erweiterung",
       vscode: "VS Code-Erweiterung",
       chromeTitle: "Installieren Sie die Chrome-Erweiterung",
       vscodeTitle: "Installieren Sie die VS Code-Erweiterung",
@@ -210,9 +212,37 @@ const de: MessageSchema = {
       original: "Original",
       result: "Ergebnis",
       notImage: "Bitte wählen Sie eine Bilddatei aus",
       failed: "Die Bildverarbeitung ist fehlgeschlagen"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default de
diff --git a/src/i18n/locales/en.ts b/src/i18n/locales/en.ts
index b60d9b9..c844e2f 100644
--- a/src/i18n/locales/en.ts
+++ b/src/i18n/locales/en.ts
@@ -20,10 +20,12 @@ const en: MessageSchema = {
     notFoundDesc: 'The page or tool you requested does not exist.',
     loading: 'Loading…',
     loadError: 'Failed to load the tool. Please refresh.',
     privacy: 'Everything runs locally in your browser.',
     toolCount: '{n} tools',
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: 'Chrome extension',
       vscode: 'VS Code extension',
       chromeTitle: 'Install Chrome extension',
       vscodeTitle: 'Install VS Code extension',
@@ -211,8 +213,36 @@ const en: MessageSchema = {
       result: 'Result',
       notImage: 'Please choose an image file',
       failed: 'Image processing failed',
     },
   },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default en
diff --git a/src/i18n/locales/es.ts b/src/i18n/locales/es.ts
index 4985bd8..a07f7df 100644
--- a/src/i18n/locales/es.ts
+++ b/src/i18n/locales/es.ts
@@ -20,10 +20,12 @@ const es: MessageSchema = {
     notFoundDesc: "La página o herramienta que solicitaste no existe.",
     loading: "Cargando…",
     loadError: "No se pudo cargar la herramienta. Por favor actualice.",
     privacy: "Todo se ejecuta localmente en su navegador.",
     toolCount: "{n} herramientas",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Extensión de Chrome",
       vscode: "Extensión de código VS",
       chromeTitle: "Instalar la extensión de Chrome",
       vscodeTitle: "Instalar la extensión VS Code",
@@ -210,9 +212,37 @@ const es: MessageSchema = {
       original: "Original",
       result: "Resultado",
       notImage: "Por favor elija un archivo de imagen",
       failed: "Error al procesar la imagen"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default es
diff --git a/src/i18n/locales/fr.ts b/src/i18n/locales/fr.ts
index 1800d7a..ddac6cf 100644
--- a/src/i18n/locales/fr.ts
+++ b/src/i18n/locales/fr.ts
@@ -20,10 +20,12 @@ const fr: MessageSchema = {
     notFoundDesc: "La page ou l'outil que vous avez demandé n'existe pas.",
     loading: "Chargement…",
     loadError: "Échec du chargement de l'outil. Veuillez actualiser.",
     privacy: "Tout s'exécute localement dans votre navigateur.",
     toolCount: "{n} outils",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Extension Chrome",
       vscode: "Extension du code VS",
       chromeTitle: "Installer l'extension Chrome",
       vscodeTitle: "Installer l'extension VS Code",
@@ -210,9 +212,37 @@ const fr: MessageSchema = {
       original: "Original",
       result: "Résultat",
       notImage: "Veuillez choisir un fichier image",
       failed: "Le traitement de l'image a échoué"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default fr
diff --git a/src/i18n/locales/ja.ts b/src/i18n/locales/ja.ts
index 611377b..7eae707 100644
--- a/src/i18n/locales/ja.ts
+++ b/src/i18n/locales/ja.ts
@@ -20,10 +20,12 @@ const ja: MessageSchema = {
     notFoundDesc: "要求したページまたはツールは存在しません。",
     loading: "読み込み中…",
     loadError: "ツールのロードに失敗しました。リフレッシュしてください。",
     privacy: "すべてがブラウザ内でローカルに実行されます。",
     toolCount: "{n} ツール",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Chrome拡張機能",
       vscode: "VS コード拡張機能",
       chromeTitle: "Chrome拡張機能をインストールする",
       vscodeTitle: "VS Code拡張機能をインストールする",
@@ -210,9 +212,37 @@ const ja: MessageSchema = {
       original: "オリジナル",
       result: "結果",
       notImage: "画像ファイルを選択してください",
       failed: "画像処理に失敗しました"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default ja
diff --git a/src/i18n/locales/ko.ts b/src/i18n/locales/ko.ts
index d1bac73..71482cc 100644
--- a/src/i18n/locales/ko.ts
+++ b/src/i18n/locales/ko.ts
@@ -20,10 +20,12 @@ const ko: MessageSchema = {
     notFoundDesc: "요청하신 페이지나 도구가 존재하지 않습니다.",
     loading: "로드 중…",
     loadError: "도구를 로드하지 못했습니다. 새로고침하세요.",
     privacy: "모든 것이 브라우저에서 로컬로 실행됩니다.",
     toolCount: "{n} 도구",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "크롬 확장 프로그램",
       vscode: "VS 코드 확장",
       chromeTitle: "Chrome 확장 프로그램 설치",
       vscodeTitle: "VS Code 확장 설치",
@@ -210,9 +212,37 @@ const ko: MessageSchema = {
       original: "원래의",
       result: "결과",
       notImage: "이미지 파일을 선택해주세요",
       failed: "이미지 처리 실패"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default ko
diff --git a/src/i18n/locales/pt-BR.ts b/src/i18n/locales/pt-BR.ts
index 638da32..130d3cf 100644
--- a/src/i18n/locales/pt-BR.ts
+++ b/src/i18n/locales/pt-BR.ts
@@ -20,10 +20,12 @@ const ptBR: MessageSchema = {
     notFoundDesc: "A página ou ferramenta que você solicitou não existe.",
     loading: "Carregando…",
     loadError: "Falha ao carregar a ferramenta. Atualize.",
     privacy: "Tudo é executado localmente no seu navegador.",
     toolCount: "{n} ferramentas",
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: "Extensão do Chrome",
       vscode: "Extensão do código VS",
       chromeTitle: "Instale a extensão do Chrome",
       vscodeTitle: "Instale a extensão do VS Code",
@@ -210,9 +212,37 @@ const ptBR: MessageSchema = {
       original: "Original",
       result: "Resultado",
       notImage: "Escolha um arquivo de imagem",
       failed: "Falha no processamento de imagem"
     }
-  }
+  },
+  agent: {
+    newChat: 'New chat',
+    threads: 'Chats',
+    deleteThread: 'Delete chat',
+    placeholder: 'Type a message… (the model can call local tools)',
+    send: 'Send',
+    stop: 'Stop',
+    settings: 'Model settings',
+    settingsTitle: 'BYOK settings',
+    settingsDesc: 'Keys stay in localStorage on this device and are never uploaded to SimpleTools servers.',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: 'Model',
+    systemPrompt: 'System prompt',
+    rememberKey: 'Remember API Key on this device',
+    save: 'Save',
+    cancel: 'Cancel',
+    empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
+    missingSettings: 'Configure Base URL, API Key, and model first.',
+    toolCall: 'Tool call',
+    toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
+    streaming: 'Generating…',
+    error: 'Something went wrong',
+  },
 }
 
 export default ptBR
diff --git a/src/i18n/locales/zh-CN.ts b/src/i18n/locales/zh-CN.ts
index 3da96ea..2b43f96 100644
--- a/src/i18n/locales/zh-CN.ts
+++ b/src/i18n/locales/zh-CN.ts
@@ -18,10 +18,12 @@ const zhCN = {
     notFoundDesc: '你访问的页面或工具不存在。',
     loading: '加载中…',
     loadError: '工具加载失败，请刷新重试。',
     privacy: '所有处理均在本地浏览器中完成。',
     toolCount: '共 {n} 个工具',
+    agent: 'Agent',
+    agentTitle: 'SimpleTools Agent',
     extensions: {
       chrome: 'Chrome 插件',
       vscode: 'VS Code 插件',
       chromeTitle: '安装 Chrome 插件',
       vscodeTitle: '安装 VS Code 插件',
@@ -209,9 +211,37 @@ const zhCN = {
       result: '结果',
       notImage: '请选择图片文件',
       failed: '图片处理失败',
     },
   },
+  agent: {
+    newChat: '新会话',
+    threads: '会话',
+    deleteThread: '删除会话',
+    placeholder: '输入消息…（可让模型调用本机工具）',
+    send: '发送',
+    stop: '停止',
+    settings: '模型设置',
+    settingsTitle: 'BYOK 设置',
+    settingsDesc: '密钥仅保存在本机 localStorage，不会上传到 SimpleTools 服务器。',
+    apiBaseUrl: 'API Base URL',
+    apiKey: 'API Key',
+    model: '模型',
+    systemPrompt: '系统提示',
+    rememberKey: '在本机记住 API Key',
+    save: '保存',
+    cancel: '取消',
+    empty: '发送一条消息开始对话。HostTools：list_tools / open_tool / run_offline_tool。',
+    missingSettings: '请先配置 Base URL、API Key 与模型。',
+    toolCall: '调用工具',
+    toolResult: '工具结果',
+    roleUser: '你',
+    roleAssistant: '助手',
+    roleTool: '工具',
+    chromeHostWarning: 'Chrome 插件版暂未申请 host 权限，扩展内直连云端 API 可能失败；请优先用网页版，或等待后续 optional host permissions。',
+    streaming: '生成中…',
+    error: '出错了',
+  },
 }
 
 export default zhCN
 export type MessageSchema = typeof zhCN
diff --git a/src/pages/AgentPage.vue b/src/pages/AgentPage.vue
new file mode 100644
index 0000000..b991dd6
--- /dev/null
+++ b/src/pages/AgentPage.vue
@@ -0,0 +1,51 @@
+<script setup lang="ts">
+import { onMounted } from 'vue'
+import { Settings } from 'lucide-vue-next'
+import { Button } from '@/components/ui/button'
+import { useAgentStore } from '@/stores/agent'
+import AgentThreadList from '@/components/agent/AgentThreadList.vue'
+import AgentMessageList from '@/components/agent/AgentMessageList.vue'
+import AgentComposer from '@/components/agent/AgentComposer.vue'
+import AgentSettingsDialog from '@/components/agent/AgentSettingsDialog.vue'
+
+const agent = useAgentStore()
+function openSettings() {
+  agent.settingsOpen = true
+}
+onMounted(() => {
+  void agent.init()
+})
+</script>
+
+<template>
+  <div
+    class="bg-background flex min-h-0 flex-1 overflow-hidden rounded-none border-t sm:rounded-lg sm:border"
+    data-testid="agent-page"
+  >
+    <AgentThreadList />
+    <section class="flex min-w-0 flex-1 flex-col">
+      <header class="flex h-12 items-center gap-2 border-b px-3">
+        <h1 class="truncate text-sm font-semibold">
+          {{ agent.currentTitle || $t('agent.newChat') }}
+        </h1>
+        <Button
+          class="ml-auto"
+          variant="ghost"
+          size="icon"
+          data-testid="agent-settings"
+          :aria-label="$t('agent.settings')"
+          @click="openSettings"
+        >
+          <Settings />
+        </Button>
+      </header>
+      <AgentMessageList />
+      <p v-if="agent.error === 'missing-settings'" class="text-destructive px-3 text-xs">
+        {{ $t('agent.missingSettings') }}
+      </p>
+      <p v-else-if="agent.error" class="text-destructive px-3 text-xs">{{ agent.error }}</p>
+      <AgentComposer />
+    </section>
+    <AgentSettingsDialog />
+  </div>
+</template>
diff --git a/src/router/index.ts b/src/router/index.ts
index 4914fc2..2056eeb 100644
--- a/src/router/index.ts
+++ b/src/router/index.ts
@@ -18,10 +18,15 @@ export const router = createRouter({
       name: 'tool',
       component: () => import('@/pages/ToolPage.vue'),
       props: true,
       beforeEnter: (to) => (getTool(String(to.params.slug)) ? true : { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') } }),
     },
+    {
+      path: '/agent',
+      name: 'agent',
+      component: () => import('@/pages/AgentPage.vue'),
+    },
     { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/NotFoundPage.vue') },
   ],
   scrollBehavior: () => ({ top: 0 }),
 })
 
@@ -29,9 +34,11 @@ router.afterEach((to) => {
   const t = i18n.global.t
   if (to.name === 'tool') {
     const slug = String(to.params.slug)
     useUserStore().addRecent(slug)
     document.title = `${t(`tools.${slug}.name`)} · SimpleTools`
+  } else if (to.name === 'agent') {
+    document.title = `${t('app.agentTitle')} · SimpleTools`
   } else {
     document.title = 'SimpleTools'
   }
 })
diff --git a/src/stores/agent.ts b/src/stores/agent.ts
new file mode 100644
index 0000000..20bb6c5
--- /dev/null
+++ b/src/stores/agent.ts
@@ -0,0 +1,204 @@
+import { computed, ref, shallowRef } from 'vue'
+import { defineStore } from 'pinia'
+import { useI18n } from 'vue-i18n'
+import { useRouter } from 'vue-router'
+import {
+  ChatEngine,
+  createHostTools,
+  indexedDbStore,
+  loadAgentSettings,
+  resolveAgentConfig,
+  saveAgentSettings,
+  type ChatMessage,
+  type ChatThread,
+  type PersistedAgentSettings,
+} from '@/agent'
+
+export const useAgentStore = defineStore('agent', () => {
+  const router = useRouter()
+  const { t } = useI18n()
+
+  const engine = shallowRef<ChatEngine | null>(null)
+  const threads = ref<ChatThread[]>([])
+  const messages = ref<ChatMessage[]>([])
+  const currentThreadId = ref<string | null>(null)
+  const streaming = ref(false)
+  const error = ref<string | null>(null)
+  const settingsOpen = ref(false)
+  const draftSettings = ref<PersistedAgentSettings>({
+    apiBaseUrl: '',
+    apiKey: '',
+    model: '',
+    systemPrompt: '',
+    rememberKey: true,
+  })
+  const ready = ref(false)
+
+  const currentTitle = computed(() => {
+    return threads.value.find((x) => x.id === currentThreadId.value)?.title ?? ''
+  })
+
+  function ensureEngine(): ChatEngine {
+    if (engine.value) return engine.value
+    const store = indexedDbStore('simpletools-agent')
+    const eng = new ChatEngine({
+      config: resolveAgentConfig(),
+      store,
+    })
+    for (const tool of createHostTools({ router, t: (k) => String(t(k)) })) {
+      eng.registerTool(tool)
+    }
+    engine.value = eng
+    return eng
+  }
+
+  async function refreshThreads(): Promise<void> {
+    const eng = ensureEngine()
+    threads.value = await eng.listThreads()
+  }
+
+  async function refreshMessages(): Promise<void> {
+    const eng = ensureEngine()
+    if (!eng.currentThreadId) {
+      messages.value = []
+      currentThreadId.value = null
+      return
+    }
+    currentThreadId.value = eng.currentThreadId
+    messages.value = await eng.getMessages(eng.currentThreadId)
+  }
+
+  async function init(): Promise<void> {
+    if (ready.value) return
+    const eng = ensureEngine()
+    loadSettingsIntoDraft()
+    eng.updateConfig(resolveAgentConfig())
+    await refreshThreads()
+    if (!threads.value.length) {
+      await eng.createThread()
+      await refreshThreads()
+    } else {
+      await eng.selectThread(threads.value[0]!.id)
+    }
+    await refreshMessages()
+    ready.value = true
+  }
+
+  function loadSettingsIntoDraft(): void {
+    const stored = loadAgentSettings()
+    draftSettings.value = {
+      apiBaseUrl: stored?.apiBaseUrl ?? '',
+      apiKey: stored?.apiKey ?? '',
+      model: stored?.model ?? '',
+      systemPrompt: stored?.systemPrompt ?? '',
+      rememberKey: stored?.rememberKey ?? true,
+    }
+  }
+
+  function saveSettings(): void {
+    saveAgentSettings({ ...draftSettings.value })
+    ensureEngine().updateConfig(resolveAgentConfig(draftSettings.value))
+    settingsOpen.value = false
+  }
+
+  async function newThread(): Promise<void> {
+    const eng = ensureEngine()
+    await eng.createThread()
+    await refreshThreads()
+    await refreshMessages()
+  }
+
+  async function selectThread(id: string): Promise<void> {
+    const eng = ensureEngine()
+    await eng.selectThread(id)
+    await refreshMessages()
+  }
+
+  async function deleteThread(id: string): Promise<void> {
+    const eng = ensureEngine()
+    await eng.deleteThread(id)
+    await refreshThreads()
+    if (!threads.value.length) await newThread()
+    else {
+      await eng.selectThread(threads.value[0]!.id)
+      await refreshMessages()
+    }
+  }
+
+  async function send(text: string): Promise<boolean> {
+    const eng = ensureEngine()
+    const cfg = resolveAgentConfig()
+    if (!cfg.apiBaseUrl || !cfg.apiKey || !cfg.model) {
+      error.value = 'missing-settings'
+      settingsOpen.value = true
+      return false
+    }
+    eng.updateConfig(cfg)
+    streaming.value = true
+    error.value = null
+    try {
+      for await (const ev of eng.send(text)) {
+        if (ev.type === 'text-delta') {
+          applyTextDelta(ev.messageId, ev.delta)
+        } else if (ev.type === 'message' || ev.type === 'done') {
+          await refreshMessages()
+        }
+        if (ev.type === 'thread') await refreshThreads()
+        if (ev.type === 'tool-result' || ev.type === 'tool-call') {
+          await refreshMessages()
+        }
+        if (ev.type === 'error') {
+          // Intentional user stop — clear streaming without a failure banner.
+          if (!isIntentionalAbort(ev.error)) {
+            error.value = ev.error.message
+          }
+        }
+      }
+    } finally {
+      streaming.value = false
+      await refreshThreads()
+      await refreshMessages()
+    }
+    return true
+  }
+
+  function applyTextDelta(messageId: string, delta: string): void {
+    const idx = messages.value.findIndex((m) => m.id === messageId)
+    if (idx < 0) return
+    const cur = messages.value[idx]!
+    messages.value[idx] = {
+      ...cur,
+      content: cur.content + delta,
+      status: 'streaming',
+    }
+  }
+
+  function isIntentionalAbort(err: Error): boolean {
+    return err.message === 'Aborted' || err.name === 'AbortError'
+  }
+
+  function stop(): void {
+    engine.value?.stop()
+    streaming.value = false
+  }
+
+  return {
+    ready,
+    threads,
+    messages,
+    currentThreadId,
+    currentTitle,
+    streaming,
+    error,
+    settingsOpen,
+    draftSettings,
+    init,
+    newThread,
+    selectThread,
+    deleteThread,
+    send,
+    stop,
+    loadSettingsIntoDraft,
+    saveSettings,
+  }
+})
diff --git a/yarn.lock b/yarn.lock
index 4de9e3a..1f5507f 100644
--- a/yarn.lock
+++ b/yarn.lock
@@ -2938,10 +2938,17 @@ __metadata:
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
@@ -5546,10 +5553,11 @@ __metadata:
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
