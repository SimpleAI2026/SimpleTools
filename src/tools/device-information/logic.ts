export interface DeviceFacts {
  userAgent: string
  language: string
  languages: string
  hardwareConcurrency: string
  deviceMemory: string
  screen: string
  viewport: string
  timezone: string
  touch: string
  cookieEnabled: string
  platform: string
  colorScheme: string
}

export function formatDevice(facts: DeviceFacts): string {
  return (Object.keys(facts) as (keyof DeviceFacts)[]).map((key) => `${key}: ${facts[key]}`).join('\n')
}
