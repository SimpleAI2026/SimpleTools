import { describe, expect, it } from 'vitest'
import { searchMime } from './logic'

describe('mime-types', () => {
  it('looks up an extension and a media type', () => {
    expect(searchMime('.png')[0]).toMatchObject({ type: 'image/png' })
    expect(searchMime('application/json').some((hit) => hit.type === 'application/json')).toBe(true)
    expect(searchMime('json')[0]?.extensions).toContain('json')
    expect(searchMime('')).toHaveLength(50)
  })
})
