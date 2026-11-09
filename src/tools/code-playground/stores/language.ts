import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { formatMB, languageAssetIds, languageSize, loadManifest, type LanguageSpec, type Manifest } from '@/tools/code-playground/core/manifest'
import { cancelJavaRun } from '@/tools/code-playground/teavm/run'
import { runtimeName, t } from '@/tools/code-playground/i18n'
import { clearJavaCache, ensureJavaToolchain, javaCacheBytes, javaDownloadBytes, javaIsCached, javaReady } from '@/tools/code-playground/teavm/toolchain'
import { cacheUsage, clearCache as clearWasmCache, ensureAsset, getLoaded, isCached, pruneCache } from '@/tools/code-playground/core/wasmLoader'
import { terminal } from '@/tools/code-playground/core/terminal'
import rustLock from '@/tools/code-playground/core/rust-lock.json'
import type { MessageKey } from '@/tools/code-playground/i18n/messages'
import { useRunStore } from './run'

export type LangStatus = 'idle' | 'cached' | 'downloading' | 'ready' | 'error'
export interface LangState {
  status: LangStatus
  loaded: number
  total: number
  error?: string
  detail?: 'download' | 'boot'
}

const allRuntimes = import.meta.env.VITE_ENABLE_ALL_CODE_RUNTIMES !== 'false'
type WebRuntime = typeof import('@/tools/code-playground/core/web-runtime')
let webModule: WebRuntime | undefined

async function loadWebRuntime(): Promise<WebRuntime> {
  if (!allRuntimes) throw new Error('This runtime is only available on the website')
  webModule ??= await import('@/tools/code-playground/core/web-runtime')
  return webModule
}

export const useLanguageStore = defineStore('code-language', () => {
  const manifest = ref<Manifest>()
  const manifestError = ref<string>()
  const selectedId = ref('quickjs')
  const states = reactive<Record<string, LangState>>({})
  const usage = ref(0)
  const selectionOrigin = ref<'user' | 'doc'>('user')
  const controllers = new Map<string, AbortController>()
  const attempt = new Map<string, number>()
  const inflight = new Map<string, { token: number; promise: Promise<boolean> }>()

  function invalidate(id: string) {
    attempt.set(id, (attempt.get(id) ?? 0) + 1)
  }
  function claim(id: string) {
    const token = (attempt.get(id) ?? 0) + 1
    attempt.set(id, token)
    return token
  }
  function live(id: string, token: number) {
    return selectedId.value === id && attempt.get(id) === token
  }
  function park(id: string) {
    const state = states[id]
    if (state?.status !== 'downloading') return
    state.detail = undefined
    state.error = undefined
    state.status = 'idle'
  }

  const languages = computed(() => manifest.value?.languages ?? [])
  const selected = computed(() => languages.value.find((lang) => lang.id === selectedId.value))
  const selectedState = computed(() => selectedId.value ? states[selectedId.value] : undefined)

  function sizeOf(lang: LanguageSpec) {
    if (lang.compiler === 'weblings') return Object.values(rustLock.unpacked).reduce((sum, file) => sum + file.bytes, 0)
    if (lang.compiler === 'teavm') return javaDownloadBytes()
    return manifest.value ? languageSize(manifest.value, lang) : 0
  }
  async function refreshUsage() {
    const rust = webModule ? await webModule.rustCacheBytes() : 0
    usage.value = (await cacheUsage()) + rust + (await javaCacheBytes())
  }
  async function refreshStatuses() {
    const current = manifest.value
    const lang = current?.languages.find((item) => item.id === selectedId.value)
    if (!current || !lang) return
    states[lang.id] ??= { status: 'idle', loaded: 0, total: sizeOf(lang) }
    const state = states[lang.id]!
    if (state.status === 'downloading') return
    if (lang.compiler === 'weblings') {
      const web = await loadWebRuntime()
      if (web.rustReady()) state.status = 'ready'
      else if (await web.rustIsCached()) state.status = 'cached'
      else if (state.status !== 'error') state.status = 'idle'
      return
    }
    if (lang.compiler === 'teavm') {
      if (javaReady()) state.status = 'ready'
      else if (await javaIsCached()) state.status = 'cached'
      else if (state.status !== 'error') state.status = 'idle'
      return
    }
    const ids = languageAssetIds(lang)
    if (ids.every((id) => getLoaded(id))) state.status = 'ready'
    else if ((await Promise.all(ids.map((id) => isCached(current.assets[id]!)))).every(Boolean)) state.status = 'cached'
    else if (state.status !== 'error') state.status = 'idle'
  }

  async function init(id = selectedId.value) {
    selectedId.value = id
    try {
      manifest.value = await loadManifest()
      manifestError.value = undefined
    } catch (error) {
      manifestError.value = (error as Error).message
      return
    }
    if (!languages.value.some((lang) => lang.id === selectedId.value)) {
      manifestError.value = t('runtimeNotLoaded', { asset: id })
      return
    }
    await pruneCache(Object.values(manifest.value.assets)).catch(() => {})
    await refreshStatuses()
    void refreshUsage()
    void navigator.storage?.persist?.().catch(() => {})
    if (selected.value) void ensure(selected.value.id)
  }

  function releaseRuntime() {
    useRunStore().abandon()
    cancelJavaRun()
    webModule?.releaseWebRuntimes()
    for (const [id, controller] of [...controllers]) {
      invalidate(id)
      controller.abort()
      park(id)
    }
    invalidate(selectedId.value)
    terminal.detachInput()
    terminal.clear()
  }

  async function select(id: string, origin: 'user' | 'doc' = 'user') {
    if (selectedId.value !== id) releaseRuntime()
    selectionOrigin.value = origin
    selectedId.value = id
    try {
      return await ensure(id)
    } catch (error) {
      if ((error as Error).name === 'AbortError') return false
      throw error
    }
  }

  function ensure(id: string): Promise<boolean> {
    const current = attempt.get(id) ?? 0
    const flight = inflight.get(id)
    if (flight && flight.token === current) return flight.promise
    const token = claim(id)
    const promise = doEnsure(id, token).finally(() => {
      if (inflight.get(id)?.token === token) inflight.delete(id)
    })
    inflight.set(id, { token, promise })
    return promise
  }

  async function doEnsure(id: string, token: number): Promise<boolean> {
    const current = manifest.value
    const lang = current?.languages.find((item) => item.id === id)
    if (!current || !lang || !live(id, token)) return false
    states[id] ??= { status: 'idle', loaded: 0, total: sizeOf(lang) }
    const state = states[id]!
    if (state.status === 'ready') return true
    const label = runtimeName(lang.id, lang.label)
    const note = (key: MessageKey, vars?: Record<string, string | number>, color = '2') => {
      if (live(id, token)) terminal.system(key, vars, color)
    }
    const controller = new AbortController()
    controllers.set(id, controller)
    const fromNetwork = state.status !== 'cached'
    state.status = 'downloading'
    state.error = undefined
    state.total = sizeOf(lang)
    state.loaded = 0
    if (fromNetwork) note(lang.compiler === 'teavm' || lang.compiler === 'weblings' ? 'downloadingToolchain' : 'downloadingRuntime', { label, size: formatMB(state.total) })
    try {
      if (lang.compiler === 'weblings') {
        const web = await loadWebRuntime()
        await web.ensureRustToolchain((loaded, total) => {
          if (!live(id, token)) return
          state.loaded = loaded
          state.total = total
        }, controller.signal)
      } else if (lang.compiler === 'teavm') {
        await ensureJavaToolchain((loaded, total) => {
          if (!live(id, token)) return
          state.loaded = loaded
          state.total = total
        }, controller.signal)
      } else {
        const progress: Record<string, number> = {}
        await Promise.all(languageAssetIds(lang).map((assetId) => ensureAsset(
          assetId,
          current.assets[assetId]!,
          (loaded) => {
            if (!live(id, token)) return
            progress[assetId] = loaded
            state.loaded = Object.values(progress).reduce((a, b) => a + b, 0)
          },
          controller.signal,
        )))
        if (lang.runtime === 'v86' && live(id, token)) {
          const web = await loadWebRuntime()
          state.detail = 'boot'
          note('bootingLinux')
          await web.bootLinux()
        }
      }
      if (!live(id, token)) return false
      state.detail = undefined
      state.status = 'ready'
      state.loaded = state.total
      if (fromNetwork && lang.runtime !== 'v86') note('readyCached', { label }, '32')
      await refreshStatuses()
      void refreshUsage()
      return true
    } catch (error) {
      if (!live(id, token)) return false
      const aborted = (error as Error).name === 'AbortError'
      const stopped = allRuntimes && webModule && error instanceof webModule.LinuxKilled
      state.detail = undefined
      state.status = aborted || stopped ? (stopped ? 'cached' : 'idle') : 'error'
      state.error = aborted || stopped ? undefined : (error as Error).message
      if (!stopped) note(aborted ? 'canceledDownload' : 'downloadFailedLabel', aborted ? { label } : { label, error: (error as Error).message }, aborted ? '2' : '31')
      return false
    } finally {
      if (controllers.get(id) === controller) controllers.delete(id)
    }
  }

  function cancel(id: string) {
    controllers.get(id)?.abort()
  }
  async function clearCache() {
    releaseRuntime()
    await clearWasmCache()
    await clearJavaCache()
    if (webModule) await webModule.clearRustCache()
    else if (typeof caches !== 'undefined') await caches.delete('simpletools-code-rustc-v1')
    for (const state of Object.values(states)) if (state.status !== 'downloading') state.status = 'idle'
    await refreshUsage()
  }
  function dispose() {
    releaseRuntime()
  }

  return { manifest, manifestError, languages, selectedId, selected, selectedState, states, usage, selectionOrigin, init, select, ensure, cancel, clearCache, dispose, sizeOf }
})
