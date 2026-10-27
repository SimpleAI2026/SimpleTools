import { describe, expect, it } from 'vitest'
import { pageGeometry, pagesNeeded } from './htmlPdf'

describe('htmlPdf', () => {
  it('geometry', () => {
    const g = pageGeometry({ page: 'letter', landscape: false, margin: 36, ratio: 2 })
    expect(g).toMatchObject({ W: 612, H: 792, contentW: 720, contentH: 960, marginPx: 96, pageWpx: 1632, pageHpx: 2112 })
    expect(pagesNeeded(0, 960)).toBe(1)
    expect(pagesNeeded(1921, 960)).toBe(3)
  })
})
