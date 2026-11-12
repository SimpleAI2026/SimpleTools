import { describe, expect, it } from 'vitest'
import { asciiArt } from './logic'

describe('ascii art', () => {
  it('renders the Standard FIGlet font', () => {
    const art = asciiArt('Hi')
    expect(art.split('\n')[0]).toContain('_')
    expect(art).toContain('|')
  })
})
