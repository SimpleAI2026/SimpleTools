import { describe, expect, it } from 'vitest'
import { flipText, mirrorText } from './logic'

describe('upside-down-text', () => {
  it('flips', () => {
    expect(flipText('hello')).toBe('ollǝɥ')
    expect(flipText('Hi!')).toBe('¡ᴉH')
    expect(flipText(flipText('hello world 69'))).toBe('hello world 69')
  })
  it('mirrors', () => {
    expect(mirrorText('abc😀')).toBe('😀cba')
  })
})
