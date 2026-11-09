export type Category = 'length' | 'mass' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data' | 'pressure' | 'energy' | 'angle'

/** Factor of each unit relative to the category's base unit (temperature handled separately). */
export const UNITS: Record<Exclude<Category, 'temperature'>, Record<string, number>> = {
  length: { nm: 1e-9, μm: 1e-6, mm: 1e-3, cm: 1e-2, m: 1, km: 1e3, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344, nmi: 1852, 里: 500, 丈: 10 / 3, 尺: 1 / 3, 寸: 1 / 30 },
  mass: { mg: 1e-6, g: 1e-3, kg: 1, t: 1e3, oz: 0.028349523125, lb: 0.45359237, st: 6.35029318, 斤: 0.5, 两: 0.05 },
  area: { 'mm²': 1e-6, 'cm²': 1e-4, 'm²': 1, ha: 1e4, 'km²': 1e6, 'in²': 0.00064516, 'ft²': 0.09290304, 'yd²': 0.83612736, acre: 4046.8564224, 'mi²': 2589988.110336, 亩: 10000 / 15 },
  volume: { mL: 1e-3, L: 1, 'm³': 1e3, 'cm³': 1e-3, tsp: 0.00492892159375, tbsp: 0.01478676478125, 'fl oz': 0.0295735295625, cup: 0.2365882365, pt: 0.473176473, qt: 0.946352946, gal: 3.785411784, 'imp gal': 4.54609 },
  speed: { 'm/s': 1, 'km/h': 1 / 3.6, mph: 0.44704, kn: 1852 / 3600, 'ft/s': 0.3048, mach: 340.29 },
  time: { ns: 1e-9, μs: 1e-6, ms: 1e-3, s: 1, min: 60, h: 3600, d: 86400, wk: 604800, mo: 2629746, yr: 31556952 },
  data: { bit: 1 / 8, B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4 },
  pressure: { Pa: 1, kPa: 1e3, MPa: 1e6, bar: 1e5, atm: 101325, psi: 6894.757293168, mmHg: 133.322387415, inHg: 3386.389 },
  energy: { J: 1, kJ: 1e3, cal: 4.184, kcal: 4184, Wh: 3600, kWh: 3.6e6, eV: 1.602176634e-19, BTU: 1055.05585262 },
  angle: { deg: 1, rad: 180 / Math.PI, grad: 0.9, arcmin: 1 / 60, arcsec: 1 / 3600, turn: 360 },
}
export const TEMPERATURE_UNITS = ['°C', '°F', 'K', '°R'] as const
export const CATEGORIES = ['length', 'mass', 'temperature', 'area', 'volume', 'speed', 'time', 'data', 'pressure', 'energy', 'angle'] as const

export function unitsOf(c: Category): string[] {
  return c === 'temperature' ? [...TEMPERATURE_UNITS] : Object.keys(UNITS[c])
}

function toKelvin(v: number, u: string): number {
  switch (u) {
    case '°C':
      return v + 273.15
    case '°F':
      return ((v - 32) * 5) / 9 + 273.15
    case '°R':
      return (v * 5) / 9
    default:
      return v
  }
}
function fromKelvin(k: number, u: string): number {
  switch (u) {
    case '°C':
      return k - 273.15
    case '°F':
      return ((k - 273.15) * 9) / 5 + 32
    case '°R':
      return (k * 9) / 5
    default:
      return k
  }
}

export function convertUnit(v: number, from: string, to: string, c: Category): number {
  if (c === 'temperature') return fromKelvin(toKelvin(v, from), to)
  const t = UNITS[c]
  if (!(from in t) || !(to in t)) throw new Error(`Unknown unit ${from} / ${to}`)
  return (v * t[from]!) / t[to]!
}

/** Up to 10 significant digits without float noise; exponent notation for extremes. */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n !== 0 && (Math.abs(n) >= 1e15 || Math.abs(n) < 1e-6)) return n.toExponential(6).replace(/\.?0+e/, 'e')
  return String(Number(n.toPrecision(10)))
}
