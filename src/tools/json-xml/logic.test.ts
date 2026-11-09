import { describe, expect, it } from 'vitest'
import { jsonToXml, xmlToJson } from './logic'

describe('json-xml', () => {
  it('xml → json with attributes', () => {
    expect(xmlToJson('<?xml version="1.0"?><a id="1"><b>x</b><b>y</b></a>', 0)).toBe('{"a":{"b":["x","y"],"@_id":1}}')
  })
  it('json → xml', () => {
    expect(jsonToXml('{"a":{"@_id":1,"b":["x","y"]}}')).toBe('<?xml version="1.0" encoding="UTF-8"?>\n<a id="1">\n  <b>x</b>\n  <b>y</b>\n</a>')
    expect(jsonToXml('[1,2]', 'list')).toContain('<list>\n  <item>1</item>')
  })
  it('invalid xml', () => expect(() => xmlToJson('<a><b></a>')).toThrow(/Line/))
})
