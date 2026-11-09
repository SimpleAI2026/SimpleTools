# SimpleTools 实施计划（Vue 3 + shadcn-vue 重写）

> 状态：待评审（仅计划，不含任何应用代码）
> 日期：2026-10-20
> 参考对象：`thirdparty/BrainCoder`（MIT 许可，仅作参考，新实现不得 import / 依赖 / 复制其代码）

---

## 0. 决策记录（2026-10-20 评审结论）

| # | 议题 | 决策 | 对计划的影响 |
|---|---|---|---|
| D1 | 范围（Q4） | 本轮只做**框架 + 10 个工具**，暂不做 PDF/Office/OCR 重型工具 | M0+M1 完整交付，M2/M3 仅交付下列 10 个工具，其余工具在注册表外，不显示 |
| D2 | 界面语言（Q2） | **中英双语**，vue-i18n；工具名称/描述本地化；语言切换并持久化（localStorage `st_locale`，首次按浏览器语言） | 新增 `src/i18n/`，registry 只存 i18n key |
| D3 | 包管理器（Q1） | **Yarn 4（Berry）**，`nodeLinker: node-modules`，经 corepack 启用；**Node ≥ 20** | `package.json` 写 `packageManager`、`engines.node`；`.yarnrc.yml` |
| D4 | 部署（Q8） | **仅本地部署**，根路径，history 路由，用 `vite preview` 提供服务 | `base: '/'`，无需 hash 模式 |
| D5 | 离线资源（Q5） | OCR 语言包与字体**必须随站点打包，完全离线**；本轮先设计资源管线，等 OCR 工具上线时实现 | 见 0.2 |
| D6 | build.sh（Q7） | 子命令 `dev \| build \| preview \| lint \| test` | 见第 5 节更新 |
| — | Q3/Q6/Q9/Q10 | 未决：默认不做 SEO 预渲染、不加统计/PWA；脱敏方案待 PDF 阶段再定；名称沿用 SimpleTools | — |

### 0.1 本轮 10 个工具

| # | slug | 分类 | 选择理由（覆盖的框架能力） |
|---|---|---|---|
| 1 | json-formatter | Developer | 双栏文本输入输出、错误定位（行/列）、格式化/压缩 |
| 2 | base64 | Encode & Decode | UTF-8 安全编码、URL-safe 变体、编/解码模式切换 |
| 3 | url-encoder | Encode & Decode | component / 完整 URL 两种模式、解码错误处理 |
| 4 | hash-generator | Encode & Decode | **异步** WebCrypto（SHA-1/256/384/512），多结果复制 |
| 5 | password-generator | Generate | 选项表单（滑块/开关）、`crypto.getRandomValues`、强度评估 |
| 6 | uuid-generator | Generate | 批量生成、格式选项（大写/去连字符）、下载 .txt |
| 7 | timestamp-converter | Convert | 时间与时区、`Intl` 本地化（随语言切换） |
| 8 | case-converter | Convert | 纯字符串变换、多输出卡片 |
| 9 | word-counter | Text Tools | 实时统计、中英文混排计数（CJK 字符） |
| 10 | image-resizer | Convert | **文件拖放**、Canvas、比例锁定、Blob 下载、对象 URL 回收 |

### 0.2 离线资源管线设计（D5，OCR 工具上线时实现）
1. 资源来源：从 npm 安装 `tesseract.js`、`tesseract.js-core`，语言包使用 `@tesseract.js-data/<lang>`（如 eng、chi_sim）npm 包，字体使用开源 Noto Sans SC 子集（OFL）放入 `assets-src/fonts/`；均有固定版本与 SHA-256 记录在 `scripts/offline-assets.json`。
2. `scripts/sync-offline-assets.mjs`（由 `yarn assets` 调用、`build.sh build/dev` 前置执行）：从 `node_modules` 复制 worker、core wasm、`*.traineddata.gz` 到 `public/offline/ocr/`，字体到 `public/offline/fonts/`，并校验哈希；缺失或不一致即失败。
3. 运行时：`createWorker` 显式传入 `workerPath / corePath / langPath` 指向 `/offline/ocr/`，`cacheMethod: 'none'` 或使用 IndexedDB 缓存，**绝不访问 CDN**；字体经 `fetch('/offline/fonts/…')` 交给 pdf-lib/fontkit 嵌入。
4. 验证：E2E 中用 Playwright 拦截所有非 localhost 请求并断言为 0。
5. 体积控制：语言包默认 eng + chi_sim，可在 `offline-assets.json` 增减；构建报告列出 offline 资源体积。

### 0.3 本轮实施状态（2026-10-20）
- 已完成：M0 脚手架 + M1 站点外壳（注册表、首页搜索/分类、收藏/最近、中英切换与持久化、暗色模式、404、按工具分包）+ 0.1 中 10 个工具，每个工具 `logic.ts` 均有单测。
- 与原计划差异：shadcn-vue 组件按其源码规范手写于 `src/components/ui`（button/card/input/textarea/label/badge/switch/slider，基于 reka-ui + cva），未运行交互式 CLI；后续可用 `npx shadcn-vue add` 增补（`components.json` 已配置）。⌘K 命令面板、Toast、Playwright E2E、离线资源管线脚本推迟到后续里程碑。
- Tailwind v4 自动扫描已通过 `@source not` 排除 `thirdparty/` 与 `plan/`。

### 0.4 全量纯 JS 工具实施进度（第二轮，2026-10-20 起）
> 范围：wasm-vs-js.md 中 117 个纯 JS 工具（已完成 10 个，余 107）；7 个 WASM 工具暂缓。每完成一个分类即跑 lint/test/build。

| 分类 | 状态 | 工具 |
|---|---|---|
| 编码解码 | ✅ 完成（8） | base32, aes-encryption, binary-text, html-entities, image-base64, morse-code, rot13, utf8-converter |
| 生成器 | ✅ 完成（5） | qr-code-generator（qrcode 包，懒加载）, lorem-ipsum, random-number-generator, random-name-picker, coin-dice-roller |
| 文本 | ✅ 完成（9） | diff-checker（jsdiff）, notepad（多篇、localStorage）, text-lines, text-cleaner, slug-generator, text-size-calculator, unicode-styles, upside-down-text, text-repeater |
| 开发 | ✅ 完成（24） | regex-tester(Worker), jwt-decoder, json-viewer, url-parser, checksum-calculator, http-status, chmod-calculator, cidr-calculator, ipv4-converter, bitwise-calculator, px-rem, css-cursor, css/html/javascript-formatter(prettier 按需加载), svg-formatter, sql-formatter(sql-formatter), xml-formatter, csv-formatter, csv-to-sql(papaparse), cron-parser(cron-parser), html-minifier, json-to-typescript, markdown-preview(marked+DOMPurify) |
| 媒体与设计 | ✅ 完成（8） | border-radius-generator, box-shadow-generator, cubic-bezier-editor, gradient-generator, image-editor(裁剪/旋转/翻转/调色), image-filters(像素级色彩矩阵+盒式模糊), image-format-converter(批量+ZIP/fflate), image-splitter(ZIP) |
| 转换（非 PDF） | ✅ 完成（13，另 3 个已在首轮完成） | color-converter, css-unit-converter, csv-json, html-markdown(turndown), html-to-image(html-to-image), json-xml(fast-xml-parser), json-yaml(yaml), md-to-html, number-base(BigInt), roman-numerals, svg-to-png, toml-json(smol-toml), unit-converter |
| 压缩 | ✅ 完成（3） | gzip-tool(fflate 异步/多格式自动识别), image-compressor(Web Worker + OffscreenCanvas), pdf-compressor(无损重写 / 栅格化 JPEG；pdf.js + @cantoo/pdf-lib) |
| 办公 | ✅ 完成（11） | excel-viewer, excel-to-csv, excel-to-json, csv-to-excel, excel-merge（exceljs，按需加载；不支持旧版 .xls）, excel-to-pdf（Canvas 排版→图片页，文字不可选）, word-viewer, word-to-text, word-to-markdown（mammoth+turndown）, word-creator（Markdown→docx）, pptx-creator（Markdown 大纲→pptxgenjs） |
| PDF（转换类，分类 pdf） | ✅ 26 | pdf-rotate, pdf-metadata, pdf-protect, pdf-unlock, pdf-remove-annotations, pdf-page-numbers, pdf-crop, pdf-scale-pages, pdf-flatten, pdf-overlay, pdf-watermark, image-to-pdf, text-to-pdf, html-to-pdf, word-to-pdf, pdf-creator, pdf-redact, pdf-auto-redact（真脱敏：栅格化，测试验证文字不可提取）, pdf-compare, pdf-editor, pdf-to-excel, pdf-to-image, pdf-to-markdown, pdf-to-ppt, pdf-to-text, pdf-to-word |
| 合计 / 跳过 | ✅ 117/117 纯 JS 工具已实现并注册；⏭️ 7 个 WASM 工具按要求跳过 | pdf-merge, pdf-split, pdf-remove-pages, pdf-remove-blank-pages, image-ocr, pdf-ocr, sqlite-viewer |

---

## 1. thirdparty 分析摘要

### 1.1 是什么
`thirdparty/BrainCoder` 是一个“隐私优先”的浏览器工具箱：单个 Next.js 应用内集成 **124 个工具**（README 称 123+），所有处理都在浏览器本地完成，文件不上传。线上地址 braincoder.sardar.dev，部署在 Vercel。

### 1.2 工具清单（按分类，已逐条核对 `src/lib/tools.ts` 注册表，共 124 个）
| 分类 | 数量 | 工具 slug |
|---|---|---|
| Compress | 3 | gzip-tool, image-compressor, pdf-compressor |
| Convert | 48 | case-converter, color-converter, css-unit-converter, csv-json, html-markdown, html-to-image, html-to-pdf, image-ocr, image-resizer, image-to-pdf, json-xml, json-yaml, md-to-html, number-base, pdf-auto-redact, pdf-compare, pdf-creator, pdf-crop, pdf-editor, pdf-flatten, pdf-merge, pdf-metadata, pdf-ocr, pdf-overlay, pdf-page-numbers, pdf-protect, pdf-redact, pdf-remove-annotations, pdf-remove-blank-pages, pdf-remove-pages, pdf-rotate, pdf-scale-pages, pdf-split, pdf-to-excel, pdf-to-image, pdf-to-markdown, pdf-to-ppt, pdf-to-text, pdf-to-word, pdf-unlock, pdf-watermark, roman-numerals, svg-to-png, text-to-pdf, timestamp-converter, toml-json, unit-converter, word-to-pdf |
| Developer | 26 | bitwise-calculator, checksum-calculator, chmod-calculator, cidr-calculator, cron-parser, css-cursor, css-formatter, csv-formatter, csv-to-sql, html-formatter, html-minifier, http-status, ipv4-converter, javascript-formatter, json-formatter, json-to-typescript, json-viewer, jwt-decoder, markdown-preview, px-rem, regex-tester, sql-formatter, sqlite-viewer, svg-formatter, url-parser, xml-formatter |
| Encode & Decode | 11 | aes-encryption, base32, base64, binary-text, hash-generator, html-entities, image-base64, morse-code, rot13, url-encoder, utf8-converter |
| Office | 11 | csv-to-excel, excel-merge, excel-to-csv, excel-to-json, excel-to-pdf, excel-viewer, pptx-creator, word-creator, word-to-markdown, word-to-text, word-viewer |
| Text Tools | 10 | diff-checker, notepad, slug-generator, text-cleaner, text-lines, text-repeater, text-size-calculator, unicode-styles, upside-down-text, word-counter |
| Media & Design | 8 | border-radius-generator, box-shadow-generator, cubic-bezier-editor, gradient-generator, image-editor, image-filters, image-format-converter, image-splitter |
| Generate | 7 | coin-dice-roller, lorem-ipsum, password-generator, qr-code-generator, random-name-picker, random-number-generator, uuid-generator |

> 更正：上一版写“127 个”是误把类型定义中的 `slug:` 也计入；README 宣称 123+，注册表实际为 124 个。上一版 Text Tools 行误列 case-converter（实际属 Convert）。

### 1.3 技术栈与构建
- **Next.js 16**（App Router + Turbopack）、React 19、TypeScript 5、Tailwind CSS 4（`@tailwindcss/postcss`）、lucide-react 图标、ESLint 9。
- 包管理器 npm（`package-lock.json`）。
- 关键三方库：pdf-lib（写 PDF）、pdfjs-dist（读/渲染 PDF）、@pdfsmaller/pdf-encrypt/decrypt（PDF 加解密）、tesseract.js（OCR，语言包与 wasm 自托管于 `public/ocr`，含 chi_sim 等 12 种语言）、sql.js（SQLite，`public/sql-wasm.wasm`）、mammoth（docx→HTML）、turndown（HTML→Markdown）、marked（Markdown）、fflate（zip/gzip，并用于**手写 xlsx/docx/pptx 的 OOXML 打包**，见 `lib/spreadsheet.ts`、`lib/docx.ts`、`lib/pptx.ts`）、html2canvas、qrcode、prettier（代码格式化）、sql-formatter、js-yaml、smol-toml、cron-parser。
- **Rust → WASM 核心**（`crates/core`，基于 zpdf-*、wasm-bindgen）：导出 `merge_pdfs`、`extract_pdfs`、`redact_pdfs`（真正从内容流删除文字/图片）、`find_matches`、`split_words`。`src/lib/wasm-core.ts` 懒加载 `/wasm/core_bg.wasm`，失败时**透明回退**到 pdf-lib/pdf.js 的 JS 实现。
- 测试：`e2e/*.mjs`（playwright-core 浏览器脚本）、`audit/check-*.mjs`（工具审计脚本）、`test:core`（WASM 与 JS 参考实现等价校验）。

### 1.4 目录结构
```
BrainCoder/
├─ src/app/            # 路由：/、/tools/[slug]、/categories/[slug]、/guides、/guides/[slug]、/use/[slug]、/verify、sitemap/robots/OG 图
├─ src/components/     # 外壳组件：SiteHeader、ToolsExplorer（搜索/筛选）、ToolCard、ToolMount、FavoriteButton、RecentTools、ToolFaq、NetworkAudit、PwaRegister、ui/index.tsx（Button/Field/CopyButton/SliderField 等少量自研 UI）
├─ src/features/<slug>/ # 每个工具一个目录：主组件 + 纯逻辑 .ts（如 cron.ts、diff.ts、regex-engine.ts）+ 可选 *.worker.ts
├─ src/lib/            # tools.ts（注册表）、tool-content.ts（6.6k 行 SEO 长文/FAQ/HowTo）、guides.ts（2.3k 行文章）、seo.ts、userState.ts、wasm-core.ts、docx/pptx/spreadsheet、download.ts
├─ crates/core/        # Rust WASM
├─ public/             # wasm、ocr 资源、sw.js、manifest
└─ e2e/ audit/ articles/ launch/
```

### 1.5 路由、状态、数据流、UI 模式
- **路由**：`/tools/[slug]` 通过 `generateStaticParams` 静态预渲染全部工具页；页面 = 服务端渲染的 SEO 外壳（标题、特性、HowTo、FAQ、相关工具、JSON-LD）+ `ToolMount`，后者用 `next/dynamic` 的 `slug → import()` 映射表按需加载工具组件（**代码分割**，每个工具独立 chunk）。
- **状态**：无全局状态库。工具内部用 React 本地 state；跨工具的“最近使用 / 收藏 / 匿名 userId”存 `localStorage`（键 `bc_recent`、`bc_favorites`、`bc_user_id`），通过自定义订阅 + `useSyncExternalStore` 实现同标签页响应。Notepad 自动保存到 localStorage。
- **数据流**：用户选择/拖拽文件 → `File.arrayBuffer()` → 主线程或 Web Worker（PDF 压缩、图片压缩、pdf.js、tesseract）处理 → 生成 `Blob` → `URL.createObjectURL` 触发下载（`lib/download.ts`）。文本类工具为“输入 → 纯函数 → 输出 + 复制按钮”的实时变换。
- **UI 模式**：卡片网格首页 + 搜索/分类筛选；工具页统一布局（标题区、工具区、说明区）；每个工具有 lucide 图标与渐变色；复制按钮、滑块、文件拖放区等少量通用组件。
- **安全**：严格 CSP（`next.config.ts`）、HTML 预览类工具自带 sanitize、`/verify` 页与 NetworkAudit 组件用于向用户证明“无网络上传”。

### 1.6 后端依赖
- **没有业务后端**。唯一服务器相关：Vercel Analytics / Speed Insights（第三方统计）、Next.js SSR/SSG 用于 SEO 与 OG 图片生成、HTTP 安全头。代码里的 `fetch()` 仅用于读取 blob/data URL。
- 结论：所有工具在新实现中都可纯前端完成；SEO/OG/统计属于“站点运营”功能，按需取舍。

### 1.7 关键设计决策（值得借鉴的思想，而非代码）
1. 注册表驱动：一个元数据数组驱动首页、分类、路由、搜索。
2. 每工具一个 feature 目录 + 懒加载，首屏只加载外壳。
3. 纯逻辑与 UI 分离（`*.ts` 可单测）。
4. 重计算放 Worker，大资源（wasm、OCR 语言包）自托管、按需加载。
5. 性能增强（WASM）可选、必须有 JS 回退。
6. “输出不大于输入”等防御性产品规则（压缩类）。

---

## 2. 目标技术选型与理由

| 选择 | 理由 |
|---|---|
| **Vue 3（Composition API, `<script setup>`）** | 需求指定 |
| **Vite 6+** | Vue 官方推荐、shadcn-vue 官方支持、极快 HMR、原生支持 `?worker`、`?url` 导入 wasm |
| **TypeScript（strict）** | 与参考项目一致，复杂文件处理需要类型保障 |
| **Tailwind CSS v4（`@tailwindcss/vite`）** | shadcn-vue 当前版本基于 Tailwind v4 + CSS 变量主题 |
| **shadcn-vue（基于 Reka UI）** | 需求指定；组件以源码方式生成到 `src/components/ui`，可自由修改，无运行时锁定 |
| **lucide-vue-next** | shadcn-vue 默认图标库，与参考项目图标语义一致 |
| **vue-router 4（history 模式）** | `/`、`/category/:slug`、`/tools/:slug`；路由级懒加载天然实现每工具独立 chunk |
| **Pinia** | 仅用于全局轻量状态：收藏、最近使用、主题、偏好；配合 `@vueuse/core` 的 `useLocalStorage` 持久化。相比参考项目的手写订阅，更简洁且 DevTools 可观察 |
| **@vueuse/core** | 剪贴板、拖放、localStorage、暗色模式、防抖等组合式工具 |
| **vue-sonner（shadcn-vue 的 Toast）** | 复制成功/错误提示 |
| **Vitest + @vue/test-utils** | 纯逻辑模块单测；**Playwright**（可选，M5）做冒烟 E2E |
| **yarn（建议 Yarn 1 classic 或 Berry 的 `nodeLinker: node-modules`）** | 需求指定；见开放问题 Q1 |

功能库（自行选型直接从 npm 安装，**不来自 thirdparty**）：pdf-lib、pdfjs-dist、@pdfsmaller/pdf-encrypt|decrypt（或同类）、tesseract.js、sql.js、mammoth、turndown、marked + DOMPurify、fflate、SheetJS/`exceljs`（替代参考项目手写 OOXML，见风险）、docx（npm `docx` 生成 Word）、pptxgenjs、qrcode、prettier/standalone、sql-formatter、js-yaml、smol-toml、cron-parser、html-to-image（或 html2canvas）、diff（jsdiff）。

不采用：Nuxt/SSR（无后端要求，纯 SPA 足够；SEO 见 Q3）、Rust/WASM 核心（构建链复杂，JS 实现已可覆盖，见映射表）。

---

## 3. 目标目录结构（项目根 `/Volumes/my/github/SimpleTools`）

```
SimpleTools/
├─ build.sh                    # dev|build 入口（第 5 节）
├─ package.json  yarn.lock  .yarnrc.yml(若用 Berry)  .nvmrc
├─ index.html  vite.config.ts  tsconfig*.json  components.json(shadcn-vue)
├─ public/
│  ├─ favicon.svg
│  ├─ ocr/                     # tesseract worker/core/语言包（从 npm 包复制或首次按需下载，见 Q5）
│  └─ wasm/sql-wasm.wasm       # 由 sql.js 包提供，构建时复制
├─ plan/                       # 本计划
├─ thirdparty/                 # 仅参考，不参与构建（tsconfig/vite 均排除）
└─ src/
   ├─ main.ts  App.vue
   ├─ router/index.ts          # 由 registry 生成路由
   ├─ stores/                  # Pinia：favorites.ts、recent.ts、settings.ts
   ├─ styles/globals.css       # Tailwind v4 + shadcn 主题变量（亮/暗）
   ├─ components/
   │  ├─ ui/                   # shadcn-vue 生成组件（button、card、input、textarea、tabs、select、slider、switch、dialog、dropdown-menu、command、badge、tooltip、sonner、separator、scroll-area、progress、table…）
   │  ├─ layout/               # AppHeader、AppSidebar、ThemeToggle、CommandPalette(⌘K 搜索)
   │  └─ shared/               # ToolLayout、ToolCard、FileDropzone、CopyButton、DownloadButton、CodeEditor(textarea 起步)、SplitPane、PdfPagePicker、ErrorAlert、ProgressOverlay
   ├─ composables/             # useFileReader、useDownload、useClipboard、useWorker、usePdfjs、useObjectUrl(自动 revoke)
   ├─ lib/                     # 跨工具纯函数：download、format(bytes)、pdf/(加载器、页码解析)、office/(xlsx/docx 封装)、sanitize
   ├─ workers/                 # 共享 worker：pdf-compress.worker.ts、image-compress.worker.ts、ocr 封装
   ├─ registry/
   │  ├─ types.ts              # ToolMeta: slug,name,description,category,icon,keywords,component:()=>import(),status
   │  ├─ categories.ts
   │  └─ tools/<category>.ts   # 按分类拆分的元数据
   ├─ tools/<slug>/            # 每工具一个目录
   │  ├─ index.vue             # UI
   │  ├─ logic.ts              # 纯逻辑（可单测）
   │  └─ logic.test.ts
   ├─ pages/                   # HomePage、CategoryPage、ToolPage、FavoritesPage、NotFound
   └─ i18n/                    # 可选：zh-CN/en（见 Q2）
```

约束：ESLint `no-restricted-imports` 禁止任何路径包含 `thirdparty`；`tsconfig.include` 只含 `src`；Vite `server.fs.deny` 加 `thirdparty`。

---

## 4. 架构设计

### 4.1 注册表驱动
- `registry` 是唯一数据源：首页网格、分类页、侧栏、⌘K 搜索、路由表都由它生成。
- `component: () => import('@/tools/json-formatter/index.vue')`，路由 `/tools/:slug` 中 `ToolPage` 用 `defineAsyncComponent` 加载，带 loading/错误骨架。
- `status: 'stable' | 'beta' | 'planned'`，未实现工具不出现在列表（或显示“即将推出”，见 Q4）。

### 4.2 路由
| 路径 | 页面 |
|---|---|
| `/` | 首页：搜索框 + 分类 Tabs + 收藏/最近 + 工具卡片网格 |
| `/category/:slug` | 分类列表 |
| `/tools/:slug` | ToolLayout（标题、描述、收藏按钮、工具组件、简短使用说明） |
| `/favorites` | 收藏 |
| `/:pathMatch(.*)*` | 404 |
`router.afterEach` 设置 `document.title` 并写入“最近使用”。

### 4.3 状态
- Pinia `favorites`、`recent`（上限 20）、`settings`（主题、语言），`useLocalStorage` 持久化，键前缀 `st_`，读取时做类型校验，存储不可用时降级为内存。
- 工具内部状态留在组件本地（`ref/reactive`）；Notepad 等需要持久化的单独用 `useLocalStorage`。
- 不保存用户文件内容到持久存储。

### 4.4 数据流 / 文件处理规范
1. `FileDropzone` 接收文件，校验类型与大小上限（如 PDF 100 MiB，可配置）。
2. `file.arrayBuffer()` → 轻量操作主线程，重操作经 `useWorker`（Vite `new Worker(new URL(...), {type:'module'})`）并支持取消。
3. 结果 `Blob` → `useDownload`（createObjectURL + 自动 revoke）。
4. 错误统一 `ErrorAlert` + toast；长任务显示 `Progress`。
5. 大库（pdfjs、tesseract、sql.js、mammoth、prettier）一律动态 `import()`，不进入首屏包。

### 4.5 UI 模式
- shadcn-vue 组件 + Tailwind；亮/暗主题（`useColorMode`）。
- 文本类工具统一“左输入 / 右输出”双栏（移动端上下堆叠），带示例按钮、清空、复制、下载。
- 文件类工具统一“拖放 → 选项面板 → 执行 → 结果预览 + 下载”。
- 可访问性：所有控件有 label，键盘可达（Reka UI 自带）。

### 4.6 安全
- Markdown/HTML 预览一律 DOMPurify 净化后渲染到隔离容器（或 sandbox iframe）。
- 生产部署建议配置 CSP（静态托管层设置，非本仓库职责，文档说明即可）。
- 不引入任何统计脚本（参考项目的 Vercel Analytics 不迁移）。

---

## 5. build.sh 设计（根目录，bash）

用法：`./build.sh dev|build|preview|lint|test [额外参数透传]`（D6 更新：`preview` 运行 `vite preview`，无 dist 时先 build；`lint` 运行 eslint + vue-tsc；`test` 运行 vitest run）

行为：
1. `set -euo pipefail`；`cd "$(dirname "$0")"` 保证在项目根运行。
2. **参数检查**：无参数或未知子命令 → 打印 usage（含 `dev`、`build`、`-h|--help`）到 stderr，退出码 1；`-h/--help` 打印 usage 退出 0。
3. **环境检查**：`command -v node` 与 `command -v yarn`，缺失时给出安装提示（如 `corepack enable`）并退出 1；检查 Node 主版本 ≥ 20（Vite 6/7 要求），不满足退出 1。
4. **依赖安装检查**：满足任一条件即执行 `yarn install`（CI 环境 `CI=true` 时用 `--frozen-lockfile` / Berry 的 `--immutable`）：
   - `node_modules` 不存在；
   - `package.json` 或 `yarn.lock` 比 `node_modules/.yarn-state.yml` / `node_modules/.yarn-integrity` 标记文件新（或保存的 lock 哈希不同，哈希存 `node_modules/.st-lock-hash`）。
   否则跳过并提示“依赖已是最新”。
5. `dev`：`exec yarn vite --host "${HOST:-127.0.0.1}" --port "${PORT:-5173}" "$@"`（`exec` 使 Ctrl-C 信号直达）。
6. `build`：`yarn vue-tsc -b`（类型检查）→ `yarn vite build "$@"` → 输出 `dist/` 路径与体积摘要；任一步失败以非零码退出并打印“构建失败”。
7. 彩色日志函数 `info/warn/error`（非 TTY 时关闭颜色）。
8. 对应 `package.json` scripts：`dev`、`build`、`preview`、`test`、`lint`，build.sh 调用 scripts 保持单一来源。
（可选扩展，不在本次范围：`preview`、`test`、`clean` 子命令，见 Q7。）

---

## 6. 功能映射表（thirdparty → 新实现）

图例：✅ 纯前端直接实现；⚠️ 可实现但质量/难度有风险；⏸ 建议后期或缩减范围；❌ 不迁移。“实现思路”为独立重写方案，不复制原代码。

### 6.1 站点外壳
| thirdparty | 新实现 | 说明 |
|---|---|---|
| `lib/tools.ts` 注册表 | `src/registry/*` | 重新编写元数据（中文名/描述，见 Q2） |
| ToolsExplorer / ToolCard / SiteHeader | HomePage + ToolCard + AppHeader + CommandPalette（shadcn `Command`） | ✅ |
| ToolMount（next/dynamic 映射） | vue-router 懒加载 + `defineAsyncComponent` | ✅ |
| userState.ts（recent/favorites） | Pinia + useLocalStorage | ✅；不迁移匿名 userId（无用途） |
| ui/index.tsx | shadcn-vue 组件 + shared 组件 | ✅ |
| tool-content.ts / guides.ts / seo.ts / OG 图 / sitemap / `/use` `/guides` | 每工具简短说明（registry 内 `howTo` 字段） | ❌ 长篇 SEO 内容与指南文章不迁移（SPA 无 SSR，见 Q3） |
| Analytics / SpeedInsights | — | ❌ 不迁移 |
| PwaRegister + sw.js | `vite-plugin-pwa`（M5 可选） | ⏸ |
| `/verify`、NetworkAudit | 可选“隐私说明”页 | ⏸ |
| Rust WASM core | 不迁移，用 pdf-lib/pdf.js JS 实现 | ❌（见 6.3） |

### 6.2 文本 / 编码 / 生成 / 开发者（低风险，纯函数）
| 工具 | 新实现思路 | 级别 |
|---|---|---|
| json-formatter / json-viewer | `JSON.parse` + 自写格式化/压缩；错误定位行列；viewer 用递归树组件（可折叠） | ✅ |
| url-encoder / url-parser | `encodeURIComponent`/`URL` API | ✅ |
| base64 / base32 / image-base64 / binary-text / utf8-converter / rot13 / morse-code / html-entities | 自写编码函数，`TextEncoder`；URL-safe 变体 | ✅ |
| hash-generator / checksum-calculator | `crypto.subtle.digest`（SHA-1/256/384/512）+ HMAC；MD5/CRC32 自写或 `hash-wasm` | ✅ |
| aes-encryption | WebCrypto AES-GCM + PBKDF2 | ✅ |
| password / uuid / random-number / name-picker / coin-dice / lorem-ipsum | `crypto.getRandomValues`、`crypto.randomUUID` | ✅ |
| qr-code-generator | npm `qrcode`，PNG/SVG 下载 | ✅ |
| regex-tester | 原生 RegExp，高亮匹配与分组，超时保护（Worker） | ✅ |
| timestamp-converter / cron-parser | `Intl.DateTimeFormat`；`cron-parser` | ✅ |
| diff-checker | `diff`（jsdiff）行/词级 | ✅ |
| case-converter / slug / word-counter / text-lines / text-cleaner / text-repeater / unicode-styles / upside-down / text-size-calculator / notepad | 纯字符串函数；notepad 用 localStorage 自动保存 | ✅ |
| sql / xml / html / css / js / svg / csv-formatter、html-minifier | `sql-formatter`；`prettier/standalone` + 插件（懒加载）；XML 自写缩进器或 DOMParser | ✅ |
| json-yaml / toml-json / json-xml / csv-json / csv-to-sql / json-to-typescript | js-yaml、smol-toml、DOMParser、PapaParse；TS 类型推断自写 | ✅ |
| markdown-preview / md-to-html / html-markdown | marked + DOMPurify；turndown | ✅ |
| jwt-decoder | base64url 解码 + 过期时间展示（不验签或可选 HMAC 验签） | ✅ |
| number-base / bitwise / roman / chmod / px-rem / css-unit / unit-converter / ipv4 / cidr / http-status | BigInt、静态表 | ✅ |
| color-converter / box-shadow / border-radius / gradient / cubic-bezier / css-cursor | 交互式预览 + 生成 CSS；Bézier 用 SVG 拖拽 | ✅ |
| gzip-tool | fflate 或原生 `CompressionStream` | ✅ |
| sqlite-viewer | sql.js（wasm 由包提供，`?url` 导入） | ✅ |

### 6.3 图片 / PDF / Office（中高风险）
| 工具 | 新实现思路 | 级别 |
|---|---|---|
| image-resizer / format-converter / filters / splitter / svg-to-png | Canvas / OffscreenCanvas，`createImageBitmap`，`canvas.filter` | ✅ |
| image-compressor | Worker + OffscreenCanvas `convertToBlob(quality)`；“结果不大于原图则返回原图”规则 | ✅（AVIF 编码受浏览器限制 ⚠️） |
| image-editor | 裁剪/旋转/翻转/调色基础功能 | ⚠️ 范围需界定 |
| image-to-pdf / text-to-pdf / pdf-creator | pdf-lib；CJK 文本需嵌入字体（@pdf-lib/fontkit + 子集字体） | ✅ / ⚠️(中文字体体积) |
| pdf-merge / split / rotate / remove-pages / remove-blank-pages / page-numbers / watermark / crop / scale-pages / metadata / flatten / remove-annotations / overlay | pdf-lib 页面复制与修改；空白页判定用 pdf.js 渲染采样 | ✅ |
| pdf-protect / pdf-unlock | `@pdfsmaller/pdf-encrypt`/`decrypt`（或同类库）；unlock 仅限已知密码 | ⚠️ 依赖库成熟度 |
| pdf-to-image / pdf-to-text / pdf-compare | pdf.js 渲染与 `getTextContent`；compare 做文本 diff + 像素差异 | ✅ |
| pdf-to-markdown / pdf-to-word / pdf-to-excel / pdf-to-ppt | pdf.js 提取文本与坐标 → 启发式段落/表格重建 → `docx` / SheetJS / pptxgenjs 输出 | ⚠️ 保真度有限，标注 beta |
| pdf-compressor | Worker 中用 pdf-lib 遍历图片 XObject，重新编码 JPEG；无变小则返回原件 | ⚠️ 复杂，排后 |
| pdf-redact（手动框选）/ pdf-auto-redact | 原项目依赖 Rust 真删除内容流。纯 JS 方案：**栅格化被涂黑页**（pdf.js 渲染 → 画黑框 → 以图片重建该页），保证信息真正消失，代价是该页文字不可选 | ⚠️ 改为栅格化方案（见 Q6） |
| pdf-ocr / image-ocr | tesseract.js，语言包自托管或首次下载；默认 eng + chi_sim | ⚠️ 资源体积大 |
| pdf-editor（注释、文字、形状） | pdf.js 渲染 + 叠加层编辑 + pdf-lib 导出 | ⏸ 最复杂，最后阶段且缩减为“添加文字/矩形/图片/签名” |
| html-to-pdf / html-to-image | html-to-image（DOM→Canvas）+ pdf-lib；或 `window.print()` | ⚠️ 外部资源/跨域图片受限 |
| word-viewer / word-to-text / word-to-markdown / word-to-pdf | mammoth → HTML → 文本/turndown/渲染后栅格进 PDF | ✅ / ⚠️(to-pdf 保真) |
| word-creator | npm `docx` 生成 | ✅ |
| excel-viewer / excel-to-csv / excel-to-json / csv-to-excel / excel-merge / excel-to-pdf | SheetJS（社区版）读写；to-pdf 用表格渲染 + pdf-lib | ✅ |
| pptx-creator | pptxgenjs | ✅ |

---

## 7. 分阶段里程碑与验收标准

### M0 脚手架（约 1 天）
- 内容：Vite + Vue3 + TS + Tailwind v4 + shadcn-vue 初始化、router、Pinia、ESLint/Prettier、Vitest、`build.sh`、`thirdparty` 隔离规则。
- 验收：
  - `./build.sh dev` 首次运行自动 `yarn install` 并启动，浏览器可访问；再次运行跳过安装。
  - `./build.sh build` 产出 `dist/`，类型检查失败时退出码非 0。
  - `./build.sh`、`./build.sh foo` 打印 usage 且退出码 1。
  - `rg thirdparty src` 无任何引用；lint 规则能拦截此类 import。

### M1 站点外壳（约 2 天）
- 内容：注册表、首页网格、分类、⌘K 搜索、ToolLayout、收藏/最近、暗色模式、404、shared 组件（Dropzone/Copy/Download/ErrorAlert）。
- 验收：注册 3 个示例工具可从首页、搜索、分类到达；刷新后收藏/最近保留；Lighthouse 首页性能 ≥ 90；首屏 JS（gzip）≤ 150 KB；每工具独立 chunk。

### M2 文本/编码/生成/开发者工具（约 5–7 天，~60 个）
- 内容：6.2 表全部。
- 验收：每个工具的 `logic.ts` 有单测（含边界与错误输入），覆盖率 ≥ 80%；UI 具备示例、清空、复制；非法输入显示可读错误而不崩溃；断网下可正常使用。

### M3 图片与基础 PDF（约 5–7 天）
- 内容：图片类全部；PDF merge/split/rotate/remove-pages/page-numbers/watermark/crop/scale/metadata/flatten/remove-annotations/overlay/to-image/to-text/image-to-pdf/text-to-pdf/compare。
- 验收：使用 fixtures（多页、含图、含中文、加密）测试；输出能被 pdf.js 与系统预览打开；100 页 PDF 合并在主流笔记本 < 5 s 且 UI 不冻结；结果下载文件名合理。

### M4 Office 与高级 PDF（约 7–10 天）
- 内容：Word/Excel/PPT 全部；pdf-protect/unlock、OCR、redact（栅格化）、pdf-to-word/excel/markdown/ppt（beta）、html-to-pdf/image、pdf-compressor。
- 验收：redact 后的 PDF 用文本提取查不到被遮盖内容；OCR 对样例中英文图片识别正确率可接受且资源懒加载；压缩结果永不大于原件；beta 工具有明确标识。

### M5 打磨（约 3–5 天）
- 内容：pdf-editor（精简版）、PWA 离线、i18n、Playwright 冒烟、可访问性检查、性能预算。
- 验收：Playwright 冒烟覆盖每类至少 2 个工具；axe 无严重问题；离线可打开已访问工具（若启用 PWA）。

---

## 8. 风险

1. **范围大**：124 个工具，完整复刻工作量约 4–6 人周；建议按里程碑分批交付并允许裁剪。
2. **PDF 高级功能保真度**：PDF→Word/Excel/PPT、PDF 压缩、编辑器在纯 JS 下难度高，质量可能低于参考项目。
3. **真正的脱敏（redact）**：不使用 Rust WASM 时，内容流级删除很难做对，计划改为栅格化方案。
4. **资源体积**：tesseract 语言包（chi_sim 约数 MB）、pdf.js、CJK 字体、prettier 插件会显著增大部署体积——全部懒加载，必要时首次使用时从 CDN 下载（但与“完全离线/隐私”诉求冲突，见 Q5）。
5. **SheetJS 许可/分发**：社区版需从其官方 CDN tarball 安装（npm 上旧版本有漏洞），yarn 可直接用 tarball URL；或改用 exceljs。
6. **浏览器兼容**：OffscreenCanvas、AVIF 编码、`CompressionStream` 在旧版 Safari 支持不一，需要特性检测与降级。
7. **许可证**：参考项目为 MIT，仅参考思路，不复制代码；若借鉴具体算法/数据表（如 HTTP 状态码说明文案），应自行编写或注明出处。
8. **Yarn 版本差异**：Yarn 1 与 Berry 的 install 检查/锁文件参数不同，build.sh 需适配。

## 9. 开放问题（需用户确认）

- **Q1** Yarn 版本：Yarn 1 classic 还是 Yarn 4（Berry，使用 `nodeLinker: node-modules`）？Node 最低版本是否定为 20 LTS？
- **Q2** 界面语言：仅中文、仅英文，还是中英双语（vue-i18n）？工具名称/描述是否需中文化？
- **Q3** SEO：是否需要每个工具独立的 SEO 页面/预渲染？若需要，可加 `vite-ssg` 静态预渲染；否则纯 SPA。参考项目的长篇说明/FAQ/指南文章是否需要？
- **Q4** 工具范围与优先级：是否全部 127 个都要做？能否先交付 M0–M3，PDF 编辑器、PDF→Office、PDF 压缩视情况推迟或放弃？未实现工具是否在 UI 中显示“即将推出”？
- **Q5** 离线与资源：OCR 语言包、CJK 字体是否必须随站点自托管（体积大但完全离线），还是允许首次使用时从 CDN 下载？OCR 需要哪些语言？
- **Q6** PDF 脱敏采用“栅格化被遮盖页面”的纯 JS 方案是否可接受？或是否愿意后期引入独立重写的 WASM 模块？
- **Q7** build.sh 是否需要额外子命令（`preview`、`test`、`lint`、`clean`）？`dev` 默认端口/是否对局域网开放（`--host 0.0.0.0`）？
- **Q8** 部署目标（静态托管/Nginx/GitHub Pages 子路径）？这决定 Vite `base` 与 router history 模式（子路径或无服务器回退需改 hash 模式）。
- **Q9** 是否需要 PWA 离线安装、统计埋点（参考项目有 Vercel Analytics，计划默认不加）？
- **Q10** 项目品牌：名称沿用 “SimpleTools”？是否需要 Logo/主题色指定？
