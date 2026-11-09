import { describe, expect, it } from 'vitest'
import { composeDocument } from './logic'

describe('html-to-pdf', () => {
  it('extracts body and head styles', () => {
    const r = composeDocument('<html><head><style>p{color:red}</style></head><body><p>x</p></body></html>', 'h1{x:y}')
    expect(r.endsWith('<style>p{color:red}</style><style>h1{x:y}</style><p>x</p>')).toBe(true)
    expect(composeDocument('<b>a</b>', '').endsWith('<b>a</b>')).toBe(true)
  })
})
