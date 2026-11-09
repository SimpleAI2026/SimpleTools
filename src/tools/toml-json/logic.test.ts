import { describe, expect, it } from 'vitest'
import { jsonToToml, tomlToJson } from './logic'

describe('toml-json', () => {
  it('toml → json', () => {
    expect(tomlToJson('title = "x"\n[server]\nport = 8080\nhosts = ["a", "b"]', 0)).toBe('{"title":"x","server":{"port":8080,"hosts":["a","b"]}}')
  })
  it('json → toml round trip', () => {
    const toml = jsonToToml('{"a":1,"t":{"b":"c"}}')
    expect(tomlToJson(toml, 0)).toBe('{"a":1,"t":{"b":"c"}}')
  })
  it('errors', () => {
    expect(() => jsonToToml('[1]')).toThrow(/object/)
    expect(() => tomlToJson('a = ')).toThrow()
  })
})
