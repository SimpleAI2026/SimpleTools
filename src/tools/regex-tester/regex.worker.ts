import { runRegex } from './logic'

self.onmessage = (e: MessageEvent<{ pattern: string; flags: string; text: string; replacement: string | null }>) => {
  const { pattern, flags, text, replacement } = e.data
  try {
    self.postMessage({ ok: true, result: runRegex(pattern, flags, text, replacement) })
  } catch (err) {
    self.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
