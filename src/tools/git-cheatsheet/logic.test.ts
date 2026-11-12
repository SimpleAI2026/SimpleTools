import { describe, expect, it } from 'vitest'
import { filterGitItems, GIT_GROUPS, GIT_ITEMS } from './logic'

describe('git-cheatsheet', () => {
  it('lists unique commands in known groups', () => {
    expect(new Set(GIT_ITEMS.map((item) => item.id)).size).toBe(GIT_ITEMS.length)
    expect(GIT_ITEMS.every((item) => GIT_GROUPS.includes(item.group))).toBe(true)
    expect(GIT_ITEMS.every((item) => item.command.startsWith('git '))).toBe(true)
  })

  it('filters by command text', () => {
    expect(filterGitItems('stash').map((item) => item.id)).toEqual(['stash', 'stashPop'])
    expect(filterGitItems('zzzz')).toEqual([])
    expect(filterGitItems('  ')).toHaveLength(GIT_ITEMS.length)
  })
})