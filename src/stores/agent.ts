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
  checkChromeAiAvailability,
  CHROME_AI_STATUS,
  defaultProviderId,
  type ChatMessage,
  type ChatThread,
  type PersistedAgentSettings,
  type ChatProviderId,
  type ChromeAiStatus,
  type SendOptions,
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
    provider: undefined,
  })
  const chromeAiStatus = ref<ChromeAiStatus>(CHROME_AI_STATUS.UNKNOWN)
  const chromeAiProgress = ref(0)
  const chromeAiChecking = ref(false)
  const chromeAiDownloading = ref(false)
  const ready = ref(false)

  const currentTitle = computed(() => {
    return threads.value.find((x) => x.id === currentThreadId.value)?.title ?? ''
  })

  function ensureEngine(): ChatEngine {
    if (engine.value) return engine.value
    const store = indexedDbStore('simpletools-agent')
    const eng = new ChatEngine({
      config: resolveAgentConfig(draftSettings.value),
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
    eng.updateConfig(resolveAgentConfig(draftSettings.value))
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
    // When rememberKey is false, LS omits apiKey — keep in-memory session key.
    const prevKey = draftSettings.value.apiKey
    const apiKey = stored?.apiKey ?? prevKey ?? ''
    const provider = defaultProviderId({
      storedProvider: stored?.provider,
      apiKey,
    })
    draftSettings.value = {
      apiBaseUrl: stored?.apiBaseUrl ?? '',
      apiKey,
      model: stored?.model ?? '',
      systemPrompt: stored?.systemPrompt ?? '',
      rememberKey: stored?.rememberKey ?? true,
      provider,
    }
  }

  async function refreshChromeAiStatus(): Promise<void> {
    chromeAiChecking.value = true
    try {
      const avail = await checkChromeAiAvailability()
      chromeAiStatus.value = avail.status
    } finally {
      chromeAiChecking.value = false
    }
  }

  async function downloadChromeAiModel(): Promise<void> {
    const eng = ensureEngine()
    chromeAiDownloading.value = true
    chromeAiProgress.value = 0
    try {
      const provider = eng.getChromeAiProvider()
      provider.setOnDownloadProgress((loaded) => {
        chromeAiProgress.value = loaded
        chromeAiStatus.value = CHROME_AI_STATUS.DOWNLOADING
      })
      await provider.ensureSession()
      chromeAiStatus.value = CHROME_AI_STATUS.AVAILABLE
      await refreshChromeAiStatus()
    } catch (err) {
      chromeAiStatus.value = CHROME_AI_STATUS.UNAVAILABLE
      error.value = err instanceof Error ? err.message : String(err)
    } finally {
      chromeAiDownloading.value = false
    }
  }

  function setProvider(provider: ChatProviderId): void {
    draftSettings.value = { ...draftSettings.value, provider }
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

  async function send(text: string, opts?: SendOptions): Promise<boolean> {
    const eng = ensureEngine()
    const attachments = (opts?.attachments ?? []).filter((a) => a && a.url)
    // Always resolve with draft so rememberKey:false session apiKey still works.
    const cfg = resolveAgentConfig(draftSettings.value)
    if (cfg.provider === 'chrome-ai' && attachments.length) {
      error.value = 'chrome-ai-images'
      return false
    }
    if (cfg.provider === 'chrome-ai') {
      const avail = await checkChromeAiAvailability()
      chromeAiStatus.value = avail.status
      if (avail.status !== CHROME_AI_STATUS.AVAILABLE) {
        if (avail.status === CHROME_AI_STATUS.DOWNLOADABLE) {
          error.value = 'chrome-ai-downloadable'
        } else if (avail.status === CHROME_AI_STATUS.DOWNLOADING) {
          error.value = 'chrome-ai-downloading'
        } else {
          error.value = 'chrome-ai-unavailable'
        }
        settingsOpen.value = true
        return false
      }
      eng.updateConfig({ ...cfg, provider: 'chrome-ai' })
    } else if (!cfg.apiBaseUrl || !cfg.apiKey || !cfg.model) {
      error.value = 'missing-settings'
      settingsOpen.value = true
      return false
    } else {
      eng.updateConfig({ ...cfg, provider: 'openai' })
    }
    streaming.value = true
    error.value = null
    try {
      for await (const ev of eng.send(text, attachments.length ? { attachments } : undefined)) {
        if (ev.type === 'text-delta') {
          applyTextDelta(ev.messageId, ev.delta)
        } else if (ev.type === 'message' || ev.type === 'done') {
          await refreshMessages()
        }
        if (ev.type === 'thread') await refreshThreads()
        if (ev.type === 'tool-result' || ev.type === 'tool-call') {
          await refreshMessages()
        }
        if (ev.type === 'error') {
          // Intentional user stop — clear streaming without a failure banner.
          if (!isIntentionalAbort(ev.error)) {
            error.value = ev.error.message
          }
        }
      }
    } finally {
      streaming.value = false
      await refreshThreads()
      await refreshMessages()
    }
    return true
  }

  function applyTextDelta(messageId: string, delta: string): void {
    const idx = messages.value.findIndex((m) => m.id === messageId)
    if (idx < 0) return
    const cur = messages.value[idx]!
    messages.value[idx] = {
      ...cur,
      content: cur.content + delta,
      status: 'streaming',
    }
  }

  function isIntentionalAbort(err: Error): boolean {
    return err.message === 'Aborted' || err.name === 'AbortError'
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
    chromeAiStatus,
    chromeAiProgress,
    chromeAiChecking,
    chromeAiDownloading,
    init,
    newThread,
    selectThread,
    deleteThread,
    send,
    stop,
    loadSettingsIntoDraft,
    saveSettings,
    refreshChromeAiStatus,
    downloadChromeAiModel,
    setProvider,
  }
})
