import { ref, type WatchSource } from 'vue'
import { watchDebounced } from '@vueuse/core'

/** Run an async transform whenever `source` changes (debounced); stale results are discarded. */
export function useAsyncOutput(source: WatchSource | (WatchSource | object)[], fn: () => Promise<string> | string, debounce = 250) {
  const output = ref('')
  const error = ref('')
  const busy = ref(false)
  let seq = 0
  watchDebounced(
    source,
    async () => {
      const id = ++seq
      busy.value = true
      try {
        const r = await fn()
        if (id === seq) {
          output.value = r
          error.value = ''
        }
      } catch (e) {
        if (id === seq) {
          output.value = ''
          error.value = e instanceof Error ? e.message : String(e)
        }
      } finally {
        if (id === seq) busy.value = false
      }
    },
    { debounce, immediate: true, deep: true },
  )
  return { output, error, busy }
}
