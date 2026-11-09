import { describe, expect, it } from 'vitest'
import { decodeEntities, encodeEntities } from './logic'

describe('html-entities', () => {
  it('encodes', () => {
    expect(encodeEntities('<a href="x">Tom & Jerry\'s</a>')).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;')
    expect(encodeEntities('© 中', 'named')).toBe('&copy; &#20013;')
    expect(encodeEntities('<é', 'numeric')).toBe('&#60;&#233;')
  })
  it('decodes', () => {
    expect(decodeEntities('&lt;p&gt; &amp;amp; &#x4E2D;&#25991; &copy; &unknown; &#0;')).toBe('<p> &amp; 中文 © &unknown; &#0;')
  })
  it('round-trips', () => {
    for (const m of ['minimal', 'named', 'numeric'] as const) expect(decodeEntities(encodeEntities('<"x"> & ©中😀', m))).toBe('<"x"> & ©中😀')
  })
})
