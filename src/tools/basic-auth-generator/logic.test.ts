import { describe, expect, it } from 'vitest'
import { basicAuthHeader, parseBasicAuth } from './logic'

describe('basic-auth-generator', () => {
  it('builds and parses a header, including non-ascii', () => {
    const header = basicAuthHeader('ada', 'päss')
    expect(header.startsWith('Authorization: Basic ')).toBe(true)
    expect(parseBasicAuth(header)).toEqual({ username: 'ada', password: 'päss' })
    expect(parseBasicAuth('Basic ' + header.split(' ').at(-1))).toEqual({ username: 'ada', password: 'päss' })
  })

  it('rejects junk', () => {
    expect(parseBasicAuth('Bearer abc')).toBeNull()
    expect(parseBasicAuth('Basic !!!')).toBeNull()
  })
})
