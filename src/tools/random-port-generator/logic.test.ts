import { describe, expect, it } from 'vitest'
import { randomPorts } from './logic'

describe('random-port-generator', () => {
  it('stays inside the range and avoids duplicates', () => {
    let n = 0
    const ports = randomPorts({ count: 3, min: 2000, max: 2002 }, () => n++ % 3)
    expect(ports.sort((a, b) => a - b)).toEqual([2000, 2001, 2002])
    expect(randomPorts({ count: 5, min: 80, max: 80 }, () => 0)).toEqual([80])
  })
})
