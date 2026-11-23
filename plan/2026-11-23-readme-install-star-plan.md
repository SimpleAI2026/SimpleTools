# 2026-11-23 README、安装入口与自愿 Star

## 目标

让公开仓库的首屏、构建说明和产品内安装入口与真实行为一致：网页可试用、Chrome 商店是安装首选、ZIP 解压仍是次级手动路径、源码公开但保留所有权利。不新增依赖，不改运行时，不发布，不改仓库设置。

## 事实（已核对）

- 仓库是 public，根目录没有项目 LICENSE。README 末尾仍写「私有仓库 / Private repository」。
- 在线站点 https://simpletools-kappa.vercel.app/ 与 Chrome 商店 https://chromewebstore.google.com/detail/simpletools/fkokpmlmjopflpadegcjnhbelolaihgl 真实存在，README 未写。
- `docs/screenshots/1.png`–`3.png` 与 `public/samples/simpletools.png` 已在仓库中，首屏继续用这些图。
- 网页构建是 History 路由，产物在 `dist/`。`./build.sh preview` 用 Vite 托管并处理前端路由。
- `scripts/code-playground-assets.mjs` 在普通构建时只发布已提交的运行时清单。二进制不在 `public/offline/code` 时不会读取 `../SimpleCode`。完整语言运行时要另有同级 SimpleCode 再 `--sync`。本环境没有 `../SimpleCode`。
- `AppHeader` 在 `VITE_TARGET` 为 `chrome` 或 `vscode` 时隐藏扩展安装。网页里 Chrome 按钮只打开 ZIP 解压步骤。
- 页脚 `app.privacy` 和首页 `app.tagline` 写成所有处理都在本地、数据从不离开浏览器。大型引擎会从本站按需下载，Agent 在用户保存所选接口后会调用该 API。

## 改动

1. 中英 README 首屏写清工具箱定位、在线体验、Chrome 商店、源码，并说明网页/扩展差异与三类联网情况。保留现有截图和分类表，不写新的人数、Star 或性能数字。
2. 权利段落只把「私有仓库」改成「源码公开、保留所有权利」。不添加 MIT/Apache/GPL，不扩大自托管、修改、复制或再分发许可。构建说明声明自身不授予权利。第三方许可不动。
3. 补最短的安装、`./build.sh build`、`./build.sh preview` 与静态托管说明，并区分普通构建和完整编程运行时。新增双语 `CONTRIBUTING.md`：引导可复现的 bug 与建议；写明本文不构成贡献许可，也不承诺合并 PR。
4. 抽出 `install-entry.ts`：商店 URL、仓库 URL、宿主是 web/chrome/vscode 时是否显示安装、窄屏且粗指针时视为手持设备。Chrome 弹层首项是商店链接；ZIP 步骤放在默认关闭的 `<details>` 里。VS Code 仍是 VSIX。Chrome/VS Code 构建不显示安装入口。GitHub 链接加自愿 Star 的可聚焦提示，不请求计数、不弹窗、不锁功能。
5. 只改外壳上的 `app.tagline`、`app.privacy`、`app.github` 和 Chrome 安装文案，覆盖 8 种语言。不改各工具里「文件不离开本机」的句子。

## 测试

- `install-entry.ts`：链接常量、四种宿主、手持设备判定。
- 弹层：商店链接目标与顺序、手动安装默认收起、手持说明、VS Code 不出现商店、Chrome/VS Code 宿主不渲染安装按钮。
- 顶栏：GitHub 指向仓库而非 API，提示不占文档流、可被键盘聚焦的链接描述，点击不发请求。
- 8 语外壳文案：隐私句同时包含本地处理、按需下载和显式配置后的 API，且不含「从不离开 / never leaves」这类绝对说法。

## 验证

相关命令：`yarn test`、`yarn lint`、`yarn build`，以及 `./build.sh preview` 对 `dist/` 的本地响应。不运行 `./build.sh chrome` 或 `./build.sh vscode`（会改版本号）。不下载或提交 WASM。桌面与 390px 截图确认顶栏不挤、不录像。
