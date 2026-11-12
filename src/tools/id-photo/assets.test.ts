import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { dequantizeQ8 } from './logic'
import { ID_PHOTO_BUDGET_BYTES, ID_PHOTO_WASM } from './assets'

const root = join(__dirname, '../../..')
const models = join(root, 'assets/models/id-photo')
const lock = JSON.parse(readFileSync(join(models, 'models.lock.json'), 'utf8')) as { files: Record<string, { bytes: number; sha256: string }> }

describe('id-photo offline assets', () => {
  it('match the committed sha256 lock', () => {
    expect(Object.keys(lock.files).length).toBeGreaterThanOrEqual(4)
    for (const [file, meta] of Object.entries(lock.files)) {
      const bytes = readFileSync(join(models, file))
      expect(bytes.length, file).toBe(meta.bytes)
      expect(createHash('sha256').update(bytes).digest('hex'), file).toBe(meta.sha256)
    }
  })
  it('stay within the 10 MB budget together with the tfjs wasm files', () => {
    const modelBytes = Object.values(lock.files).reduce((s, f) => s + f.bytes, 0)
    const wasmBytes = ID_PHOTO_WASM.reduce((s, f) => {
      const p = join(root, 'node_modules/@tensorflow/tfjs-backend-wasm/dist', f)
      return s + (existsSync(p) ? statSync(p).size : 0)
    }, 0)
    // JS for tfjs + the tool is measured on the real bundle by the vite size guard; keep 1.5 MB for it here.
    expect(modelBytes + wasmBytes + 1_500_000).toBeLessThanOrEqual(ID_PHOTO_BUDGET_BYTES)
  })
  it('unpacks the shipped matting weights', () => {
    const dir = join(models, 'hivision-modnet-q8')
    const json = JSON.parse(readFileSync(join(dir, 'model.json'), 'utf8'))
    const bin = readFileSync(join(dir, 'weights.q8.bin'))
    const specs = json.weightsManifest[0].weights
    const out = dequantizeQ8(specs, json.simpletoolsQ8.entries, bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.length))
    const total = specs.reduce((s: number, w: { shape: number[] }) => s + w.shape.reduce((a, b) => a * b, 1), 0)
    expect(out.byteLength).toBe(total * 4)
    expect(json.modelTopology).toBeTruthy()
  })
})
