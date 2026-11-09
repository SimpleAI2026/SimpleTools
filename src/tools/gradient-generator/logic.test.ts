import { describe, expect, it } from 'vitest'
import { gradientCss, insertStop, randomGradient, type GradientState } from './logic'

const g: GradientState = {
  type: 'linear',
  angle: 90,
  shape: 'circle',
  cx: 50,
  cy: 50,
  repeating: false,
  stops: [
    { color: '#FF0000', opacity: 1, pos: 100 },
    { color: '#0000ff', opacity: 0.5, pos: 0 },
  ],
}
describe('gradient-generator', () => {
  it('builds css', () => {
    expect(gradientCss(g)).toBe('background: linear-gradient(90deg, rgb(0 0 255 / 50%) 0%, #ff0000 100%);')
    expect(gradientCss({ ...g, type: 'radial', repeating: true })).toContain('repeating-radial-gradient(circle at 50% 50%,')
    expect(gradientCss({ ...g, type: 'conic' })).toContain('conic-gradient(from 90deg at 50% 50%,')
  })
  it('inserts stops in the widest gap', () => {
    expect(insertStop([{ color: '#000000', opacity: 1, pos: 0 }, { color: '#000000', opacity: 1, pos: 20 }, { color: '#111111', opacity: 1, pos: 100 }])[2]!.pos).toBe(60)
  })
  it('random', () => expect(randomGradient(() => 0)[0]!.color).toBe('#000000'))
})
