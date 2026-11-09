import { describe, expect, it } from 'vitest'
import { parseUrl, withParams } from './logic'

describe('url-parser', () => {
  it('parses', () => {
    const p = parseUrl('https://user:p%40ss@example.com:8080/a%20b/c?q=1&q=2&x=%E4%B8%AD#frag')!
    expect(p).toMatchObject({ protocol: 'https:', username: 'user', password: 'p@ss', hostname: 'example.com', port: '8080', pathname: '/a b/c', hash: '#frag' })
    expect(p.params).toEqual([['q', '1'], ['q', '2'], ['x', '中']])
  })
  it('adds scheme when missing', () => {
    expect(parseUrl('example.com/path')?.href).toBe('https://example.com/path')
    expect(parseUrl('notaurl')).toBeNull()
    expect(parseUrl('')).toBeNull()
  })
  it('rebuilds params', () => {
    expect(withParams('https://a.com/?x=1#h', [['y', '中 文'], ['', 'skip']])).toBe('https://a.com/?y=%E4%B8%AD+%E6%96%87#h')
  })
})
