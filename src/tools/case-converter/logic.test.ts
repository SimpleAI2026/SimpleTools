import { describe, expect, it } from 'vitest'
import { convertCase, splitWords } from './logic'

describe('case-converter', () => {
  it('splits words', () => {
    expect(splitWords('helloWorld_fooBar-baz qux')).toEqual(['hello', 'World', 'foo', 'Bar', 'baz', 'qux'])
    expect(splitWords('XMLHttpRequest')).toEqual(['XML', 'Http', 'Request'])
    expect(splitWords('version2Update')).toEqual(['version2', 'Update'])
  })
  it('converts', () => {
    const s = 'hello world-foo_bar'
    expect(convertCase(s, 'camel')).toBe('helloWorldFooBar')
    expect(convertCase(s, 'pascal')).toBe('HelloWorldFooBar')
    expect(convertCase(s, 'snake')).toBe('hello_world_foo_bar')
    expect(convertCase(s, 'constant')).toBe('HELLO_WORLD_FOO_BAR')
    expect(convertCase(s, 'kebab')).toBe('hello-world-foo-bar')
    expect(convertCase(s, 'dot')).toBe('hello.world.foo.bar')
    expect(convertCase(s, 'title')).toBe('Hello World Foo Bar')
    expect(convertCase('Hi There', 'upper')).toBe('HI THERE')
    expect(convertCase('Hi There', 'lower')).toBe('hi there')
  })
  it('sentence case', () => {
    expect(convertCase('hello WORLD. how ARE you? fine', 'sentence')).toBe('Hello world. How are you? Fine')
  })
  it('handles empty input', () => {
    expect(convertCase('', 'camel')).toBe('')
  })
})
