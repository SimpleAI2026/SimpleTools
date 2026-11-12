import { describe, expect, it } from 'vitest'
import { decodeSafelink } from './logic'

describe('safelink-decoder', () => {
  it('unwraps an Outlook Safe Link, including a nested one', () => {
    const inner = 'https://example.com/a?b=1&c=2'
    const once = `https://nam12.safelinks.protection.outlook.com/?url=${encodeURIComponent(inner)}&data=abc`
    expect(decodeSafelink(once)).toMatchObject({ url: inner, changed: true })
    const twice = `https://eur01.safelinks.protection.outlook.com/ap/v2?url=${encodeURIComponent(once)}`
    expect(decodeSafelink(twice).url).toBe(inner)
  })

  it('leaves ordinary URLs unchanged', () => {
    expect(decodeSafelink('https://example.com').changed).toBe(false)
    expect(decodeSafelink('not a url').url).toBe('not a url')
  })
})
