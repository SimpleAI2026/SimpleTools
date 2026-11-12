# 证件照工具（浏览器本地版）计划

> 日期：2026-11-12 · 仅计划，未改应用代码
> 参考：`thirdparty/LiYing`（AGPL-3.0，只看流程，不拷代码、不用其模型）；HivisionIDPhotos（Apache-2.0，算法思路参考）
> 目标：用 GitHub / npm 上已有的 JS、WASM 实现，在浏览器本地完成 LiYing 的主要功能，**Web 和 Chrome 扩展新增体积 ≤ 10 MB**
> 结论：用 **TensorFlow.js 作为唯一推理运行时**，人脸用 MediaPipe BlazeFace short-range（tfjs 版），抠图用 **MODNet 转 tfjs 并做 uint8 量化**。实测新增约 **9.2 MB**（未压缩）；装进 Chrome 扩展 zip 后约 5.9 MB（gzip）。onnxruntime-web 和 MediaPipe Tasks 的 WASM 单个就有 14.7 到 14.9 MB，超出预算。

## 约束（沿用现有规则）

- 全部在浏览器本地运行：不走后端、云 API、CDN。模型和 WASM 都放在 `public/offline/idphoto/`，同源加载。
- 目录 `src/tools/id-photo/{index.vue,logic.ts,logic.test.ts,messages.ts}`，在 `src/registry/tools/media.ts` 注册，分类为 `media`。
- 支持 8 种界面语言（zh-CN、en、ja、ko、de、fr、es、pt-BR），在 390px 宽的手机上可用。复制和下载按钮放在输出区标题行右侧。
- 许可只用 MIT、BSD 或 Apache-2.0 这类宽松许可。不用 GPL 或 AGPL 的代码和模型，也不用非商用模型。
- Chrome 扩展的 CSP 已经包含 `'wasm-unsafe-eval'`（`chrome-extension/manifest.json`），可以直接使用 tfjs-backend-wasm。

## 一、LiYing 功能对照

| # | LiYing 步骤（原实现） | 本方案 | 新增体积 |
|---|---|---|---|
| 1 | 转正：YOLOv8-pose 肩膀关键点（AGPL） | 用 BlazeFace 给出的两眼关键点算倾斜角，再用 Canvas 旋转。实测：把测试图转 8° 后，检出 −7.59° | 与第 2 步共用 |
| 2 | 人脸检测 YuNet/RetinaFace，再按规格裁剪（脸高 30%、头顶留白 17.5%） | 用 BlazeFace short-range 得到人脸框。头顶位置取抠图 alpha 在头部列上的最高点（Hivision 也是这个思路）。按规格参数裁剪，用户可以手动微调 | 0.28 MB 模型 |
| 3 | RMBG 抠图后换纯色底（非商用模型） | MODNet（Apache-2.0）转成 tfjs uint8，输入 512×512，用 alpha 合成纯色或渐变底。也支持直接上传已经抠好的透明 PNG | 6.73 MB |
| 4 | 美肤（两个模型，约 156 MB） | 不用模型。只做可选的 Canvas 磨皮和亮度滑块，可以放到第三期 | 约 0 |
| 5 | 按 KB 范围压缩，写入 DPI | 先用 `canvas.convertToBlob` 对 quality 二分查找；需要更精确时用 @jsquash/jpeg（mozjpeg）。DPI 用纯 TS 写：JPEG 改 JFIF APP0 的 density 字段，PNG 写 pHYs 块（可参考 changedpi，MIT） | 0 到 0.25 MB |
| 6 | 排版到 5 寸或 6 寸相纸，加裁剪线 | 纯 Canvas：5 寸为 89×127 mm，6 寸为 102×152 mm，300 DPI，自动算行列，画裁剪线，导出 JPG/PNG。PDF 复用 image-to-pdf 的做法 | 约 0 |
| 7 | 规格 34 种（`size_zh.csv`），底色 10 种（`color_zh.csv`） | 规格表自己在 TS 里写，数据依据 GB/T、ICAO、各国签证官方要求和 Hivision 的规格表（Apache-2.0，注明出处）。不拷贝 LiYing 的 CSV。同时支持自定义规格 | 约 0.02 MB |

## 二、选定技术栈（实测数据）

测试方法：在 box 上执行 `npm pack` 下载 tarball 后量文件；模型从 Hugging Face 和 Kaggle 下载后实际转换并推理。

| 组件 | 包 / 来源 | 许可 | 文件 | 原始字节 | gzip |
|---|---|---|---|---|---|
| 运行时核心 | @tensorflow/tfjs-core 4.22.0 | Apache-2.0 | tf-core.es2017.min.js | 255,317 | 75,728 |
| 模型加载 | @tensorflow/tfjs-converter 4.22.0 | Apache-2.0 | tf-converter.es2017.min.js | 286,781 | 69,166 |
| GPU 后端（首选） | @tensorflow/tfjs-backend-webgl 4.22.0 | Apache-2.0 | tf-backend-webgl.es2017.min.js | 370,446 | 82,883 |
| CPU 后端（兜底） | @tensorflow/tfjs-backend-wasm 4.22.0 | Apache-2.0 | tf-backend-wasm.es2017.min.js | 144,402 | 33,276 |
| | | | tfjs-backend-wasm-simd.wasm | 424,594 | 136,659 |
| | | | tfjs-backend-wasm.wasm（不支持 SIMD 时用） | 311,123 | 117,159 |
| 人脸检测封装 | @tensorflow-models/face-detection 1.0.3 | Apache-2.0 | face-detection.min.js | 约 20 KB | — |
| 人脸模型 | MediaPipe BlazeFace short-range（tfjs，来自 tfhub/Kaggle） | Apache-2.0 | model.json + group1-shard1of1.bin | 75,722 + 201,268 | 4,236 + 189,361 |
| 抠图模型 | MODNet（ZHKKKe/MODNet，Apache-2.0）。源文件为 Xenova/modnet 的 `onnx/model.onnx`（25,888,640 B），用 onnx2tf 转 SavedModel，再用 tensorflowjs_converter `--quantize_uint8` | Apache-2.0 | model.json + 2 个 shard | 265,961 + 4,194,304 + 2,267,889 = **6,728,154** | 15,674 + 3,418,504 + 1,736,072 |
| 精确压缩（可选） | @jsquash/jpeg 1.6.0 | Apache-2.0 | mozjpeg_enc.wasm | 251,524 | 59,088 |
| 工具代码、规格表和 8 语言文案 | 自写 | — | — | 约 100,000（估） | — |

### MODNet tfjs 转换实测

- 转换命令（Python 3.13，tensorflow 2.20，onnx2tf，tensorflowjs 4.22）：
  `onnx2tf -i modnet.onnx -o modnet_tf -ois input:1,3,512,512 -tb tf_converter -osd`
  然后执行 `tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model --quantize_uint8 '*' modnet_tf modnet_tfjs`
  - tensorflowjs 4.22 会 import `tensorflow_decision_forests`，转换时需要放一个空的 stub 模块。
  - 输出的输入张量是 NHWC `[1,512,512,3]`，预处理为 `(x/255-0.5)/0.5`；输出是 `[1,512,512,1]` 的 alpha。
- 精度：拿 tfjs uint8 版和 onnxruntime 跑的 fp32 原模型比较，用同一张 960×1307 的人像。alpha 的平均绝对误差为 **0.0024**，按 0.5 阈值算 IoU 为 **0.998**。目测换蓝底后两者没有区别（对比图在 box 的 `/workspace/id-photo-research/modnet_compare.jpg`）。
- 速度：在 box 上用 Node 跑 tfjs-backend-wasm（单线程，没用 GPU），一张 512×512 约 **1.46 s**（首次 1.64 s）。浏览器里用 WebGL 应该更快，还没实测。
- HivisionIDPhotos 的 `hivision_modnet.onnx`（针对证件照纯色换底微调过，Apache-2.0 仓库的 release 文件，25,888,609 B）结构相同，同样转换后也是 **6,728,169 B**。已经转换成功，还没有比较精度。第一期先拿它和原版 MODNet 做 A/B 测试，二选一，不同时打包。

### BlazeFace 实测

- `@tensorflow-models/face-detection` 加 short-range 模型，在 Node 的 CPU 后端上，一张 960×1307 的图约 190 ms。能输出人脸框和 6 个关键点（两眼、鼻尖、嘴、两耳）。
- short-range 适用于 2 m 以内的近景人脸，正好符合证件照场景。

## 三、体积预算

| 项 | 原始 MB | gzip MB |
|---|---|---|
| tfjs core + converter + webgl + wasm（JS） | 1.057 | 0.261 |
| tfjs wasm 二进制（SIMD 和非 SIMD 各一份） | 0.736 | 0.254 |
| face-detection JS + BlazeFace 模型 | 0.297 | 0.20 |
| MODNet uint8 | 6.728 | 5.170 |
| mozjpeg 编码器（可选） | 0.252 | 0.059 |
| 工具代码、规格和文案（估） | 0.10 | 0.03 |
| **合计** | **≈ 9.17** | **≈ 5.97** |
| 不带 mozjpeg、只带 SIMD 版 wasm 的精简方案 | ≈ 8.61 | ≈ 5.80 |

- 预算控制在 10 MB 以内，余量约 0.8 到 1.4 MB。tfjs 的 JS 按整个 min bundle 计算，Vite 做 tree-shaking 后只会更小。
- 在 CI 或 `build.sh` 里加一个检查：`public/offline/idphoto/` 加上 id-photo chunk 的总大小超过 10,000,000 B 就报错。
- 参考：目前 Chrome 扩展的 `chrome-extension/dist` 为 128 MB，`simpletools-chrome.zip` 为 47 MB。本方案会让 zip 增加约 6 MB。

## 四、模型文件放在哪里

- `public/offline/` 已经写进 `.gitignore`，构建开始时从 node_modules 复制（见 `vite.config.ts`）。tfjs 的 wasm 照这个办法，从 `node_modules/@tensorflow/tfjs-backend-wasm/dist/` 复制到 `public/offline/idphoto/tfjs/`，代码里调用 `setWasmPaths('./offline/idphoto/tfjs/')`。
- MODNet 的 tfjs 版和 BlazeFace 模型不在 npm 上。计划提交到仓库 `assets/models/id-photo/`（约 7 MB），同时提交 `models.lock.json`，记录 sha256、字节数、来源 URL 和许可。构建开始时复制到 `public/offline/idphoto/models/`。
- 新增 `scripts/id-photo-model/convert.sh`，记录上面的转换步骤，固定 tensorflow 和 onnx2tf 的版本。普通构建不运行它。
- 运行时只请求同源相对路径，不出现 tfhub、Kaggle、jsDelivr 等域名。在测试里断言这一点。

## 五、排除的方案

| 方案 | 原因（实测或已查证） |
|---|---|
| onnxruntime-web 1.31.1 官方包 | `ort-wasm-simd-threaded.wasm` 为 14,848,852 B，jsep 版为 29.5 MB。单个运行时就超过 10 MB |
| onnxruntime-web 自定义精简构建（minimal build 加 `--include_ops_by_config`） | 公开数据是 1.5 到 2 MB（scanic-ml 1.5 MB；microsoft/onnxruntime#14817 约 2 MB）。加上 MODNet `model_quantized.onnx` 6,632,188 B 和 YuNet 232,589 B（MIT），总量约 9 MB，可行。但要用 emscripten 从源码编译 ORT，wasm 和 JS 的 ABI 要和版本锁定，维护成本高。**作为备选方案 B**，在 tfjs 在移动端表现差时启用 |
| MediaPipe Tasks Vision 1.2.3 | `vision_wasm_internal.wasm` 为 14,665,716 B，超预算 |
| @mediapipe/selfie_segmentation（旧版） | wasm 5.69 MB 加 0.25 MB 模型，输入只有 256×256，头发边缘粗糙 |
| @tensorflow/tfjs-tflite | 每个 wasm 3.6 到 3.7 MB，MODNet 的 tflite 版（litert-community）有 26 MB |
| @imgly/background-removal 1.7.0 | npm 包里的 LICENSE.md 是 **AGPL-3.0**，模型也大 |
| RMBG-1.4 / 2.0、BiRefNet-lite | 非商用许可，或体积在 176 MB 到 1 GB |
| Robust Video Matting（RVM，vladmandic/human 里有 tfjs 版 4.35 MB） | **GPL-3.0**（PeterL1n/RobustVideoMatting） |
| YOLOv8/v11-pose | AGPL-3.0（Ultralytics） |
| MoveNet lightning（tfjs 4.8 MB，Apache） | 用眼睛连线就能转正，不需要姿态模型；体积会占掉一半预算 |
| face-api.js / @vladmandic/face-api（MIT） | tiny_face_detector 0.19 MB 加 68 点 tiny 模型 0.08 MB，可以用。但它自带一份 tfjs，会和我们的运行时重复。tfjs-models 是官方维护的 |
| @vladmandic/human 3.3.6（MIT） | esm bundle 2.07 MB，内含 tfjs，功能大部分用不上 |
| MediaPipe 人像分割的 tfjs 版（human 的 selfie 0.30 MB / meet 0.47 MB） | 体积很小，但只有 256×256，头发边缘差。可以留作“快速模式”，第一期不做 |
| @paddlejs-models/humanseg | 模型默认从百度 CDN 加载，项目已经不太维护 |
| OpenCV.js | 8 到 10 MB（没有实测），只为人脸检测不划算 |

## 六、GitHub 上现有的浏览器证件照项目（只参考）

| 项目 | 许可 | 技术 | 参考点 |
|---|---|---|---|
| Zeyi-Lin/HivisionIDPhotos（21.7k★） | Apache-2.0 | Python 加 ONNX：MODNet / hivision_modnet，MTCNN | 用抠图结果定头顶、规格表、排版、按 KB 压缩 |
| vijayanandraj/idphotokit | MIT | React，@mediapipe/tasks-vision，onnxruntime-web | 各国规格数据（965 种文件） |
| btahir/portraitpass | MIT | React，@mediapipe/tasks-vision | 浏览器端交互 |
| P4suta/face-fit | Apache-2.0 | 人脸对齐裁剪 | 裁剪算法 |
| adrian-x1/IDPhotoStudio | MIT | 桌面离线应用 | 交互流程 |

## 七、分期与任务

### 第零期：验证（1 到 2 天）

- [ ] 提交 `scripts/id-photo-model/convert.sh` 和 `models.lock.json`，确认能复现 6,728,154 B 的产物和对应的 sha256。
- [ ] 做一个浏览器 demo 页（只在本地用，不注册），在桌面 Chrome、iPhone Safari 和 Android Chrome 上测 WebGL 和 WASM 两种后端的耗时和峰值内存。
- [ ] 准备约 20 张测试图：长发、卷发、碎发、眼镜、浅色衣服配浅色背景、侧光、多人。比较原版 MODNet 和 hivision_modnet，定下用哪个，以及输入用 512 还是 384。
- 验收：手机上一次完整处理不超过 5 s，不崩溃；头发边缘主观评分可以接受；体积检查脚本通过。

### 第一期：单张证件照

- [ ] `logic.ts`（纯函数，不碰 DOM）：规格表；mm、inch、px 和 DPI 换算；根据人脸框、alpha 头顶和规格算裁剪框；由两眼算倾斜角；alpha 合成；对 JPEG quality 二分查找；写 JFIF density 和 PNG pHYs。
- [ ] `logic.test.ts`：覆盖以上每个函数，包括规格换算（例如一寸为 295×413 px@300dpi）、裁剪边界夹取、角度符号、KB 二分查找的收敛、DPI 字节写入后能读回来。
- [ ] 推理放到 Worker 里（OffscreenCanvas 加 tfjs），主线程不卡。模型在第一次使用时才加载，并显示进度。
- [ ] `index.vue`：上传或拍照 → 自动转正和裁剪（可拖动、缩放微调）→ 选底色（预设 10 种加取色器）→ 选规格 → 导出 JPG/PNG，可以指定 KB 范围，并写入 DPI。也可以上传已经抠好的透明 PNG，跳过抠图。
- [ ] `messages.ts` 写好 8 种语言；`src/registry/tools/media.ts` 注册，keywords 包括 `id photo`、`passport`、`证件照`、`一寸`、`签证`。
- 验收：`yarn lint`、vitest、`yarn build`、`./build.sh chrome` 全部通过；Chrome 扩展离线可用（断网测试）；在 390px 下截图检查；Network 面板里没有任何跨域请求。

### 第二期：排版和细节

- [ ] 5 寸和 6 寸相纸排版，同一张相纸可以混排一寸和二寸，带裁剪线，导出 JPG 或 PDF。
- [ ] 用纯 TS 写 guided filter 修 alpha 边缘，减少头发周围的色晕；支持白底和渐变底。
- [ ] 自定义规格（宽高、DPI、KB 范围），保存在 localStorage。
- [ ] 可选加入 @jsquash/jpeg，用 mozjpeg 让体积更精确（0.25 MB，在预算之内）。
- [ ] 更新 README.md 和 README_EN.md 的工具数量与分类表，记下模型来源和许可（NOTICE 或 README 致谢）。

### 第三期（可选）

- [ ] 简单美颜（磨皮、提亮），用 Canvas 滤镜，不用模型。
- [ ] 证件照合规提示：头部比例、眼睛高度、倾斜角是否在规格范围内。

## 八、风险

| 风险 | 应对 |
|---|---|
| 头发边缘不如 RMBG | 在第零期 A/B 测试 hivision_modnet；加 guided filter；允许上传已抠好的图 |
| 手机性能和 WASM 内存（512×512 的中间张量可能有几十到上百 MB） | 默认用 WebGL；用 `tf.tidy` 并及时 dispose；输入可以降到 384；处理完卸载模型；iOS 低内存时提示 |
| WebGL 精度或驱动差异（部分 Android 设备） | 检测到结果异常时自动退回 WASM 后端 |
| tfjs 4.22 之后更新变慢 | 锁定版本；保留方案 B（ORT 自定义精简构建）的评估结论 |
| 规格数据的准确性 | 每条规格都注明官方来源；可以自定义；不拷贝 AGPL 数据文件 |
| 模型许可的边界 | 在 `models.lock.json` 和 README 里写清楚 MODNet / hivision_modnet / BlazeFace 都是 Apache-2.0，并附上原始链接 |
| 预算被以后的功能挤爆 | 用 CI 体积检查强制控制，新增模型必须先更新预算表 |

## 九、来源

- onnxruntime-web 官方包和自定义构建：https://onnxruntime.ai/docs/build/web.html、https://github.com/microsoft/onnxruntime/issues/14817、https://www.npmjs.com/package/scanic-ml
- MODNet：https://github.com/ZHKKKe/MODNet（Apache-2.0）；ONNX：https://huggingface.co/Xenova/modnet
- hivision_modnet：https://github.com/Zeyi-Lin/HivisionIDPhotos/releases/tag/pretrained-model
- BlazeFace tfjs：https://tfhub.dev/mediapipe/tfjs-model/face_detection/short/1；封装：https://www.npmjs.com/package/@tensorflow-models/face-detection
- YuNet（方案 B）：https://github.com/opencv/opencv_zoo/tree/main/models/face_detection_yunet（MIT，232,589 B）
- @imgly/background-removal 的 LICENSE.md（AGPL-3.0）：npm 1.7.0 tarball
- RVM 许可：https://github.com/PeterL1n/RobustVideoMatting（GPL-3.0）
- 实测脚本和产物（box）：`/workspace/id-photo-research/`（run.mjs、fd.mjs、modnet_tfjs/、hiv_tfjs/、modnet_compare.jpg）

## 十、第一版实施记录（2026-11-12，分支 `feat/id-photo`）

- **抠图模型最终选 hivision_modnet**。6 张测试图上用 fp32 做 A/B，原版 MODNet 会在脸上和衣服上挖洞，在一张暗色老照片上完全失败；hivision_modnet 没有这些问题。
- **tfjs 自带的 `--quantize_uint8` 不适合 hivision_modnet**：和 fp32 比，3 张图的 IoU 分别为 0.967、0.939、0.076。把部分张量改成 fp16 也没有改善。改用自写的逐通道 uint8 打包（`scripts/id-photo-model/pack_q8.py`，浏览器端由 `logic.ts` 的 `dequantizeQ8` 还原）后，IoU 为 1.000、0.9996、0.994，体积 6,997,186 B（model.json 加 weights.q8.bin）。
- **matting 在旋转之前做**：先对原图抠图，再把 mask 和照片一起旋转。如果先旋转，补出来的黑角会让模型把背景误判成人像。
- 运行时：设备有硬件 WebGL 时用 WebGL；检测到 SwiftShader 这类软件渲染时优先用 WASM（单线程，加载 SIMD 版和普通版两个 wasm）。
- 构建时由 `vite.config.ts` 把 `assets/models/id-photo/` 和 tfjs 的 wasm 复制到 `public/offline/idphoto/`。`id-photo-size-guard` 统计 offline/idphoto、示例图和属于 tfjs 及本工具的 JS（按未压缩的模块长度算，偏保守），总量超过 10,000,000 B 时构建失败。
- 实测新增体积：资源 8,009,893 B，示例图 73,149 B，压缩后的 JS 884,436 B，合计约 **8.97 MB**。size guard 的保守口径是 9.74 MB。
- 已知问题：头发很蓬的人像，matte 判断的头顶可能被当作不可信而退回估算值，头发顶部会被裁掉一点，需要用微调。按两眼连线转正时，最多转 ±20°。
- 还没做：Worker 推理、guided filter 修边缘、美颜、PDF 导出、合规提示。
