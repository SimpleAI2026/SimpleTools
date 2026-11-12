# id-photo models

| Directory | Model | License | Source |
|---|---|---|---|
| `hivision-modnet-q8/` | hivision_modnet (MODNet architecture), per-channel uint8 TF.js graph model, 512×512 input | Apache-2.0 | [HivisionIDPhotos](https://github.com/Zeyi-Lin/HivisionIDPhotos), [MODNet](https://github.com/ZHKKKe/MODNet) |
| `blazeface-short/` | MediaPipe BlazeFace short-range face detector, TF.js graph model | Apache-2.0 | [tfhub / Kaggle](https://tfhub.dev/mediapipe/tfjs-model/face_detection/short/1) |

- The build copies this folder to `public/offline/idphoto/models/`; the app only fetches same-origin URLs.
- `models.lock.json` pins bytes and sha256. `node scripts/id-photo-model/lock.mjs` verifies, `--write` refreshes.
- `scripts/id-photo-model/convert.sh` reproduces the files from upstream; it is not part of the normal build.
- Why per-channel uint8: tfjs `--quantize_uint8` (one scale per tensor) changed hivision_modnet mattes noticeably (IoU 0.94 on one test image, total failure on another). Per-channel packing kept IoU ≥ 0.994 against the float32 ONNX model on the same images.
- The sample portrait `public/samples/portrait.jpg` is the 2009 official portrait of Barack Obama by Pete Souza, a work of the U.S. federal government (public domain).
