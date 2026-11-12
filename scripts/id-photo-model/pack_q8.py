#!/usr/bin/env python3
"""Pack a float32 TensorFlow.js graph model into SimpleTools' per-channel uint8 format.

tfjs' built-in --quantize_uint8 uses one scale per tensor, which visibly damages
hivision_modnet mattes (holes in clothing / failures on dark photos). Here every
large float tensor (>= 4096 values, rank >= 2) is quantized per output channel
(last axis; axis 2 for depthwise HWC1 kernels). Small tensors and int32 tensors
are stored raw. src/tools/id-photo/logic.ts `dequantizeQ8` restores float32
weights in the browser before tf.loadGraphModel.

Binary layout, entry by entry in weightsManifest order, each padded to 4 bytes:
  raw: n * 4 bytes (float32 / int32, little endian)
  q8 : lo float32[C], scale float32[C], uint8[n]
Usage: pack_q8.py <tfjs_f32_dir> <out_dir>
"""
import json, os, sys
import numpy as np

src, out = sys.argv[1], sys.argv[2]
m = json.load(open(os.path.join(src, 'model.json')))
groups = m['weightsManifest']
specs = [s for g in groups for s in g['weights']]
buf = b''.join(open(os.path.join(src, p), 'rb').read() for g in groups for p in g['paths'])
off = 0
parts, entries = [], []
for s in specs:
    shape = s['shape']
    n = int(np.prod(shape)) if shape else 1
    if s['dtype'] not in ('float32', 'int32'):
        raise SystemExit(f"unsupported dtype {s['dtype']} for {s['name']}")
    raw = buf[off:off + 4 * n]
    off += 4 * n
    if s['dtype'] == 'float32' and n >= 4096 and len(shape) >= 2:
        a = np.frombuffer(raw, np.float32).reshape(shape)
        axis = 2 if (len(shape) == 4 and shape[3] == 1) else len(shape) - 1
        mv = np.moveaxis(a, axis, -1)
        red = tuple(range(mv.ndim - 1))
        lo = mv.min(axis=red)
        scale = np.maximum(mv.max(axis=red) - lo, 1e-12) / 255.0
        q = np.clip(np.round((mv - lo) / scale), 0, 255).astype(np.uint8)
        q = np.ascontiguousarray(np.moveaxis(q, -1, axis))
        chunk = lo.astype('<f4').tobytes() + scale.astype('<f4').tobytes() + q.tobytes()
        entries.append({'kind': 'q8', 'axis': axis, 'channels': int(shape[axis])})
    else:
        chunk = raw
        entries.append({'kind': 'raw'})
    chunk += b'\0' * ((4 - len(chunk) % 4) % 4)
    parts.append(chunk)
assert off == len(buf), (off, len(buf))
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'weights.q8.bin'), 'wb').write(b''.join(parts))
m['weightsManifest'] = [{'paths': ['weights.q8.bin'], 'weights': specs}]
m['simpletoolsQ8'] = {'version': 1, 'entries': entries}
json.dump(m, open(os.path.join(out, 'model.json'), 'w'), separators=(',', ':'))
print('packed', len(specs), 'tensors,', sum(e['kind'] == 'q8' for e in entries), 'quantized')
