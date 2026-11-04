import { onBeforeUnmount, ref } from 'vue'

/**
 * Hold a single object URL. Replaces revoke the previous URL; unmount revokes the current one.
 * Empty string means "no URL" (truthy checks in templates stay equivalent to null).
 */
export function useObjectUrl() {
  const url = ref('')
  function revoke() {
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = ''
  }
  /** Revoke any current URL, then point at a new blob/file (or clear when falsy). */
  function setObject(blob: Blob | MediaSource | null | undefined) {
    revoke()
    if (blob) url.value = URL.createObjectURL(blob)
  }
  onBeforeUnmount(revoke)
  return { url, setObject, revoke }
}
