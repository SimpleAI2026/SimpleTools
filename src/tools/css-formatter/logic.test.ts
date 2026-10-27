import { describe, expect, it } from 'vitest'
import { formatCss, minifyCss } from './logic'

describe('css-formatter', () => {
  it('minifies', () => {
    expect(minifyCss('/* c */\na  >  b {\n  color : red ;\n  content: "a  ;  b";\n}\n')).toBe('a>b{color:red;content:"a  ;  b"}')
  })
  it('formats with prettier', async () => {
    expect(await formatCss('a{color:red;margin:0}', 'css', 2)).toBe('a {\n  color: red;\n  margin: 0;\n}\n')
    expect(await formatCss('.a{.b{c:d}}', 'scss', 4)).toContain('    .b {')
  })
  it('reports syntax errors', async () => {
    await expect(formatCss('a{color:red', 'css', 2)).rejects.toThrow()
  })
})
