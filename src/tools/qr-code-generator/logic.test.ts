import { describe, expect, it } from 'vitest'
import { toString } from 'qrcode'
import { buildPayload, isValidHexColor, wifiPayload } from './logic'

describe('qr-code-generator', () => {
  it('builds payloads', () => {
    expect(buildPayload('url', 'example.com')).toBe('https://example.com')
    expect(buildPayload('url', 'ftp://x')).toBe('ftp://x')
    expect(buildPayload('email', 'a@b.c', { subject: 'Hi there', body: 'x&y' })).toBe('mailto:a@b.c?subject=Hi%20there&body=x%26y')
    expect(buildPayload('phone', '+86 138-0000')).toBe('tel:+861380000')
    expect(buildPayload('sms', '123', { body: 'yo' })).toBe('SMSTO:123:yo')
    expect(buildPayload('text', ' raw ')).toBe(' raw ')
  })
  it('escapes wifi', () => {
    expect(wifiPayload({ ssid: 'My;Net', password: 'p:w"', security: 'WPA', hidden: true })).toBe('WIFI:T:WPA;S:My\\;Net;P:p\\:w\\";H:true;;')
    expect(wifiPayload({ ssid: 'Open', password: 'x', security: 'nopass', hidden: false })).toBe('WIFI:T:nopass;S:Open;;')
  })
  it('colors', () => {
    expect(isValidHexColor('#ff00aa')).toBe(true)
    expect(isValidHexColor('red')).toBe(false)
  })
  it('qrcode library produces SVG', async () => {
    const svg = await toString('hello', { type: 'svg' })
    expect(svg).toContain('<svg')
  })
})
