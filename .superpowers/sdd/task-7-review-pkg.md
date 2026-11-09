# Review package Task 7 (with fixes)
BASE: 180a780c1bfe5fea62fb9334c3eac5f238361369
HEAD: f7a06f07ee7846a6677a434de47bdf17bb3ab21f

## Commits
f7a06f0 fix(agent): stop abort UX and reduce stream message refreshes
fd6c98b feat(agent): add Pinia agent store wiring ChatEngine

## Stat
 src/agent/ChatEngine.ts                |   4 +-
 src/agent/__tests__/ChatEngine.test.ts |  87 ++++++++++++++
 src/stores/agent.ts                    | 203 +++++++++++++++++++++++++++++++++
 3 files changed, 293 insertions(+), 1 deletion(-)

## Diff
diff --git a/src/agent/ChatEngine.ts b/src/agent/ChatEngine.ts
index b070a9b..e62c19f 100644
--- a/src/agent/ChatEngine.ts
+++ b/src/agent/ChatEngine.ts
@@ -148,17 +148,19 @@ export class ChatEngine {
       thread.title = text.slice(0, 40) + (text.length > 40 ? '…' : '')
     }
     thread.updatedAt = Date.now()
     await this.store.upsertThread(thread)
 
     const userEv: ChatEvent = { type: 'message', message: userMsg }
     this.emit(userEv)
     yield userEv
-    this.emit({ type: 'thread', thread })
+    const threadEv: ChatEvent = { type: 'thread', thread }
+    this.emit(threadEv)
+    yield threadEv
 
     this.abort = new AbortController()
     const signal = this.abort.signal
     const maxRounds = this.config.maxToolRounds ?? 5
     const provider = this.getProvider()
     // Nano path does not run OpenAI tools (v1).
     const toolsEnabled = provider.supportsTools && this.tools.list().length > 0
 
diff --git a/src/agent/__tests__/ChatEngine.test.ts b/src/agent/__tests__/ChatEngine.test.ts
index 37f0401..04fa785 100644
--- a/src/agent/__tests__/ChatEngine.test.ts
+++ b/src/agent/__tests__/ChatEngine.test.ts
@@ -1,11 +1,12 @@
 import { describe, it, expect, vi, beforeEach } from 'vitest'
 import { ChatEngine } from '../ChatEngine'
 import { MemoryStore } from '../MemoryStore'
+import type { ChatEvent } from '../types'
 
 function sseChunk(obj: unknown): string {
   return `data: ${JSON.stringify(obj)}\n\n`
 }
 
 function streamResponse(chunks: string[]): Response {
   const encoder = new TextEncoder()
   const stream = new ReadableStream<Uint8Array>({
@@ -114,9 +115,95 @@ describe('ChatEngine', () => {
     for await (const ev of engine.send('run echo')) {
       if (ev.type === 'tool-result') toolResults.push(ev.result)
       if (ev.type === 'done') final = ev.message.content
     }
     expect(toolResults[0]).toEqual({ x: 1 })
     expect(final).toBe('done')
     expect(fetchMock).toHaveBeenCalledTimes(2)
   })
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
 })
diff --git a/src/stores/agent.ts b/src/stores/agent.ts
new file mode 100644
index 0000000..542f61e
--- /dev/null
+++ b/src/stores/agent.ts
@@ -0,0 +1,203 @@
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
+  async function send(text: string): Promise<void> {
+    const eng = ensureEngine()
+    const cfg = resolveAgentConfig()
+    if (!cfg.apiBaseUrl || !cfg.apiKey || !cfg.model) {
+      error.value = 'missing-settings'
+      settingsOpen.value = true
+      return
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
