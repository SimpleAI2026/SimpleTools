import { describe, expect, it } from 'vitest'
import { convertCss, pxToRem, remToPx } from './logic'

describe('px-rem', () => {
  it('converts', () => {
    expect(pxToRem(24)).toBe(1.5)
    expect(pxToRem(10, 10)).toBe(1)
    expect(remToPx(1.25)).toBe(20)
    expect(pxToRem(1, 3)).toBe(0.3333)
  })
  it('converts css', () => {
    expect(convertCss('margin: 16px 8px; border: 1px solid; top:-32px')).toBe('margin: 1rem 0.5rem; border: 1px solid; top:-2rem')
    expect(convertCss('border: 1px', 16, false)).toBe('border: 0.0625rem')
  })
})
