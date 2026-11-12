import { describe, expect, it } from 'vitest'
import { addLap, formatStopwatch } from './logic'

describe('stopwatch', () => {
  it('formats time and records split laps', () => {
    expect(formatStopwatch(61_234)).toBe('01:01.234')
    expect(formatStopwatch(3_661_000)).toBe('1:01:01.000')
    const laps = addLap(addLap([], 1500), 4000)
    expect(laps.map((lap) => lap.splitMs)).toEqual([1500, 2500])
    expect(laps[1]?.index).toBe(2)
  })
})
