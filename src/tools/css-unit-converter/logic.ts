export const CSS_UNITS = ['px', 'rem', 'em', 'pt', 'pc', 'in', 'cm', 'mm', 'Q', 'vw', 'vh', 'vmin', 'vmax', '%'] as const
export type CssUnit = (typeof CSS_UNITS)[number]

export interface CssContext {
  rootFontSize: number
  parentFontSize: number
  viewportWidth: number
  viewportHeight: number
  /** reference length for % (e.g. the parent's width) */
  percentBase: number
}

export const DEFAULT_CONTEXT: CssContext = { rootFontSize: 16, parentFontSize: 16, viewportWidth: 1440, viewportHeight: 900, percentBase: 1200 }

/** Size of one unit in CSS px. */
export function unitInPx(u: CssUnit, c: CssContext): number {
  switch (u) {
    case 'px':
      return 1
    case 'rem':
      return c.rootFontSize
    case 'em':
      return c.parentFontSize
    case 'pt':
      return 96 / 72
    case 'pc':
      return 16
    case 'in':
      return 96
    case 'cm':
      return 96 / 2.54
    case 'mm':
      return 96 / 25.4
    case 'Q':
      return 96 / 101.6
    case 'vw':
      return c.viewportWidth / 100
    case 'vh':
      return c.viewportHeight / 100
    case 'vmin':
      return Math.min(c.viewportWidth, c.viewportHeight) / 100
    case 'vmax':
      return Math.max(c.viewportWidth, c.viewportHeight) / 100
    case '%':
      return c.percentBase / 100
  }
}

export function convertCssUnit(value: number, from: CssUnit, to: CssUnit, c: CssContext): number {
  return (value * unitInPx(from, c)) / unitInPx(to, c)
}

export const fmt = (n: number) => String(Math.round(n * 10000) / 10000)
