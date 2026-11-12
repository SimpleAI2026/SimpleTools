import { describe, expect, it } from 'vitest'
import { filterRegex, REGEX_GROUPS, REGEX_ITEMS } from './logic'

describe('regex-cheatsheet', () => {
  it('lists unique patterns in known groups', () => {
    expect(new Set(REGEX_ITEMS.map((item) => item.id)).size).toBe(REGEX_ITEMS.length)
    expect(REGEX_ITEMS.every((item) => REGEX_GROUPS.includes(item.group))).toBe(true)
    expect(filterRegex('digit', (item) => item.id).map((item) => item.id)).toEqual(['digit'])
  })
})
