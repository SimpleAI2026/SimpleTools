import UAParser from 'ua-parser-js'

export interface UaReport {
  browser: string
  browserVersion: string
  engine: string
  engineVersion: string
  os: string
  osVersion: string
  deviceType: string
  deviceVendor: string
  deviceModel: string
  cpu: string
  ua: string
}

const text = (value: string | undefined) => value?.trim() || ''

export function parseUserAgent(ua: string): UaReport {
  const result = new UAParser(ua.trim()).getResult()
  return {
    browser: text(result.browser.name),
    browserVersion: text(result.browser.version),
    engine: text(result.engine.name),
    engineVersion: text(result.engine.version),
    os: text(result.os.name),
    osVersion: text(result.os.version),
    deviceType: text(result.device.type),
    deviceVendor: text(result.device.vendor),
    deviceModel: text(result.device.model),
    cpu: text(result.cpu.architecture),
    ua: result.ua,
  }
}

export function formatUaReport(report: UaReport, labels: Record<keyof Omit<UaReport, 'ua'>, string>): string {
  const lines = (Object.keys(labels) as (keyof typeof labels)[]).map((key) => `${labels[key]}: ${report[key] || '—'}`)
  return [...lines, `User-Agent: ${report.ua}`].join('\n')
}
