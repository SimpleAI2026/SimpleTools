/**
 * When secret starts with `my-`, strip the prefix and Base64-decode
 * (URL-safe alphabet + padding). On decode failure, fall back to the original.
 */
export function normalizeSecret(secret: unknown): string {
  if (!secret) return ''
  const s = String(secret).trim()
  if (!s.startsWith('my-')) return s

  const encoded = s.slice(3).replace(/\s+/g, '')
  // URL-safe Base64 → standard
  const urlsafe = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padded = urlsafe + '='.repeat((4 - (urlsafe.length % 4)) % 4)

  try {
    if (typeof atob === 'function') {
      return atob(padded)
    }
    const Buf = (globalThis as { Buffer?: { from(data: string, enc: string): { toString(enc: string): string } } })
      .Buffer
    if (Buf) {
      return Buf.from(padded, 'base64').toString('utf-8')
    }
  } catch (e) {
    console.warn('秘钥Base64解码失败，回退原值：', e)
    return s
  }

  return s
}
