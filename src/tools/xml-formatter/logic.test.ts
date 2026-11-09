import { describe, expect, it } from 'vitest'
import { formatXml, minifyXml, validateXml } from './logic'

describe('xml-formatter', () => {
  const src = '<?xml version="1.0"?><root a="1"><!-- c --><item>One</item><empty/><list><x></x></list><![CDATA[<raw>]]></root>'
  it('formats', () => {
    expect(formatXml(src)).toBe(
      '<?xml version="1.0"?>\n<root a="1">\n  <!-- c -->\n  <item>One</item>\n  <empty/>\n  <list>\n    <x></x>\n  </list>\n  <![CDATA[<raw>]]>\n</root>',
    )
    expect(formatXml(src, { indent: '\t', removeComments: true })).not.toContain('<!--')
  })
  it('minifies', () => {
    expect(minifyXml('<a>\n  <b  x="1" />\n  <!--c-->\n</a>')).toBe('<a><b x="1"/></a>')
  })
  it('validates', () => {
    expect(validateXml('<a><b></a>')).toMatch(/Mismatched/)
    expect(validateXml('<a>')).toMatch(/Unclosed/)
    expect(validateXml('<a/>')).toBeNull()
  })
})
