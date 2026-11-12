import { describe, expect, it } from 'vitest'
import { formatUaReport, parseUserAgent } from './logic'

const CHROME =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'

describe('user-agent-parser', () => {
  it('parses a desktop Chrome UA', () => {
    const report = parseUserAgent(CHROME)
    expect(report.browser).toBe('Chrome')
    expect(report.browserVersion.startsWith('129')).toBe(true)
    expect(report.engine).toBe('Blink')
    expect(report.os).toBe('Linux')
    expect(report.cpu).toBe('amd64')
  })

  it('parses an iPhone Safari UA', () => {
    const report = parseUserAgent(IPHONE)
    expect(report.browser).toBe('Mobile Safari')
    expect(report.os).toBe('iOS')
    expect(report.deviceVendor).toBe('Apple')
    expect(report.deviceModel).toBe('iPhone')
    expect(report.deviceType).toBe('mobile')
  })

  it('formats a copyable report and keeps an empty UA blank', () => {
    const report = parseUserAgent('')
    expect(report.browser).toBe('')
    const text = formatUaReport(report, {
      browser: 'Browser',
      browserVersion: 'Browser version',
      engine: 'Engine',
      engineVersion: 'Engine version',
      os: 'OS',
      osVersion: 'OS version',
      deviceType: 'Device type',
      deviceVendor: 'Vendor',
      deviceModel: 'Model',
      cpu: 'CPU',
    })
    expect(text).toContain('Browser: —')
    expect(text).toContain('User-Agent:')
  })
})
