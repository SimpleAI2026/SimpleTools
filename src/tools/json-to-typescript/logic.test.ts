import { describe, expect, it } from 'vitest'
import { jsonToTs } from './logic'

const o = { rootName: 'User', useType: false, exportDecl: true, readonly: false }
describe('json-to-typescript', () => {
  it('generates nested interfaces', () => {
    const out = jsonToTs('{"id":1,"name":"a","tags":["x"],"address":{"city":"c"},"posts":[{"id":1,"title":"t"},{"id":2}],"extra-key":null}', o)
    expect(out).toBe(
      [
        'export interface User {\n  id: number\n  name: string\n  tags: string[]\n  address: Address\n  posts: Post[]\n  "extra-key": null\n}',
        'export interface Post {\n  id: number\n  title?: string\n}',
        'export interface Address {\n  city: string\n}',
      ].join('\n\n'),
    )
  })
  it('handles root arrays and unions', () => {
    expect(jsonToTs('[1,"a"]', { ...o, exportDecl: false })).toBe('type User = (number | string)[]')
    expect(jsonToTs('[{"a":1}]', { ...o, useType: true, readonly: true })).toBe('export type User = UserItem[]\n\nexport type UserItem = {\n  readonly a: number\n}'.replace('UserItem[]', 'UserItem[]'))
  })
  it('throws on invalid json', () => expect(() => jsonToTs('{', o)).toThrow())
})
