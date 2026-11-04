import type { Ref } from 'vue'

/** Shared busy + error refs used by most file/PDF tool UIs. */
export type BusyError = {
  busy: Ref<boolean>
  error: Ref<string>
}

export type RunBusyOptions = {
  /** Clear `error` before starting. Default false (matches most PDF convert tools). */
  clearError?: boolean
  /** Map a thrown value to the string stored in `error`. */
  mapError?: (e: unknown) => string
}

/** Normalize thrown values the same way as usePdfFile / useSpreadsheet. */
export function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

/**
 * Run an async job while flipping `busy` and capturing failures into `error`.
 * Does not rethrow — callers that previously swallowed errors keep that contract.
 */
export async function runBusy<T>(state: BusyError, fn: () => Promise<T>, opts: RunBusyOptions = {}): Promise<T | undefined> {
  state.busy.value = true
  if (opts.clearError) state.error.value = ''
  try {
    return await fn()
  } catch (e) {
    state.error.value = opts.mapError?.(e) ?? errMessage(e)
    return undefined
  } finally {
    state.busy.value = false
  }
}

/**
 * Like `runBusy` but without a busy flag — for tools that only assign `error` on failure
 * (e.g. quick PDF transforms that do not show a processing state).
 */
export async function catchError<T>(error: Ref<string>, fn: () => Promise<T>, mapError?: (e: unknown) => string): Promise<T | undefined> {
  try {
    return await fn()
  } catch (e) {
    error.value = mapError?.(e) ?? errMessage(e)
    return undefined
  }
}
