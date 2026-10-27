export interface Tile {
  row: number
  col: number
  x: number
  y: number
  w: number
  h: number
}

/** Split w×h into rows×cols tiles; remainder pixels are distributed so tiles cover the image exactly. */
export function gridTiles(w: number, h: number, rows: number, cols: number): Tile[] {
  const r = Math.max(1, Math.min(Math.floor(rows), h))
  const c = Math.max(1, Math.min(Math.floor(cols), w))
  const edges = (total: number, n: number) => Array.from({ length: n + 1 }, (_, i) => Math.round((total * i) / n))
  const xs = edges(w, c)
  const ys = edges(h, r)
  const tiles: Tile[] = []
  for (let row = 0; row < r; row++)
    for (let col = 0; col < c; col++) tiles.push({ row, col, x: xs[col]!, y: ys[row]!, w: xs[col + 1]! - xs[col]!, h: ys[row + 1]! - ys[row]! })
  return tiles
}

/** Fixed-size tiles (last row/column may be smaller). */
export function sizeTiles(w: number, h: number, tw: number, th: number): Tile[] {
  const tiles: Tile[] = []
  const sw = Math.max(1, Math.floor(tw))
  const sh = Math.max(1, Math.floor(th))
  for (let y = 0, row = 0; y < h; y += sh, row++)
    for (let x = 0, col = 0; x < w; x += sw, col++) tiles.push({ row, col, x, y, w: Math.min(sw, w - x), h: Math.min(sh, h - y) })
  return tiles
}

export function tileName(base: string, t: Tile, ext: string): string {
  return `${base}_r${t.row + 1}_c${t.col + 1}.${ext}`
}
