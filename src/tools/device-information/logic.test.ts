import { describe, expect, it } from 'vitest'
import { formatDevice, type DeviceFacts } from './logic'

describe('device information', () => {
  it('prints every fact on its own line', () => {
    const facts: DeviceFacts = {
      userAgent: 'Test',
      language: 'en',
      languages: 'en',
      hardwareConcurrency: '4',
      deviceMemory: '8',
      screen: '1920x1080',
      viewport: '800x600',
      timezone: 'UTC',
      touch: 'false',
      cookieEnabled: 'true',
      platform: 'Linux',
      colorScheme: 'dark',
    }
    expect(formatDevice(facts)).toContain('userAgent: Test')
    expect(formatDevice(facts).split('\n')).toHaveLength(12)
  })
})
