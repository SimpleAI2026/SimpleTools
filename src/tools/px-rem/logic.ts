export function pxToRem(px: number, base = 16): number {
  return round(px / base)
}
export function remToPx(rem: number, base = 16): number {
  return round(rem * base)
}
export function round(n: number, digits = 4): number {
  return Number(n.toFixed(digits))
}

/** Convert all `NNpx` in a CSS snippet to rem (skips 0/1px borders when `keepSmall`). */
export function convertCss(css: string, base = 16, keepSmall = true): string {
  return css.replace(/(-?\d*\.?\d+)px\b/g, (m, n: string) => {
    const v = Number(n)
    if (keepSmall && Math.abs(v) <= 1) return m
    return `${pxToRem(v, base)}rem`
  })
}

export const COMMON_PX = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96]
