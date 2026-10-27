import { describe, expect, it } from 'vitest'
import { makeTeams, parseNames, pickNames } from './logic'

describe('random-name-picker', () => {
  it('parses names', () => {
    expect(parseNames('Alice\nBob, Carol；Bob\n\n')).toEqual(['Alice', 'Bob', 'Carol'])
    expect(parseNames('a,a', false)).toEqual(['a', 'a'])
  })
  it('picks distinct winners', () => {
    const names = ['a', 'b', 'c', 'd']
    const p = pickNames(names, 3)
    expect(new Set(p).size).toBe(3)
    expect(pickNames(names, 10)).toHaveLength(4)
    expect(pickNames([], 1)).toEqual([])
  })
  it('makes balanced teams', () => {
    const teams = makeTeams(['a', 'b', 'c', 'd', 'e'], 2)
    expect(teams.map((t) => t.length).sort()).toEqual([2, 3])
    expect(teams.flat().sort()).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})
