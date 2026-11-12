# SimpleTools 项目规则

## 基本工作方式

- 多步改动先在 `plan/` 写或更新计划，再实施。
- 保持现有 Vue 3、Vite、TypeScript、Pinia、Tailwind 4、vue-i18n 和 Yarn 4 技术栈，不擅自更换框架或包管理器。
- 修改后运行与改动相关的测试；交付前执行 `yarn test`、`yarn lint`、`yarn build`，涉及扩展时还要执行 `./build.sh chrome` 和 `./build.sh vscode`。
- 每次执行 `./build.sh chrome` 或 `./build.sh vscode` 都将根项目、Chrome 和 VS Code 的版本号同步增加 0.0.1，并更新 `vscode-extension/package-lock.json`；不要手工只改某一端。
- 测试必须全部通过，不通过 skip、删除断言或屏蔽错误制造通过率。
- 不提交、推送或还原无关的本地改动；临时截图、日志和测试缓存交付前清理。

## 编程工具的长期边界

- “编程”分类按语言提供独立卡片和 URL。点击某语言后直接进入该语言的编辑器、运行/停止、终端和快速入门，不再提供统一的代码练习场卡片、内部语言侧栏或 LeetCode 题库。
- JavaScript 和 TypeScript 使用独立入口及独立草稿，但可共享 QuickJS 运行时；TypeScript 只做类型剥离，不宣称类型检查。
- 网站支持 `../SimpleCode` 的全部语言和教程，包括大型运行时。`../SimpleCode` 始终只读，正常构建不得依赖该目录存在或访问网络。
- Chrome 与 VS Code 扩展只支持 JavaScript、TypeScript、SQLite、Lua、Shell、Java；网站专用语言不得仅隐藏卡片而仍把代码或资源打进扩展。
- 扩展只允许打包 QuickJS、SQLite、Lua、Shell 和 Java 的明确白名单资源；Python、Ruby、C/C++、PHP、Go、Rust、Pyodide、v86 等资源只进入网站产物。
- 所有运行时资源必须本地、同源并按需加载。首页不得加载 Monaco、xterm、WASM 或虚拟机；`runtime-manifest.json` 加载不得触发全部运行时下载，扩展目录中不得再出现其他 `manifest.json`。
- 编程运行时清单提交在 `src/tools/code-playground/core/runtime-manifest.json`（含 `java-lock.json`、`rust-lock.json`），正常构建只发布该快照并校验已存在的二进制；`../SimpleCode` 运行时更新后，执行 `node scripts/code-playground-assets.mjs --sync` 刷新快照并一起提交，不得手改哈希。
- 大资源可以在网站中使用，不再按 10 MiB 上限排除；扩展裁剪是为了包体大小，不得反向删除网站能力。
- 教程按章节懒加载。书籍、示例和运行时必须保留来源及许可证；运行按钮只在当前端和当前语言真正可执行时出现。
- 路由切换和组件卸载必须停止对应 WASI、Rust、TeaVM、Pyodide 或 v86 任务并释放资源，旧输出不得写入新页面。
- 编程草稿使用 `st_code:*`，缓存使用 `simpletools-code-*`，不得覆盖其他工具的存储或缓存。
- 编程工具继续使用 SimpleTools 的主题、八语 UI、收藏、最近使用和响应式规范，不复制 SimpleCode 的独立主题、语言切换或全局 overflow。

详细设计与验收矩阵见 `plan/2026-11-09-simplecode-programming-integration-plan.md`；调整上述边界时必须先更新该计划和本文件。

## 工具开发约定

- 新工具放在 `src/tools/<slug>/`（`index.vue`、`logic.ts`、`logic.test.ts`、`messages.ts`），并在 `src/registry/tools/*.ts` 注册；README 的数量与分类以注册表为准，增删工具时同步更新 `README.md` 和 `README_EN.md`。
- 界面文案必须覆盖 8 种语言：zh-CN、en、ja、ko、de、fr、es、pt-BR；窄屏 390px 下主流程可完成。
- 输出区的复制按钮统一放在输出面板标题行右上角；输出会粘贴给 AI / Agent 使用的工具，底部提供「使用方法」，按 `step1 -> step2 -> step3` 书写。
- 只在浏览器本地处理，不引入后端、云 API 或 CDN 代码；新依赖只用宽松许可证（MIT、BSD、Apache 等），不引入 GPL / AGPL 依赖，`thirdparty/` 仅作参考，不复制其代码。
