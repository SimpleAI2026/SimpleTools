import { describe, expect, it } from 'vitest'
import { clampDimension, composeFragment } from './logic'

describe('html-to-image', () => {
  it('composes', () => {
    expect(composeFragment('<p>x</p>', 'p{color:red}')).toBe('<style>p{color:red}</style><p>x</p>')
    expect(composeFragment('<p>x</p>', '  ')).toBe('<p>x</p>')
    expect(composeFragment('', '</style><script>')).toBe('<style><\\/style><script></style>')
  })
  it('clamps', () => {
    expect(clampDimension(10)).toBe(50)
    expect(clampDimension(99999)).toBe(4096)
    expect(clampDimension(NaN)).toBe(50)
  })
})
