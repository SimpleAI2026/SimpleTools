# thirdparty（BrainCoder）工具实现方式分析：WASM vs 纯 JS/TS

> 日期：2026-10-20 · 仅分析，不涉及应用代码改动
> 方法：读取 `package.json` 依赖；逐个扫描 `src/features/<slug>/` 的实际 import 与调用（含 `@/lib/wasm-core`、`tesseract.js`、`sql.js`、`pdfjs-dist` 等）；检查 `public/`、`src/lib/core/pkg/`、`crates/core/`。
> 限制：thirdparty 未安装 `node_modules`，第三方 npm 包内部文件（如 pdf.js 自带的 wasm 解码器）无法在本地核实，相关结论基于源码调用方式推断，已标注。

## 1. 结论摘要

| 实现方式 | 工具数 | 工具 |
|---|---|---|
| **WASM + JS 回退**（项目自有 Rust core） | 4 | pdf-merge, pdf-split, pdf-remove-pages, pdf-remove-blank-pages |
| **WASM（第三方 npm，无回退）** | 3 | image-ocr, pdf-ocr（tesseract.js）；sqlite-viewer（sql.js） |
| **纯 JS/TS** | 117 | 其余全部 |
| 合计 | 124 | |

要点：
1. 项目自有 Rust core 只被 **4 个工具实际使用**（`merge_pdfs`、`extract_pdfs`），且都有 pdf-lib 回退，WASM 只是加速/保真增强，不是必需。
2. README 宣称的 **WASM 脱敏（`redact_pdfs`）和自动脱敏匹配（`find_matches`）在应用中未被调用**，只在 `e2e/wasm-validate.mjs` 中做等价测试。实际的 `pdf-redact` / `pdf-auto-redact` 用 pdf-lib `drawRectangle` 盖黑框，属**外观遮盖**，底层文本仍可提取。
3. `pdf-editor` 导入了 `splitWordsWasm`（Rust `split_words`），但只在 `engine: "wasm"` 时启用，代码中没有调用方传这个参数，**实际走 JS 路径**，计为 JS。
4. 真正离不开 WASM 的只有 **OCR（tesseract）** 和 **SQLite 查看器（sql.js）**。
5. 未发现 ffmpeg.wasm、squoosh/jSquash 图片编解码器、hash-wasm 等其它 WASM 包；图片压缩/转换全部用 Canvas/OffscreenCanvas，哈希/AES 用 WebCrypto，gzip 用原生 `CompressionStream`。
6. `pdfjs-dist`（约 25 个 PDF 工具使用）是纯 JS 主体。较新版本的 pdf.js 附带**可选** wasm 解码器（JPEG2000/JBIG2/色彩管理），需设置 `wasmUrl` 才加载；本项目只设置了 `GlobalWorkerOptions.workerSrc`，未设 `wasmUrl`，因此按 JS 路径运行（含 JPX 图片的 PDF 渲染可能受影响）。此条无法在本地 node_modules 中核实。

## 2. WASM 模块清单

| 模块 | 来源 | 位置 / 文件 | 大小 | 导出 / 能力 | 构建与加载 | 使用工具 |
|---|---|---|---|---|---|---|
| **braincoder-core**（自有） | `crates/core/src/lib.rs`（321 行 Rust），依赖 `zpdf-core/parser/writer =0.13.0`、`wasm-bindgen =0.2.128`、`js-sys`、`getrandom`（wasm_js） | `public/wasm/core_bg.wasm`（运行时加载）；同一份拷贝在 `src/lib/core/pkg/core_bg.wasm`（+ `core.js` 19 KB 胶水、`core.d.ts`）和 `e2e/.wasm-node/core_bg.wasm`（Node 测试用） | **666,323 B（≈651 KB）**，三份完全相同 | `merge_pdfs(files)`、`extract_pdfs(bytes, groups)`、`redact_pdfs(bytes, pageRects)`、`split_words(...)` → `WordBatch{data(),texts()}`、`find_matches(xs,ys,ws,hs,fonts,texts,pageW,pageH,query)`、`add`（示例） | `npm run build:core`：`cargo build --release --target wasm32-unknown-unknown` → `wasm-bindgen --target web`（输出到 src/lib/core/pkg）与 `--target nodejs`（输出到 e2e/.wasm-node）→ 拷贝到 public/wasm。release profile：`opt-level="s"`、LTO、`codegen-units=1`、`panic=abort`、strip。产物已提交到仓库，平时 `next build` 不编译 Rust。桥接层 `src/lib/wasm-core.ts`：`loadCore()` 懒加载并缓存，失败返回 null；包装函数 `mergePdfsWasm/extractPdfsWasm/splitWordsWasm/redactPdfsWasm/findMatchRects` 出错时返回 null 或走 JS 实现。`npm run test:core` 校验 WASM 与 JS 结果等价。 | 实际调用：pdf-merge（merge_pdfs），pdf-split / pdf-remove-pages / pdf-remove-blank-pages（extract_pdfs）。未调用：redact_pdfs、find_matches；split_words 仅休眠路径 |
| **tesseract.js-core**（第三方） | npm `tesseract.js ^7` | `public/ocr/tesseract-core-lstm.wasm.js`（3,896,484 B）、`-simd-lstm.wasm.js`（3,899,472 B）、`-relaxedsimd-lstm.wasm.js`（3,905,767 B），wasm 以内嵌方式打包在 JS 中，运行时按 CPU 特性选择其一；`worker.min.js`（111,307 B） | 每个变体 ≈3.7 MB | Tesseract OCR 引擎（仅 LSTM 模式） | 资源已从 npm 包拷贝进 `public/ocr` 自托管；`Tesseract.createWorker(lang, OEM=1, {workerPath, corePath, langPath})` 指向本站路径，不访问 CDN | image-ocr（`ocr-engine.ts`）、pdf-ocr |
| OCR 语言包（数据，非代码） | tessdata | `public/ocr/traineddata/*.traineddata.gz`，12 种：ara 1.66 MB、chi_sim 1.72 MB、deu 1.33 MB、eng 2.95 MB、fra 0.71 MB、hin 1.39 MB、ita 1.66 MB、jpn 2.03 MB、kor 1.57 MB、por 1.39 MB、rus 2.68 MB、spa 2.10 MB | 合计 ≈21 MB | — | 按所选语言懒加载 | 同上 |
| **sql.js**（第三方） | npm `sql.js ^1.14` | `public/sql-wasm.wasm` | **658,410 B（≈643 KB）** | 完整 SQLite（打开 .db、执行 SQL） | `initSqlJs({ locateFile: () => "/sql-wasm.wasm" })`，动态加载 | sqlite-viewer |
| pdf.js 可选解码器（推断） | npm `pdfjs-dist ^6` | 未拷贝到 public，未配置 `wasmUrl` | — | JPX/JBIG2/ICC 解码 | **未启用** | （无） |

WASM 静态资源合计：自有 core 0.65 MB + sql.js 0.64 MB + tesseract 3 个变体约 11.7 MB + 语言包约 21 MB ≈ **34 MB**（单次 OCR 实际只下载 1 个 core 变体和所选语言包）。

## 3. 逐工具表（124 个，按注册表顺序）

列说明：“实现”指运行时计算路径；“关键库”为该工具目录中实际 import/调用到的库或浏览器 API（Canvas/Worker/WebCrypto 为浏览器原生）。

| slug | 分类 | 实现 | 关键库 | 备注 |
|---|---|---|---|---|
| `pdf-compressor` | 压缩 | JS | pdf-lib, Web Worker, Canvas | Worker 中用 pdf-lib 改写图片流，Canvas 重编码 JPEG |
| `image-compressor` | 压缩 | JS | Web Worker, Canvas | Worker + OffscreenCanvas 编码（含 AVIF，依赖浏览器支持） |
| `image-resizer` | 转换 | JS | Canvas |  |
| `json-formatter` | 开发 | JS | 原生 JS/DOM |  |
| `url-encoder` | 编码解码 | JS | 原生 JS/DOM |  |
| `base64` | 编码解码 | JS | 原生 JS/DOM |  |
| `notepad` | 文本 | JS | 原生 JS/DOM |  |
| `password-generator` | 生成器 | JS | 原生 JS/DOM |  |
| `diff-checker` | 文本 | JS | 原生 JS/DOM |  |
| `regex-tester` | 开发 | JS | 原生 JS/DOM |  |
| `timestamp-converter` | 转换 | JS | 原生 JS/DOM |  |
| `hash-generator` | 编码解码 | JS | WebCrypto |  |
| `markdown-preview` | 开发 | JS | marked |  |
| `html-minifier` | 开发 | JS | 原生 JS/DOM |  |
| `case-converter` | 转换 | JS | 原生 JS/DOM |  |
| `uuid-generator` | 生成器 | JS | 原生 JS/DOM |  |
| `word-counter` | 文本 | JS | 原生 JS/DOM |  |
| `lorem-ipsum` | 生成器 | JS | 原生 JS/DOM |  |
| `color-converter` | 转换 | JS | 原生 JS/DOM |  |
| `css-cursor` | 开发 | JS | 原生 JS/DOM |  |
| `gzip-tool` | 压缩 | JS | CompressionStream | 原生 CompressionStream |
| `image-to-pdf` | 转换 | JS | pdf-lib, Canvas |  |
| `pdf-to-image` | 转换 | JS | pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包）, fflate, Canvas | pdf.js（JS，未配置 wasmUrl） |
| `pdf-to-word` | 转换 | JS | pdf-office/support（pdf.js 渲染/文本 + fflate 打包） | pdf.js（JS，未配置 wasmUrl） |
| `word-to-pdf` | 转换 | JS | pdf-lib, pdf-office/support（pdf.js 渲染/文本 + fflate 打包）, html2canvas, Canvas | pdf.js（JS，未配置 wasmUrl） |
| `pdf-to-text` | 转换 | JS | pdf-office/support（pdf.js 渲染/文本 + fflate 打包） | pdf.js（JS，未配置 wasmUrl） |
| `text-to-pdf` | 转换 | JS | pdf-office/support（pdf.js 渲染/文本 + fflate 打包） | pdf.js（JS，未配置 wasmUrl） |
| `pdf-to-ppt` | 转换 | JS | pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包） | pdf.js（JS，未配置 wasmUrl） |
| `pdf-rotate` | 转换 | JS | pdf-lib |  |
| `pdf-remove-blank-pages` | 转换 | WASM+JS 回退 | pdf-lib, pdfjs-dist, Canvas, wasm-core | Rust core `extract_pdfs`；回退 pdf-lib；空白页判定用 pdf.js 渲染 + Canvas 采样（JS）；pdf.js（JS，未配置 wasmUrl） |
| `pdf-remove-pages` | 转换 | WASM+JS 回退 | pdf-lib, pdfjs-dist, Canvas, wasm-core | Rust core `extract_pdfs`；回退 pdf-lib；pdf.js（JS，未配置 wasmUrl） |
| `pdf-watermark` | 转换 | JS | pdf-lib |  |
| `pdf-page-numbers` | 转换 | JS | pdf-lib |  |
| `pdf-crop` | 转换 | JS | pdf-lib, pdfjs-dist, Canvas | pdf.js（JS，未配置 wasmUrl） |
| `pdf-protect` | 转换 | JS | pdf-lib, @pdfsmaller/pdf-encrypt | @pdfsmaller/pdf-encrypt/decrypt（纯 JS RC4/AES） |
| `pdf-unlock` | 转换 | JS | pdf-lib, @pdfsmaller/pdf-decrypt | @pdfsmaller/pdf-encrypt/decrypt（纯 JS RC4/AES） |
| `pdf-metadata` | 转换 | JS | pdfjs-dist | pdf.js（JS，未配置 wasmUrl） |
| `pdf-to-excel` | 转换 | JS | pdfjs-dist, lib/spreadsheet（fflate 手写 OOXML） | pdf.js（JS，未配置 wasmUrl） |
| `pdf-to-markdown` | 转换 | JS | pdfjs-dist | pdf.js（JS，未配置 wasmUrl） |
| `pdf-ocr` | 转换 | WASM（第三方） | pdfjs-dist, tesseract.js, Canvas | tesseract.js（tesseract-core LSTM wasm，含 SIMD/relaxed-SIMD 变体），worker/core/语言包自托管于 public/ocr；无 JS 回退；先用 pdf.js 把页面渲染为图片；pdf.js（JS，未配置 wasmUrl） |
| `pdf-compare` | 转换 | JS | pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包） | pdf.js（JS，未配置 wasmUrl） |
| `pdf-redact` | 转换 | JS | pdf-lib, pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包） | ⚠️ 仅用 pdf-lib `drawRectangle` 盖黑框（外观遮盖，底层文字仍在）；README 宣称的 Rust `redact_pdfs`/`find_matches` 未被调用；pdf.js（JS，未配置 wasmUrl） |
| `pdf-auto-redact` | 转换 | JS | pdf-lib, pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包）, Canvas | ⚠️ 仅用 pdf-lib `drawRectangle` 盖黑框（外观遮盖，底层文字仍在）；README 宣称的 Rust `redact_pdfs`/`find_matches` 未被调用；pdf.js（JS，未配置 wasmUrl） |
| `pdf-overlay` | 转换 | JS | pdf-lib, pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包）, Canvas | pdf.js（JS，未配置 wasmUrl） |
| `pdf-flatten` | 转换 | JS | pdf-lib, pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包）, Canvas | pdf.js（JS，未配置 wasmUrl） |
| `pdf-remove-annotations` | 转换 | JS | pdf-lib |  |
| `pdf-scale-pages` | 转换 | JS | pdf-lib, pdfjs-dist, pdf-office/support（pdf.js 渲染/文本 + fflate 打包） | pdf.js（JS，未配置 wasmUrl） |
| `md-to-html` | 转换 | JS | marked |  |
| `html-to-pdf` | 转换 | JS | pdf-lib |  |
| `html-to-image` | 转换 | JS | html2canvas |  |
| `image-ocr` | 转换 | WASM（第三方） | tesseract.js | tesseract.js（tesseract-core LSTM wasm，含 SIMD/relaxed-SIMD 变体），worker/core/语言包自托管于 public/ocr；无 JS 回退 |
| `image-editor` | 图片与设计 | JS | Canvas |  |
| `jwt-decoder` | 开发 | JS | 原生 JS/DOM |  |
| `qr-code-generator` | 生成器 | JS | Canvas | 自写 QR 编码（qr-encode.ts），未用 qrcode 包 |
| `csv-json` | 转换 | JS | 原生 JS/DOM |  |
| `json-to-typescript` | 开发 | JS | 原生 JS/DOM |  |
| `sql-formatter` | 开发 | JS | sql-formatter |  |
| `xml-formatter` | 开发 | JS | 原生 JS/DOM |  |
| `cron-parser` | 开发 | JS | cron-parser |  |
| `number-base` | 转换 | JS | 原生 JS/DOM |  |
| `chmod-calculator` | 开发 | JS | 原生 JS/DOM |  |
| `px-rem` | 开发 | JS | 原生 JS/DOM |  |
| `http-status` | 开发 | JS | 原生 JS/DOM |  |
| `html-entities` | 编码解码 | JS | 原生 JS/DOM |  |
| `text-lines` | 文本 | JS | 原生 JS/DOM |  |
| `text-size-calculator` | 文本 | JS | 原生 JS/DOM |  |
| `url-parser` | 开发 | JS | 原生 JS/DOM |  |
| `image-base64` | 编码解码 | JS | 原生 JS/DOM |  |
| `binary-text` | 编码解码 | JS | 原生 JS/DOM |  |
| `rot13` | 编码解码 | JS | 原生 JS/DOM |  |
| `morse-code` | 编码解码 | JS | 原生 JS/DOM |  |
| `utf8-converter` | 编码解码 | JS | 原生 JS/DOM |  |
| `base32` | 编码解码 | JS | 原生 JS/DOM |  |
| `checksum-calculator` | 开发 | JS | WebCrypto |  |
| `aes-encryption` | 编码解码 | JS | WebCrypto |  |
| `box-shadow-generator` | 图片与设计 | JS | 原生 JS/DOM |  |
| `border-radius-generator` | 图片与设计 | JS | 原生 JS/DOM |  |
| `cubic-bezier-editor` | 图片与设计 | JS | 原生 JS/DOM |  |
| `gradient-generator` | 图片与设计 | JS | 原生 JS/DOM |  |
| `css-unit-converter` | 转换 | JS | 原生 JS/DOM |  |
| `json-xml` | 转换 | JS | 原生 JS/DOM |  |
| `json-yaml` | 转换 | JS | js-yaml |  |
| `toml-json` | 转换 | JS | smol-toml |  |
| `html-markdown` | 转换 | JS | marked, turndown |  |
| `json-viewer` | 开发 | JS | 原生 JS/DOM |  |
| `slug-generator` | 文本 | JS | 原生 JS/DOM |  |
| `unicode-styles` | 文本 | JS | 原生 JS/DOM |  |
| `upside-down-text` | 文本 | JS | 原生 JS/DOM |  |
| `text-repeater` | 文本 | JS | 原生 JS/DOM |  |
| `text-cleaner` | 文本 | JS | 原生 JS/DOM |  |
| `random-number-generator` | 生成器 | JS | 原生 JS/DOM |  |
| `random-name-picker` | 生成器 | JS | 原生 JS/DOM |  |
| `coin-dice-roller` | 生成器 | JS | 原生 JS/DOM |  |
| `bitwise-calculator` | 开发 | JS | 原生 JS/DOM |  |
| `roman-numerals` | 转换 | JS | 原生 JS/DOM |  |
| `ipv4-converter` | 开发 | JS | 原生 JS/DOM |  |
| `cidr-calculator` | 开发 | JS | 原生 JS/DOM |  |
| `image-format-converter` | 图片与设计 | JS | Canvas |  |
| `image-filters` | 图片与设计 | JS | Canvas |  |
| `image-splitter` | 图片与设计 | JS | Canvas |  |
| `unit-converter` | 转换 | JS | 原生 JS/DOM |  |
| `html-formatter` | 开发 | JS | prettier（经 lib/formatCode.ts 动态加载） |  |
| `css-formatter` | 开发 | JS | prettier（经 lib/formatCode.ts 动态加载） |  |
| `javascript-formatter` | 开发 | JS | prettier（经 lib/formatCode.ts 动态加载） |  |
| `csv-formatter` | 开发 | JS | 原生 JS/DOM |  |
| `csv-to-sql` | 开发 | JS | 原生 JS/DOM |  |
| `sqlite-viewer` | 开发 | WASM（第三方） | sql.js | sql.js（SQLite 编译为 wasm），`locateFile` 指向 /sql-wasm.wasm；无 JS 回退 |
| `pdf-merge` | 转换 | WASM+JS 回退 | pdf-lib, wasm-core | Rust core `merge_pdfs`；失败/不可用时回退 pdf-lib `copyPages` |
| `pdf-split` | 转换 | WASM+JS 回退 | pdf-lib, pdfjs-dist, Canvas, wasm-core | Rust core `extract_pdfs`；回退 pdf-lib；pdf.js（JS，未配置 wasmUrl） |
| `pdf-editor` | 转换 | JS | pdf-lib, pdfjs-dist, @pdfsmaller/pdf-encrypt, @pdfsmaller/pdf-decrypt, Canvas, wasm-core | 导入了 `splitWordsWasm`（Rust `split_words`），但仅当 `engine: "wasm"` 时走 WASM，代码中无调用方传此参数 → 实际运行 JS 路径；pdf.js（JS，未配置 wasmUrl） |
| `pdf-creator` | 转换 | JS | pdf-lib, Canvas |  |
| `svg-formatter` | 开发 | JS | prettier（经 lib/formatCode.ts 动态加载） |  |
| `svg-to-png` | 转换 | JS | Canvas |  |
| `word-to-text` | 办公 | JS | mammoth（lib/docx） | mammoth（docx→HTML，纯 JS） |
| `word-to-markdown` | 办公 | JS | mammoth（lib/docx）, marked | mammoth（docx→HTML，纯 JS） |
| `word-viewer` | 办公 | JS | mammoth（lib/docx） | mammoth（docx→HTML，纯 JS） |
| `word-creator` | 办公 | JS | mammoth（lib/docx） | lib/docx 用 fflate 手写 OOXML |
| `csv-to-excel` | 办公 | JS | lib/spreadsheet（fflate 手写 OOXML） | 自写 xlsx 读写（fflate 解压/打包 + XML 解析） |
| `excel-viewer` | 办公 | JS | lib/spreadsheet（fflate 手写 OOXML） | 自写 xlsx 读写（fflate 解压/打包 + XML 解析） |
| `excel-to-csv` | 办公 | JS | lib/spreadsheet（fflate 手写 OOXML） | 自写 xlsx 读写（fflate 解压/打包 + XML 解析） |
| `excel-to-json` | 办公 | JS | lib/spreadsheet（fflate 手写 OOXML） | 自写 xlsx 读写（fflate 解压/打包 + XML 解析） |
| `excel-merge` | 办公 | JS | lib/spreadsheet（fflate 手写 OOXML） | 自写 xlsx 读写（fflate 解压/打包 + XML 解析） |
| `excel-to-pdf` | 办公 | JS | pdf-lib, lib/spreadsheet（fflate 手写 OOXML）, html2canvas, Canvas |  |
| `pptx-creator` | 办公 | JS | lib/pptx（fflate） | fflate 手写 OOXML |
> 未列出关键库的工具只用原生 JS/DOM 和项目内自写模块（如 `cron.ts`、`diff.ts`、`regex-engine.ts`、`xml-format.ts`、`lib/json-format.ts`）。`prettier` 由 `src/lib/formatCode.ts` 间接使用（css/html/javascript/svg-formatter，纯 JS）；`package.json` 声明的 `qrcode` 在源码中未被 import（QR 用自写编码器），属残留依赖。

## 4. 对 Vue 重写的影响与建议

### 4.1 真正需要 WASM 的（3 个，保留 WASM，用 npm 包，不自写）
| 工具 | 建议 | 离线要求（决策 D5） |
|---|---|---|
| image-ocr、pdf-ocr | `tesseract.js` + `tesseract.js-core`；语言包用 `@tesseract.js-data/eng`、`@tesseract.js-data/chi_sim` 等 npm 包 | 按 plan.md 0.2 的资源管线，构建时从 node_modules 拷贝到 `public/offline/ocr/`，`createWorker` 显式设置 `workerPath/corePath/langPath`；默认只带 eng + chi_sim（约 4.7 MB），其它语言可配置 |
| sqlite-viewer | `sql.js`，Vite 用 `import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'` 并传给 `locateFile` | wasm 随构建产物输出，天然离线 |

### 4.2 原项目用 WASM 但可纯 JS 实现的（4 个）
pdf-merge、pdf-split、pdf-remove-pages、pdf-remove-blank-pages：直接用 **pdf-lib**（`PDFDocument.create()` + `copyPages`），也就是原项目的回退路径本身。**不建议**复刻 Rust core：需要 Rust 工具链和 wasm-bindgen，会增加构建复杂度，收益只是大文件时更快、对部分畸形 PDF 更宽容。如果以后遇到 pdf-lib 处理不了的文件，再考虑引入独立的 WASM 库（例如 qpdf 的 wasm 构建或 mupdf.js），并且同样保留 JS 回退。

### 4.3 脱敏（pdf-redact / pdf-auto-redact）
原项目实际只是盖黑框（可被复制/提取出原文），属于安全缺陷。建议按 plan.md 的方案：用 pdf.js 把含遮盖区域的页面**栅格化**，再用 pdf-lib 以图片重建该页，保证内容真正消失；自动脱敏的词匹配用 pdf.js `getTextContent` 的坐标在 JS 中完成（原项目已有等价 JS 实现，Rust `find_matches` 只是同一算法的另一种实现）。验收要求：输出 PDF 用文本提取查不到被遮盖的内容。

### 4.4 重型 JS 库（非 WASM，但体积大，需要懒加载 / 放进 Worker）
| 库 | 涉及工具 | 建议 |
|---|---|---|
| pdfjs-dist（约 1–2 MB + worker） | 约 25 个 PDF 读取/渲染类工具 | 统一封装 `usePdfjs()`，用 `?url` 引入 worker；可选通过 `wasmUrl` 启用官方 wasm 解码器以支持 JPX 图片（资源同样自托管） |
| pdf-lib (+ @pdf-lib/fontkit) | 约 30 个 PDF 写入类工具 | 动态 import；中文文本需要嵌入 CJK 字体子集（按 D5 自托管 Noto Sans SC 子集） |
| @pdfsmaller/pdf-encrypt / decrypt | pdf-protect, pdf-unlock, pdf-editor | 可沿用（纯 JS）；评审时先确认维护状况与加密强度（AES-256） |
| mammoth | word-to-text/markdown/viewer、word-to-pdf | 沿用 |
| 原项目手写 OOXML（fflate） | Excel 5 个、word-creator、pptx-creator、pdf-to-word/ppt/excel | 改用成熟库：SheetJS（xlsx）或 exceljs、`docx`、`pptxgenjs`，减少自维护的 XML 代码 |
| html2canvas | html-to-image、word-to-pdf、excel-to-pdf | 可换成 `html-to-image`（基于 SVG foreignObject，体积更小）或保留 |
| marked + turndown | markdown 系列 | 沿用，加上 DOMPurify |
| js-yaml、smol-toml、sql-formatter、cron-parser | 对应转换/格式化工具 | 沿用，按需加载 |
| prettier/standalone | html/css/js/svg-formatter | 原项目同样使用（经 lib/formatCode）；重写时按语言动态加载插件，代价是数百 KB |

### 4.5 纯原生能力即可（大部分工具）
文本、编码、生成器、颜色/CSS 生成器、计算器类（约 70 个）只需原生 JS；哈希、HMAC、AES 用 WebCrypto（MD5/CRC32 需要自写，或用很小的库）；gzip 用 `CompressionStream`（旧版 Safari 需要回退到 fflate）；图片类用 Canvas/OffscreenCanvas，AVIF 编码依赖浏览器（Chrome 支持，Safari/Firefox 不一定），如果必须支持，可以引入 jSquash（`@jsquash/avif`，WASM）作为可选增强。

### 4.6 结论
- 必须带 WASM 的只有 OCR（2 个）和 SQLite（1 个），都用现成 npm 包，不需要 Rust 工具链。
- 项目自有 Rust core 不复刻，4 个工具用 pdf-lib 实现即可。
- 主要的体积与复杂度来自 pdf.js、pdf-lib、OCR 资源和字体，需要统一懒加载、放进 Worker，并按 D5 自托管离线资源。
