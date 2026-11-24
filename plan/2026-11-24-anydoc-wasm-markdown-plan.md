# 文档转 Markdown（anydoc WASM）实施计划

> 日期：2026-11-24
> 状态：按已确认方案实施
> 上游：<https://github.com/firecrawl/anydoc.git>，标签 v0.2.5，commit `6feb6c2aedd69b97fa8af112ffeb187dcf79986e`
> 目标：在 SimpleTools 增加独立工具 `document-to-markdown`（办公分类）。文件只在浏览器里转成 GitHub Flavored Markdown。引擎是预编译的 anydoc WASM，随仓库提交，普通 `yarn build` 不调用 Rust。

## 约束

- 保留 `word-to-markdown`、`pdf-to-markdown`、`pandoc`，不改它们的实现、文案和注册项。
- 新工具 slug 为 `document-to-markdown`，分类 `office`，目录 `src/tools/document-to-markdown/`。
- 技术栈保持 Vue 3、Vite、TypeScript、Pinia、Tailwind 4、vue-i18n、Yarn 4。
- 8 种界面语言：zh-CN、en、ja、ko、de、fr、es、pt-BR。390px 窄屏和 1280px 桌面都能完成主流程。
- 只在浏览器本地转换，不上传，不请求外部 CDN。WASM 与胶水脚本从同源 `offline/anydoc/` 按需加载。
- Web 的 `BASE_URL` 为 `/`，Chrome / VS Code 扩展为 `./`。路径用页面地址解析成绝对同源 URL，再交给 Worker，避免相对 Worker 脚本地址解析错位。
- 许可只用宽松许可证。`vendor/anydoc` 是 git submodule，不放进 `thirdparty/`（该目录被 `.gitignore` 和 Vite `server.fs.deny` 屏蔽）。
- `yarn build` 不调用 `rustc`、`cargo` 或 `wasm-pack`。已提交的 `public/offline/anydoc/` 由 Vite 原样复制到 `dist/offline/anydoc/`。
- 不跑 `./build.sh chrome` 或 `./build.sh vscode`，不改扩展版本号，不打 tag，不推 `main`，不合并 PR。
- 提交身份使用 `git -c user.name="linkxzhou" -c user.email="zhoulv2000@163.com"`，不改全局 git config。
- 不提交 `dist/`、`node_modules/`、`chrome-extension/dist/`、`vscode-extension/media/`、`public/downloads/*.zip`、`public/downloads/*.vsix`。
- 验收只保存 PNG 截图，不录屏。

## 一、产物放在哪里

与 ImageMagick、PDFium、FFmpeg、OCR、证件照一样，运行时文件放在 `public/offline/`。区别是 anydoc 不来自 `node_modules`，而是本仓库预编译后直接提交。

`.gitignore` 从整目录忽略改为只忽略生成物，并放行 anydoc：

```gitignore
public/offline/*
!public/offline/anydoc/
```

`public/offline/*` 只匹配下一层。放行 `public/offline/anydoc/` 之后，其中的文件不再命中这条规则，可以被 Git 跟踪。`public/offline/magick/`、`public/offline/code/` 等仍被忽略。

用 `git check-ignore` 验收：

- `public/offline/anydoc/anydoc_wasm_bg.wasm` 不被忽略。
- `public/offline/magick/magick.wasm` 与 `public/offline/code/runtime-manifest.json` 仍被忽略。

提交到 `public/offline/anydoc/` 的文件：

| 文件 | 作用 |
|---|---|
| `anydoc_wasm_bg.wasm` | wasm-pack `--target web` 的发布构建 |
| `anydoc_wasm.js` | 浏览器胶水，导出 `init`、`formatFromBytes`、`formatFromPath`、`formatFromExtension`、`toMarkdownBytes` |
| `anydoc_wasm.d.ts` | 上述 API 的类型，实现以它的签名为准 |
| `SHA256SUMS` | 三个产物的 sha256，构建后用 `sha256sum -c` 核对 `dist/offline/anydoc/` |

首次下载体积以编译结果为准，界面写成「约 N MiB」。2026-11-24 用 Rust 1.88.0 与 wasm-pack 0.15.0 编出的 `anydoc_wasm_bg.wasm` 为 6,985,584 字节（6.66 MiB）。界面按这个实测值说明，不沿用编译前的 6.39 MiB 估计。

## 二、上游与编译

1. `git submodule add https://github.com/firecrawl/anydoc.git vendor/anydoc`
2. 在 `vendor/anydoc` 检出 `6feb6c2aedd69b97fa8af112ffeb187dcf79986e`（v0.2.5，`wasm/Cargo.toml` 版本为 0.2.5）。
3. 工具链：Rust 1.88+、target `wasm32-unknown-unknown`、`wasm-pack` 0.15.0 或兼容版本。只用于生成本次提交的产物，不进入 `package.json`，也不进入 Vite 插件。
4. 许可证复核命令（在 `vendor/anydoc`）：

```bash
cargo tree --target wasm32-unknown-unknown -p anydoc-wasm -e normal --format "{p} ({l})"
```

实际编进 WASM 的 crate 必须都是 MIT、Apache-2.0、BSD、ISC、Zlib、Unicode-3.0 这类宽松许可，不能出现 GPL、AGPL、SSPL、BUSL。若 `r-efi` 出现在这棵树上，记录选用 MIT OR Apache-2.0。结论写入 `LICENSES/anydoc.md`，并回填到本文件「许可证复核」一节。

5. `scripts/anydoc-wasm.sh`（可执行）：
   - 检查 `vendor/anydoc/wasm`、`rustc`、`wasm32-unknown-unknown`、`wasm-pack`。
   - 执行 `wasm-pack build vendor/anydoc/wasm --release --target web --scope firecrawl`。
   - 把 `anydoc_wasm_bg.wasm`、`anydoc_wasm.js`、`anydoc_wasm.d.ts` 复制到 `public/offline/anydoc/`。
   - 生成 `SHA256SUMS` 并立刻 `sha256sum -c`。
6. 跑一次脚本，把四个文件提交进仓库。
7. 不装 Rust 的验收：`yarn build` 之后 `dist/offline/anydoc/` 四个文件都在，且 `sha256sum -c SHA256SUMS` 通过。扩展模式用 `VITE_TARGET=chrome VITE_ROUTER_MODE=hash VITE_ENABLE_PANDOC=false yarn vite build`，确认 `chrome-extension/dist/offline/anydoc/` 存在，`stripWebOnlyCode` 与 `idPhotoSizeGuard` 通过，然后删除临时的 `chrome-extension/dist`。

`LICENSES/anydoc.md` 写入：

- firecrawl/anydoc v0.2.5（`6feb6c2aedd69b97fa8af112ffeb187dcf79986e`）完整 MIT 声明，Copyright (c) 2026 Sideguide Technologies Inc.
- 关键依赖：`pdf-inspector` MIT；`encoding_rs` Apache-2.0 OR MIT，以及 BSD-3-Clause 数据；`unicode-ident` Unicode-3.0。
- 上面那条 `cargo tree` 的复核结论。

README 的工具数量按注册表改为网页 200、扩展 200−10=190，办公分类 20。说明里补一句：`public/offline/` 里由 node_modules 复制的引擎仍不入库，`public/offline/anydoc/` 是提交的预编译引擎。

## 三、WASM API（以 `anydoc_wasm.d.ts` 为准）

`Format` 字符串枚举：

`doc` | `docx` | `odt` | `pdf` | `ppt` | `pptx` | `rtf` | `epub` | `xlsx` | `ods` | `odp` | `csv`

扩展名映射（与 `Format::from_extension` 一致）：

| 后缀 | 传入的 Format |
|---|---|
| `.doc` | `doc` |
| `.docx` `.docm` | `docx` |
| `.ppt` `.pps` `.pot` | `ppt` |
| `.pptx` `.pptm` `.ppsx` `.ppsm` | `pptx` |
| `.xls` `.xlsx` `.xlsm` `.xlsb` | `xlsx` |
| `.odt` `.ods` `.odp` `.rtf` `.epub` `.pdf` `.csv` | 同名 |

识别顺序：

1. 文件名后缀是 `.csv`（大小写不敏感）时，CSV 没有魔数，不看 `formatFromBytes`，显式传入 `'csv'`。
2. 其他格式先 `formatFromBytes`。
3. 返回空时回退 `formatFromPath(filename)`。
4. 两者都空则按 `unsupported` 报错，不调用转换。

`init` 使用 d.ts 的非弃用形式：`init({ module_or_path: wasmUrl })`。`wasmUrl` 是主线程解析好的绝对同源地址。初始化 Promise 缓存；失败时清掉缓存，允许重试。

`toMarkdownBytes(bytes, format)` 失败时抛出带 `code` 的 `Error`。完整映射：

| code | 含义 |
|---|---|
| `unsupported` | 格式未知或不能转换 |
| `needsOcr` | 扫描件或纯图片 PDF。附带 `pages`、`pageCount`。不输出残缺 Markdown |
| `malformed` | 结构不可用 |
| `encrypted` | 加密或有密码 |
| `resourceLimit` | 超过固定安全限制 |
| `missingPart` | 缺少出结果所必需的部件 |
| `engine` | 胶水或 WASM 加载失败，以及没有上述 code 的异常 |

## 四、工具文件

```
src/tools/document-to-markdown/
├── loader.ts        # BASE_URL + 页面 href → 绝对同源 js/wasm URL
├── worker.ts        # ES module Worker：加载、识别格式、同步 toMarkdownBytes
├── logic.ts         # 扩展名、accept、分组、CSV 规则、错误码、文件名、统计、路径纯函数
├── logic.test.ts    # 上述纯函数；环境能加载 WASM 时再加冒烟转换
├── messages.ts      # 8 语
└── index.vue        # 上传、状态、预览/源码、复制、下载、错误卡片
```

`src/registry/tools/office.ts` 追加一条，keywords 覆盖 word、docx、pptx、xlsx、odt、rtf、epub、pdf、csv、markdown。不改路由表：注册表由 `import.meta.glob('./tools/*.ts')` 收集，搜索和分类跟着走。

界面：

- 拖拽和点击选择。`<input accept>` 列出全部支持后缀。
- 展示 8 组格式：Word、PowerPoint、Excel、OpenDocument、RTF、EPUB、PDF、CSV。
- 说明：文件只在本机转换；首次从本站下载约 6.39 MiB（以实测为准）引擎；扫描件和纯图 PDF 没有本地 OCR，会明确失败。
- 状态：加载引擎、转换中、识别出的格式、耗时、字符数、行数。
- 结果区标题行右侧放复制按钮，可切换 GFM 预览和 Markdown 源码，可下载 `.md`，可清空或更换文件。预览复用 `marked` 的 GFM 和 `DOMPurify`，不新增 Markdown 包。
- `needsOcr`、`encrypted`、`unsupported`、`malformed`、`resourceLimit`、`missingPart` 以及引擎加载失败各有可读错误卡片。
- 输出会贴给 AI 使用，文案提供 `usageTitle` 与 `step1`、`step2`、`step3`，由现有 `UsageSteps` 渲染。
- 复制按钮在输出面板标题行右上角。窄屏按钮换行，不横向溢出。

## 五、测试与验收

`logic.test.ts` 覆盖：

- 扩展名到 Format 的映射，含 Excel 系列统一为 `xlsx`、PowerPoint 宏/放映格式。
- `.csv` / `.CSV` 强制 `'csv'`，即使字节探测为空或被误判。
- 非 CSV：字节探测优先，空则回退路径。
- 六类错误码加上引擎失败。
- `BASE_URL='/'` 与 `BASE_URL='./'`，以及扩展页 `chrome-extension://` 的绝对 URL。
- 输出 `.md` 文件名、空名、多后缀、统计的空串与多行。

若 Vitest 能直接加载 `public/offline/anydoc/anydoc_wasm_bg.wasm`，用小型 CSV 或 RTF 做一次真实转换。

命令：

- `yarn test`
- `yarn lint`（含 `vue-tsc -b`）
- `yarn build`，并核对 `dist/offline/anydoc/SHA256SUMS`
- 扩展模式 vite build（见第二节），随后删除 `chrome-extension/dist`

浏览器（Playwright / Chromium，对着 `vite preview` 的产物）：

- 准备小型真实文件：`.docx`、`.pptx`、`.xlsx`、`.odt`、`.rtf`、`.epub`、`.csv`、带文字层的 `.pdf`，以及一个无文字层的 PDF，用来触发 `needsOcr`。
- 核对转换结果、无 pageerror / console error、请求只有同源 `/offline/anydoc/`、预览与源码切换、复制和下载。
- 只保存 PNG：桌面 1280px 成功转换、窄屏 390px、扫描 PDF 的 `needsOcr` 错误。路径写在交付说明里。

## 六、执行顺序

- [ ] 阶段 0：本文件落盘。
- [ ] 阶段 1：submodule、`.gitignore`、`scripts/anydoc-wasm.sh`、许可证复核、`LICENSES/anydoc.md`、提交 `public/offline/anydoc/`。
- [ ] 阶段 2：loader、worker、logic、界面、8 语。
- [ ] 阶段 3：注册到 `office`，README 数量，扩展构建核验并清理产物。
- [ ] 阶段 4：单测、lint、`yarn build`、浏览器实测与 PNG。
- [ ] 在 `cursor/anydoc-wasm-markdown-5169` 上开 PR，不合并。

## 许可证复核

2026-11-24 在 `vendor/anydoc` 用 Rust 1.88.0 执行：

```bash
cargo tree --target wasm32-unknown-unknown -p anydoc-wasm -e normal --format "{p} ({l})"
```

wasm32 正常依赖图里的 crate 全部是宽松许可（MIT、Apache-2.0、BSD-3-Clause、Zlib、0BSD、Unlicense、MIT-0、CC0-1.0、BSL-1.0、Unicode-3.0，含 `OR` 双许可）。没有 GPL、AGPL、SSPL、BUSL。

- `pdf-inspector` 1.14.2 为 MIT。
- `encoding_rs` 0.8.35 为 (Apache-2.0 OR MIT) AND BSD-3-Clause。
- `unicode-ident` 1.0.24 为 (MIT OR Apache-2.0) AND Unicode-3.0。
- `r-efi` 不在这棵树上，无需再为它选择 MIT / Apache-2.0。
- 有选择时采用：`ryu` 用 Apache-2.0（不采用 BSL-1.0）；`csv` / `memchr` / `aho-corasick` 用 MIT；`constant_time_eq` 用 Apache-2.0；`adler2` 用 MIT。

完整声明见 `LICENSES/anydoc.md`。
