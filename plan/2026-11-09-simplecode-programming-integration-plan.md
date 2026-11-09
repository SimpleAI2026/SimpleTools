# SimpleCode 全语言集成与分端裁剪实施计划

日期：2026-11-09  
源项目：`/Volumes/my/github/SimpleCode`（只读）  
目标项目：`/Volumes/my/github/SimpleTools`

## 1. 本次修订与目标

本计划替代此前“一个代码练习场卡片、内部切换语言、所有端都排除大运行时”的方案，按以下产品边界实施：

1. “编程”分类按语言展示独立工具，不再使用统一的 `code-playground` 卡片。
2. 每个工具从首页直接进入对应语言的 Monaco 编辑器、运行/停止、终端和快速入门，不显示内部语言侧栏；按最新需求移除 LeetCode 题库及其逻辑和数据。
3. 网站支持 SimpleCode 的全部语言和能力，包括大型运行时；所有重资源保持本地、同源、按语言和按需加载。
4. Chrome 扩展与 VS Code 扩展只支持 JS/TS、SQLite、Lua、Shell、Java；网站专用语言和对应 WASM/VM 资源不得进入扩展产物。
5. `AGENTS.md` 固化上述规则，后续新增语言或调整构建时必须同步遵守。
6. 保持 SimpleTools 的页面风格、八语 UI、主题、收藏、最近使用、移动端适配、离线能力及 100% 测试通过率。

源仓库依据仍为当前工作树；HEAD `258a0e4f8ae0109694d2fb58a1f8baa316d30ba9` 仅用于溯源，不修改源仓库任何文件。

## 2. 信息架构与语言映射

### 2.1 独立工具

保留 `programming` 分类，与 `developer` 并列。注册 15 个工具：

| 工具 slug | 运行时 id | 默认语言/方言 | 网站 | 扩展 |
| --- | --- | --- | --- | --- |
| `code-python` | `python` | Python | 是 | 否 |
| `code-ruby` | `ruby` | Ruby | 是 | 否 |
| `code-javascript` | `quickjs` | JavaScript | 是 | 是 |
| `code-typescript` | `quickjs` | TypeScript | 是 | 是 |
| `code-sqlite` | `sqlite` | SQL | 是 | 是 |
| `code-c` | `clang` | C | 是 | 否 |
| `code-cpp` | `clangpp` | C++ | 是 | 否 |
| `code-php` | `php-cgi` | PHP | 是 | 否 |
| `code-lua` | `lua` | Lua | 是 | 是 |
| `code-go` | `go` | Go | 是 | 否 |
| `code-shell` | `shell` | Shell | 是 | 是 |
| `code-rust` | `rust` | Rust | 是 | 否 |
| `code-java` | `java` | Java | 是 | 是 |
| `code-linux` | `linux` | Linux Shell | 是 | 否 |
| `code-deeplearning` | `numpy` | Python / NumPy | 是 | 否 |

- JavaScript 与 TypeScript 是两张卡片、两个 URL、两份独立草稿，但共享 QuickJS；TypeScript 仍只做 Sucrase 类型剥离。
- DeepLearning 对应 NumPy 与深度学习两本教程；Linux 是 v86 客户机，不等同于轻量 `wasi-sh`。
- 所有卡片复用同一个懒加载工作台组件，以 slug 显式映射运行时和 JS/TS 方言，不依赖卡片内部选择器。
- 删除旧 `/tools/code-playground` 注册与入口；不为旧 slug 保留一个会与“逐语言”规则冲突的统一工作台。
- 首页、分类筛选、顶部搜索、收藏和最近使用均按独立工具工作。

### 2.2 工具内布局

- 移除 `LanguageSidebar`、手机语言下拉和语言切换快捷键；主区域直接占满沉浸式内容区。
- 保留当前右侧工作流：顶部编辑器工具栏、运行/停止、快速入门、缓存管理，中部编辑器，底部终端。
- 快速入门直接打开当前语言的书；不允许从教程切换到另一运行时。
- 语言标题、文件名、运行状态和缓存信息对应当前工具；手机端工具栏可换行，主要触控目标至少 44px，无页面级横向滚动。
- 工作台底部或关于面板保留与 SimpleTools 现有工具一致的三步使用指引。

## 3. 网站全语言与懒加载

### 3.1 运行能力

网站同步并接入 SimpleCode 当前全部运行时：

- WASI：Python、Ruby、QuickJS、SQLite、C、C++、PHP、Lua、Go、Shell。
- 专用运行器：Rust（weblings 编译 + WASI 执行）、Java（TeaVM）、Linux（v86）、DeepLearning（Pyodide + NumPy）。
- 保留 stdin、EOF、Ctrl+C、停止、编译/链接/运行阶段、退出码、错误输出和缓存清理。
- 恢复全部语言的可运行教程；文档运行入口只暴露当前端和当前语言实际支持的能力。

### 3.2 资源策略

网站允许完整资源包，但必须满足：

1. 所有 WASM、FS、sysroot、TeaVM、Pyodide、v86 文件均从本地 `public/offline/code/` 提供，不用 CDN、远程编译或运行时下载第三方站点绕过。
2. 首页只注册轻量元数据，不导入 Monaco、xterm、运行器或 WASM；进入具体语言后才加载共享工作台及该语言模块。
3. manifest 加载不等于下载运行时；只有进入对应工具并初始化/运行时才获取该语言资产。
4. C/C++ 共享 clang 资源，JS/TS 共享 QuickJS，DeepLearning 的 NumPy 与深度学习共享 Pyodide，避免重复复制。
5. 每个资源记录大小和 SHA-256；缺失文件必须 404 + `no-store`，不得由 SPA 回退为 HTML。
6. 大文件只在网站产物出现；断网时，已随站点部署或已缓存的资源仍可运行。

### 3.3 构建时数据

- 同步全部 15 本中英教程：Python、JavaScript、Ruby、SQL、C、C++、PHP、Lua、Go、Shell、Linux、Rust、Java、NumPy、深度学习。
- 不同步或打包 LeetCode 题目、题解、搜索、筛选和进度数据。
- `virtual:docs-index` 继续按章节动态 import；不得把 1042 个章节正文全部打进首屏或工具初始 chunk。
- 教程围栏、stdin、expect、norun、smoke、退出码和草稿备份/撤销语义不变。

## 4. 扩展分端裁剪

### 4.1 能力白名单

Chrome/VS Code 仅注册以下工具：JavaScript、TypeScript、SQLite、Lua、Shell、Java。网站专用卡片、搜索关键词和路由在扩展构建中不存在。

仅允许扩展包含：

- `wasmedge_quickjs.wasm`
- `sqlite.wasm`
- `lua-5.4.9.wasm`
- `wasi-sh.wasm`
- `java/compiler.wasm`
- `java/compiler.wasm-runtime.js`
- `java/compile-classlib-teavm.bin`
- `java/runtime-classlib-teavm.bin`

### 4.2 实现要求

1. Vite 以 `VITE_TARGET=chrome|vscode` 驱动注册表、manifest、文档和静态资源的同一套分端配置，避免只隐藏卡片却保留资源。
2. 网站完整资源仍保留在 `public/offline/code/`；扩展构建的 `writeBundle` 阶段只保留白名单目录/文件，并从输出 manifest 删除网站专用语言与资产。
3. 扩展工作台不动态导入 Rust、Pyodide、v86 等网站专用模块，确保 JS chunk 也不携带这些实现。
4. 扩展文档插件仅生成五种轻量运行时对应书籍；任何端都不生成或加载 LeetCode 内容。
5. 增加自动断言：两个扩展的 `dist/media`、ZIP、VSIX 中无 Python/Ruby/clang/PHP/Go/Rust/Pyodide/v86 大资源，且无对应工具入口。
6. 正常构建只校验本地文件；`--sync` 才读取 SimpleCode。扩展裁剪不得删除 `public/` 中网站需要的大资源。

## 5. 代码结构与关键修改

- `AGENTS.md`：写入逐语言入口、网站全语言、扩展白名单、懒加载和源仓库只读规则。
- `src/registry/tools/programming.ts`：声明 slug → runtime/dialect 映射和独立卡片；按构建目标过滤。
- `src/tools/code-playground/index.vue`：根据路由 slug 初始化固定语言，不再提供语言选择。
- `components/AppShell.vue`、`MainArea.vue`、`EditorToolbar.vue`：移除内部侧栏和题库入口，保留右侧工作区和使用指引。
- `stores/language.ts`、`stores/editor.ts`：固定路由语言、独立 JS/TS 草稿、正确初始化和销毁；防止旧任务跨路由写终端。
- `core/runner.ts`：恢复 Rust、Pyodide、v86 分发；轻量 WASI 与 TeaVM 路径保持兼容。
- `rust/`、`pyodide/`、`core/linux.ts`：从 SimpleCode 适配来源、缓存名、消息和生命周期。
- `docs/runtime.ts`、`stores/docs.ts`：恢复全部书籍和分端运行能力，不包含题库模块。
- `scripts/code-playground-assets.mjs`：完整同步白名单、manifest、Java/Rust lock；默认校验，不访问网络。
- `vite.config.ts`：分端注册/文档 define、扩展输出资源裁剪及构建断言。
- `src/router/immersive.ts`：由编程工具映射生成沉浸式 slug 集合，避免维护两份列表。
- 八个 locale：为 15 个工具补齐名称与说明；工作台已有八语 UI 复用，不引入第二套 locale/theme 控件。
- `LICENSES/code-playground.md` 和资源通知：补齐所有实际迁入运行时和教程的许可证与来源。

## 6. 生命周期、兼容性与风险

1. 跨源隔离仍是 WASI stdin、TeaVM、Rust 等能力的前提；Web 使用 COOP/COEP，普通静态托管按需使用 COI Service Worker，禁止刷新循环。
2. Chrome MV3/VS Code Webview 只承诺五种轻量运行时，但仍需实际宿主验证 CSP、Worker、Cache API、SharedArrayBuffer。
3. 切换路由或离开工具时停止 WASI、rustc、TeaVM、Pyodide、v86，释放模型、Worker、对象 URL、事件监听和串口绑定。
4. 大资源下载期间离开页面必须中止任务；旧进度、旧输出和旧 VM 不得进入新工具。
5. `st_code:*` 只保存编程草稿/进度；`simpletools-code-*` 缓存按资源类型隔离，清理不得影响其他工具。
6. 不复制 SimpleCode 的全局 overflow、独立主题/语言切换或 Tailwind 3 配置。
7. 生产构建不暴露编辑器/终端调试全局。
8. 全语言网站产物会明显增大，这是明确需求；优化目标是首屏和单语言按需加载，而不是从网站删除大运行时。

## 7. 实施顺序

1. 更新本计划与 `AGENTS.md`，建立语言/书籍/资源单一映射。
2. 改造注册表和路由：15 个独立入口、扩展过滤、八语文案。
3. 移除内部语言侧栏，固定当前语言，验证 JS/TS 独立草稿与移动端。
4. 扩展资源脚本为全量网站同步 + 分端校验/裁剪，先恢复全部 WASI，再接入 Rust、Pyodide、Linux。
5. 同步全部教程、恢复 Python 运行，移除题库模块及数据并补齐许可证。
6. 逐语言验证 hello-world、stdin、停止、错误和缓存；优先 QuickJS，再覆盖专用运行器。
7. 全量测试、lint、类型检查、Web/Chrome/VS Code 构建及真实浏览器验收。

## 8. 验收与质量门禁

### 8.1 自动测试

- 注册表：网站 15 个编程工具，扩展 6 个（JavaScript/TypeScript 分开计数），slug 唯一，分类与搜索正确。
- 路由：每张卡片进入固定语言；无内部语言选择器；JS/TS 方言与草稿独立。
- manifest：全部语言资产完整、哈希正确；扩展只含五种运行时及白名单资源。
- 文档：15 本书、中英章节、按章懒加载和运行围栏映射；无 LeetCode 入口、逻辑或数据。
- 生命周期：路由切换、卸载、停止、下载中止、缓存清理、无旧回调污染。
- 移动端：375/390px、768px、1280px，明暗主题，工具栏/终端/抽屉可操作。

### 8.2 必跑命令

```bash
yarn test
yarn lint
yarn build
./build.sh chrome
./build.sh vscode
git diff --check
```

测试必须 100% 通过，不以 skip、删除断言或屏蔽错误达标。另检查三种产物文件清单和体积、首页无 `/offline/code/` 请求、进入单语言只请求其必需资源。

### 8.3 真实运行矩阵

- 网站：15 个工具逐一打开；至少验证每种运行时的 hello-world，stdin/停止/错误按运行时能力覆盖。
- 重点：C/C++ 编译链接、Rust 编译、TeaVM 编译运行、Pyodide/NumPy、v86 启动和脚本退出码。
- Chrome/VS Code：只出现六个扩展工具，并实测 QuickJS、SQLite、Lua、Shell、Java。
- 构建成功不等同于宿主运行成功；无法实测的环境必须明确记录，不伪报通过。

## 9. 完成标准

1. 编程分类是逐语言工具列表，点击进入对应编辑器、运行和快速入门，不提供 LeetCode。
2. 网站具备 SimpleCode 全部语言和教程能力，重资源本地且严格懒加载。
3. 扩展只含 JS/TS、SQLite、Lua、Shell、Java，网站专用卡片、代码和大资源均不进入扩展包。
4. `AGENTS.md` 已记录长期规则，后续正常构建不依赖 SimpleCode 或网络。
5. 样式、主题、八语 UI、手机端、草稿、收藏和最近使用符合 SimpleTools。
6. 全量测试 100% 通过，三端构建和可执行的真实运行验收有明确结果，临时文件已清理。
