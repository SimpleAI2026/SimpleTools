/** Pending composer attachment (Phase A: images). */
export interface PendingAttachment {
  id: string
  file: File
  /** Object URL for chip preview; revoke on remove/send. */
  previewUrl: string
  name: string
  mime: string
  size: number
}

export const DEFAULT_ACCEPT = 'image/*'
export const DEFAULT_MAX_ATTACHMENT_BYTES = 4_000_000
export const DEFAULT_MAX_ATTACHMENTS = 5

export function createPendingId(): string {
  return `att_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

export function isImageFile(file: File): boolean {
  return (file.type || '').startsWith('image/')
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('FileReader failed'))
    reader.readAsDataURL(file)
  })
}

export function resolveUploadToUrl(result: {
  url?: string
  base64?: string
  mime?: string
  id?: string
}): string {
  if (result.url) return result.url
  if (result.base64) {
    const b64 = result.base64
    if (b64.startsWith('data:')) return b64
    const mime = result.mime || 'application/octet-stream'
    return `data:${mime};base64,${b64}`
  }
  throw new Error('upload handler must return url or base64')
}
