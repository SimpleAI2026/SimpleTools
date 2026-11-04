import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  ChatEngine,
  createHostTools,
  indexedDbStore,
  loadAgentSettings,
  resolveAgentConfig,
  saveAgentSettings,
  type ChatMessage,
  type ChatThread,
  type PersistedAgentSettings,
} from '@/agent'

export const useAgentStore = defineStore('agent', () => {
  const router = useRouter()
  const { t } = useI18n()

  const engine = shallowRef<ChatEngine | null>(null)
  const threads = ref<ChatThread[]>([])
  const messages = ref<ChatMessage[]>([])
  const currentThreadId = ref<string | null>(null)
  const streaming = ref(false)
  const error = ref<string | null>(null)
  const settingsOpen = ref(false)
  const draftSettings = ref<PersistedAgentSettings>({
    apiBaseUrl: '',
    apiKey: '',
    model: '',
    systemPrompt: '',
    rememberKey: true,
  })
  const ready = ref(false)

  const currentTitle = computed(() => {
    return threads.value.find((x) => x.id === currentThreadId.value)?.title ?? ''
  })

  function ensureEngine(): ChatEngine {
    if (engine.value) return engine.value
    const store = indexedDbStore('simpletools-agent')
    const eng = new ChatEngine({
      config: resolveAgentConfig(),
      store,
    })
    for (const tool of createHostTools({ router, t: (k) => String(t(k)) })) {
      eng.registerTool(tool)
    }
    engine.value = eng
    return eng
  }

  async function refreshThreads(): Promise<void> {
    const eng = ensureEngine()
    threads.value = await eng.listThreads()
  }

  async function refreshMessages(): Promise<void> {
    const eng = ensureEngine()
    if (!eng.currentThreadId) {
      messages.value = []
      currentThreadId.value = null
      return
    }
    currentThreadId.value = eng.currentThreadId
    messages.value = await eng.getMessages(eng.currentThreadId)
  }

  async function init(): Promise<void> {
    if (ready.value) return
    const eng = ensureEngine()
    loadSettingsIntoDraft()
    eng.updateConfig(resolveAgentConfig())
    await refreshThreads()
    if (!threads.value.length) {
      await eng.createThread()
      await refreshThreads()
    } else {
      await eng.selectThread(threads.value[0]!.id)
    }
    await refreshMessages()
    ready.value = true
  }

  function loadSettingsIntoDraft(): void {
    const stored = loadAgentSettings()
    draftSettings.value = {
      apiBaseUrl: stored?.apiBaseUrl ?? '',
      apiKey: stored?.apiKey ?? '',
      model: stored?.model ?? '',
      systemPrompt: stored?.systemPrompt ?? '',
      rememberKey: stored?.rememberKey ?? true,
    }
  }

  function saveSettings(): void {
    saveAgentSettings({ ...draftSettings.value })
    ensureEngine().updateConfig(resolveAgentConfig(draftSettings.value))
    settingsOpen.value = false
  }

  async function newThread(): Promise<void> {
    const eng = ensureEngine()
    await eng.createThread()
    await refreshThreads()
    await refreshMessages()
  }

  async function selectThread(id: string): Promise<void> {
    const eng = ensureEngine()
    await eng.selectThread(id)
    await refreshMessages()
  }

  async function deleteThread(id: string): Promise<void> {
    const eng = ensureEngine()
    await eng.deleteThread(id)
    await refreshThreads()
    if (!threads.value.length) await newThread()
    else {
      await eng.selectThread(threads.value[0]!.id)
      await refreshMessages()
    }
  }

  async function send(text: string): Promise<void> {
    const eng = ensureEngine()
    const cfg = resolveAgentConfig()
    if (!cfg.apiBaseUrl || !cfg.apiKey || !cfg.model) {
      error.value = 'missing-settings'
      settingsOpen.value = true
      return
    }
    eng.updateConfig(cfg)
    streaming.value = true
    error.value = null
    try {
      for await (const ev of eng.send(text)) {
        if (ev.type === 'message' || ev.type === 'text-delta' || ev.type === 'done') {
          await refreshMessages()
        }
        if (ev.type === 'thread') await refreshThreads()
        if (ev.type === 'tool-result' || ev.type === 'tool-call') {
          await refreshMessages()
        }
        if (ev.type === 'error') {
          error.value = ev.error.message
        }
      }
    } finally {
      streaming.value = false
      await refreshThreads()
      await refreshMessages()
    }
  }

  function stop(): void {
    engine.value?.stop()
    streaming.value = false
  }

  return {
    ready,
    threads,
    messages,
    currentThreadId,
    currentTitle,
    streaming,
    error,
    settingsOpen,
    draftSettings,
    init,
    newThread,
    selectThread,
    deleteThread,
    send,
    stop,
    loadSettingsIntoDraft,
    saveSettings,
  }
})
