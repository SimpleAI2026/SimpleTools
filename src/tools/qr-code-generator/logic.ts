export type QrContentType = 'text' | 'url' | 'wifi' | 'email' | 'phone' | 'sms'

export interface WifiData {
  ssid: string
  password: string
  security: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

/** Escape special characters for the WIFI: payload (\ ; , : "). */
export function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, '\\$1')
}

export function wifiPayload(w: WifiData): string {
  const parts = [`T:${w.security}`, `S:${escapeWifi(w.ssid)}`]
  if (w.security !== 'nopass') parts.push(`P:${escapeWifi(w.password)}`)
  if (w.hidden) parts.push('H:true')
  return `WIFI:${parts.join(';')};;`
}

export function buildPayload(type: QrContentType, value: string, extra: { subject?: string; body?: string; wifi?: WifiData } = {}): string {
  switch (type) {
    case 'url':
      return /^[a-z][\w+.-]*:/i.test(value.trim()) ? value.trim() : `https://${value.trim()}`
    case 'email': {
      const q = new URLSearchParams()
      if (extra.subject) q.set('subject', extra.subject)
      if (extra.body) q.set('body', extra.body)
      const qs = q.toString().replace(/\+/g, '%20')
      return `mailto:${value.trim()}${qs ? `?${qs}` : ''}`
    }
    case 'phone':
      return `tel:${value.replace(/[^\d+]/g, '')}`
    case 'sms':
      return `SMSTO:${value.replace(/[^\d+]/g, '')}:${extra.body ?? ''}`
    case 'wifi':
      return wifiPayload(extra.wifi ?? { ssid: '', password: '', security: 'WPA', hidden: false })
    default:
      return value
  }
}

export function isValidHexColor(c: string): boolean {
  return /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(c)
}
