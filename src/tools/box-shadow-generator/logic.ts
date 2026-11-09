import { colorWithAlpha } from '@/lib/color'

export interface ShadowLayer {
  x: number
  y: number
  blur: number
  spread: number
  color: string
  opacity: number
  inset: boolean
}

export const defaultLayer = (): ShadowLayer => ({ x: 0, y: 8, blur: 24, spread: -4, color: '#000000', opacity: 0.25, inset: false })

const px = (n: number) => (n === 0 ? '0' : `${n}px`)

export function layerCss(l: ShadowLayer): string {
  return `${l.inset ? 'inset ' : ''}${px(l.x)} ${px(l.y)} ${px(l.blur)} ${px(l.spread)} ${colorWithAlpha(l.color, l.opacity)}`
}

export function boxShadowValue(layers: ShadowLayer[]): string {
  return layers.length ? layers.map(layerCss).join(', ') : 'none'
}

export function boxShadowCss(layers: ShadowLayer[]): string {
  return layers.length > 1 ? `box-shadow:\n  ${layers.map(layerCss).join(',\n  ')};` : `box-shadow: ${boxShadowValue(layers)};`
}

export const SHADOW_PRESETS: Record<string, ShadowLayer[]> = {
  soft: [{ x: 0, y: 8, blur: 24, spread: -4, color: '#000000', opacity: 0.25, inset: false }],
  layered: [
    { x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.08, inset: false },
    { x: 0, y: 4, blur: 8, spread: 0, color: '#000000', opacity: 0.08, inset: false },
    { x: 0, y: 16, blur: 32, spread: 0, color: '#000000', opacity: 0.12, inset: false },
  ],
  hard: [{ x: 6, y: 6, blur: 0, spread: 0, color: '#111827', opacity: 1, inset: false }],
  inner: [{ x: 0, y: 2, blur: 6, spread: 0, color: '#000000', opacity: 0.3, inset: true }],
  glow: [{ x: 0, y: 0, blur: 24, spread: 4, color: '#6366f1', opacity: 0.6, inset: false }],
}
