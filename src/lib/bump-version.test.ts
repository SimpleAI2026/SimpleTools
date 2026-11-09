import { describe, expect, it } from 'vitest'
// @ts-expect-error JavaScript module has no declaration file.
import { nextPatch } from '../../scripts/bump-version.mjs'

describe('extension version bump', () => {
  it('increments the patch component', () => {
    expect(nextPatch('5.0.0')).toBe('5.0.1')
    expect(nextPatch('5.0.99')).toBe('5.0.100')
    expect(nextPatch('5.9.9')).toBe('5.9.10')
  })

  it('rejects versions that cannot be incremented safely', () => {
    expect(() => nextPatch('5.0')).toThrow('three-part version')
    expect(() => nextPatch('5.0.0-beta')).toThrow('three-part version')
  })
})
