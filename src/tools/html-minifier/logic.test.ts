import { describe, expect, it } from 'vitest'
import { defaultHtmlMinify, minifyHtml } from './logic'

describe('html-minifier', () => {
  it('collapses whitespace and comments, keeps pre', () => {
    const src = '<div>\n  <!-- note -->\n  <p class="a">Hello   world</p>\n  <pre>  keep\n  me </pre>\n</div>'
    expect(minifyHtml(src)).toBe('<div> <p class="a">Hello world</p> <pre>  keep\n  me </pre> </div>')
    expect(minifyHtml(src, { ...defaultHtmlMinify, aggressive: true })).toBe('<div><p class="a">Hello world</p><pre>  keep\n  me </pre></div>')
  })
  it('keeps conditional comments and minifies style', () => {
    expect(minifyHtml('<!--[if IE]>x<![endif]--><style> a { color : red ; } </style>')).toBe('<!--[if IE]>x<![endif]--><style>a{color:red}</style>')
  })
  it('respects options', () => {
    expect(minifyHtml('<b> a </b><!--c-->', { removeComments: false, collapseWhitespace: false, aggressive: false, minifyCss: false })).toBe('<b> a </b><!--c-->')
  })
})
