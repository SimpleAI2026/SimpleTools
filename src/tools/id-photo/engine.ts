/**
 * TensorFlow.js runtime for the ID photo tool. Loaded lazily with the tool chunk.
 * WebGL first, WASM (SIMD / plain, single-thread) as fallback. Every model and
 * .wasm file comes from the same origin under offline/idphoto/.
 */
import * as tf from '@tensorflow/tfjs-core'
import { loadGraphModel, type GraphModel } from '@tensorflow/tfjs-converter'
import '@tensorflow/tfjs-backend-webgl'
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'
import { createDetector, SupportedModels, type FaceDetector } from '@tensorflow-models/face-detection'
import { offlineUrl } from '@/lib/offlineAssets'
import { dequantizeQ8, type Q8Entry, type WeightSpec } from './logic'

export const MATTE_SIZE = 512

let ready: Promise<string> | null = null
let detector: FaceDetector | null = null
let matter: GraphModel | null = null

/** Software WebGL (SwiftShader / llvmpipe) is several times slower than the WASM backend. */
function hasHardwareWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2') ?? document.createElement('canvas').getContext('webgl')
    if (!gl) return false
    const info = gl.getExtension('WEBGL_debug_renderer_info')
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return !/swiftshader|llvmpipe|softpipe|software/i.test(renderer)
  } catch {
    return false
  }
}

/** Initialise a backend once; resolves to its name ('webgl' | 'wasm'). */
export function initBackend(): Promise<string> {
  ready ??= (async () => {
    tf.env().set('WASM_HAS_MULTITHREAD_SUPPORT', false)
    setWasmPaths(`${offlineUrl('idphoto', 'tfjs')}/`)
    for (const name of hasHardwareWebGL() ? ['webgl', 'wasm'] : ['wasm', 'webgl']) {
      try {
        if (await tf.setBackend(name)) {
          await tf.ready()
          return name
        }
      } catch {
        // try the next backend
      }
    }
    throw new Error('No TensorFlow.js backend available')
  })()
  return ready
}

export async function getDetector(): Promise<FaceDetector> {
  await initBackend()
  detector ??= await createDetector(SupportedModels.MediaPipeFaceDetector, {
    runtime: 'tfjs',
    modelType: 'short',
    maxFaces: 1,
    detectorModelUrl: offlineUrl('idphoto', 'models', 'blazeface-short', 'model.json'),
  })
  return detector
}

export async function getMatter(): Promise<GraphModel> {
  await initBackend()
  if (!matter) {
    const base = offlineUrl('idphoto', 'models', 'hivision-modnet-q8')
    const [json, bin] = await Promise.all([
      fetch(`${base}/model.json`).then((r) => {
        if (!r.ok) throw new Error(`model.json ${r.status}`)
        return r.json() as Promise<{ modelTopology: object; weightsManifest: { weights: WeightSpec[] }[]; simpletoolsQ8: { entries: Q8Entry[] } }>
      }),
      fetch(`${base}/weights.q8.bin`).then((r) => {
        if (!r.ok) throw new Error(`weights ${r.status}`)
        return r.arrayBuffer()
      }),
    ])
    const weightSpecs = json.weightsManifest.flatMap((g) => g.weights)
    const weightData = dequantizeQ8(weightSpecs, json.simpletoolsQ8.entries, bin)
    matter = await loadGraphModel(tf.io.fromMemory({ modelTopology: json.modelTopology, weightSpecs: weightSpecs as tf.io.WeightsManifestEntry[], weightData }))
  }
  return matter
}

export interface FaceResult {
  box: { xMin: number; yMin: number; width: number; height: number }
  /** Eyes sorted by x: [image-left, image-right]. */
  eyes: [{ x: number; y: number }, { x: number; y: number }]
}

export async function detectFace(src: HTMLCanvasElement): Promise<FaceResult | null> {
  const d = await getDetector()
  const faces = await d.estimateFaces(src, { flipHorizontal: false })
  const f = faces[0]
  if (!f) return null
  const eyes = f.keypoints.filter((k) => k.name === 'rightEye' || k.name === 'leftEye').sort((a, b) => a.x - b.x)
  if (eyes.length < 2) return null
  return {
    box: { xMin: f.box.xMin, yMin: f.box.yMin, width: f.box.width, height: f.box.height },
    eyes: [{ x: eyes[0]!.x, y: eyes[0]!.y }, { x: eyes[1]!.x, y: eyes[1]!.y }],
  }
}

/** Run the matting model; returns a MATTE_SIZE² alpha map in 0..1. */
export async function matte(src: HTMLCanvasElement): Promise<Float32Array> {
  const model = await getMatter()
  const c = document.createElement('canvas')
  c.width = MATTE_SIZE
  c.height = MATTE_SIZE
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, 0, 0, MATTE_SIZE, MATTE_SIZE)
  const out = tf.tidy(() => {
    // Functional ops only: tfjs-core does not register chained tensor methods by default.
    const x = tf.expandDims(tf.sub(tf.div(tf.cast(tf.browser.fromPixels(c), 'float32'), 127.5), 1), 0)
    const y = model.predict(x) as tf.Tensor
    return tf.reshape(y, [MATTE_SIZE * MATTE_SIZE])
  })
  const data = (await out.data()) as Float32Array
  out.dispose()
  return data
}

export function backendName(): string {
  return tf.getBackend() ?? ''
}

/** Free model memory (the backend itself stays registered). */
export function disposeModels(): void {
  detector?.dispose()
  detector = null
  matter?.dispose()
  matter = null
}
