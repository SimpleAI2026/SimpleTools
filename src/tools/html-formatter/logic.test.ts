import { describe, expect, it } from 'vitest'
import { formatHtml } from './logic'

describe('html-formatter', () => {
  it('formats nested html with embedded css', async () => {
    const out = await formatHtml('<div><p>Hi</p><style>a{color:red}</style></div>', 2, 80)
    expect(out).toContain('<div>\n  <p>Hi</p>')
    expect(out).toContain('color: red;')
  })
})
