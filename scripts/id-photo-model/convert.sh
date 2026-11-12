#!/usr/bin/env bash
# Reproduce assets/models/id-photo/ from the upstream Apache-2.0 sources.
# Not part of the normal build. Needs Python 3.11+ and ~2 GB of disk for TensorFlow.
# Tested with: tensorflow 2.20.0, onnx2tf (2026-11), tensorflowjs 4.22.0 (--no-deps), Python 3.13.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="${WORK:-$(mktemp -d)}"
OUT="$ROOT/assets/models/id-photo"
cd "$WORK"

python3 -m venv venv
. venv/bin/activate
pip install -q "tensorflow==2.20.0" tf_keras onnx onnxruntime onnx2tf onnx_graphsurgeon sng4onnx psutil ai_edge_litert numpy
pip install -q --no-deps tensorflowjs==4.22.0
pip install -q tensorflow_hub packaging six jax flax
# tensorflowjs 4.22 imports tensorflow_decision_forests unconditionally; an empty stub is enough.
mkdir -p stub/tensorflow_decision_forests && touch stub/tensorflow_decision_forests/__init__.py

# 1) Matting: hivision_modnet (HivisionIDPhotos, Apache-2.0; MODNet architecture, Apache-2.0)
curl -fL -o hivision_modnet.onnx https://github.com/Zeyi-Lin/HivisionIDPhotos/releases/download/pretrained-model/hivision_modnet.onnx
onnx2tf -i hivision_modnet.onnx -o hiv_tf -ois input1:1,3,512,512 -tb tf_converter -osd -n
PYTHONPATH=stub tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model hiv_tf hiv_f32
python "$ROOT/scripts/id-photo-model/pack_q8.py" hiv_f32 "$OUT/hivision-modnet-q8"

# 2) Face detection: MediaPipe BlazeFace short-range, TF.js graph model (Apache-2.0)
mkdir -p "$OUT/blazeface-short"
curl -fL -o "$OUT/blazeface-short/model.json" "https://tfhub.dev/mediapipe/tfjs-model/face_detection/short/1/model.json?tfjs-format=file"
curl -fL -o "$OUT/blazeface-short/group1-shard1of1.bin" "https://tfhub.dev/mediapipe/tfjs-model/face_detection/short/1/group1-shard1of1.bin?tfjs-format=file"

# 3) Refresh the lock (sha256 + bytes)
node "$ROOT/scripts/id-photo-model/lock.mjs" --write
echo "Done. Review: git diff -- assets/models/id-photo"
