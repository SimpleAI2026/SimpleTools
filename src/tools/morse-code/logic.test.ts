import { describe, expect, it } from 'vitest'
import { fromMorse, toMorse } from './logic'

describe('morse-code', () => {
  it('encodes', () => {
    expect(toMorse('SOS')).toEqual({ output: '... --- ...', unknown: [] })
    expect(toMorse('hi there').output).toBe('.... .. / - .... . .-. .')
    expect(toMorse('a中').unknown).toEqual(['中'])
  })
  it('decodes, tolerating separators', () => {
    expect(fromMorse('.... .. / - .... . .-. .')).toBe('HI THERE')
    expect(fromMorse('•••   ———   •••')).toBe('S O S')
    expect(fromMorse('...---...')).toBe('?')
  })
})
