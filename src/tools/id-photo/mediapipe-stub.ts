/**
 * Build-time stand-in for `@mediapipe/face_detection`. SimpleTools only uses the
 * TF.js runtime of @tensorflow-models/face-detection, so the MediaPipe solution
 * (and its ~14 MB of WASM) is never bundled. Aliased in vite.config.ts.
 */
export class FaceDetection {
  constructor() {
    throw new Error('MediaPipe runtime is not bundled; use runtime: "tfjs"')
  }
}
export default { FaceDetection }
