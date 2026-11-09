import { describe, expect, it } from 'vitest'
import { cleanSvg, processSvg } from './logic'

const src = '<?xml version="1.0"?><!-- x --><svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://i" inkscape:version="1" viewBox="0 0 10.123456 10"><metadata>m</metadata><inkscape:grid id="g"/><path d="M1.23456 2.5L3 4"/></svg>'
describe('svg-formatter', () => {
  it('cleans', () => {
    expect(cleanSvg(src, { removeMetadata: true, removeEditorData: true, precision: 2 })).toBe(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.12 10"><path d="M1.23 2.5L3 4"/></svg>',
    )
  })
  it('formats and minifies', () => {
    const o = { removeMetadata: false, removeEditorData: false, precision: null }
    expect(processSvg('<svg><g><rect/></g></svg>', 'format', o)).toBe('<svg>\n  <g>\n    <rect/>\n  </g>\n</svg>')
    expect(processSvg('<svg>\n <g> <rect /> </g></svg>', 'minify', o)).toBe('<svg><g><rect/></g></svg>')
  })
})
