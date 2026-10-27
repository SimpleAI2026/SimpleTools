# SimpleTools

[English](./README_EN.md) | 中文

纯前端、离线可用的开发者小工具箱。所有处理都在本地浏览器完成，**数据从不离开你的设备**。

仓库：https://github.com/SimpleAI2026/SimpleTools

![SimpleTools](./public/samples/simpletools.png)

## 特性

- **125 个工具**（以 `src/registry` 注册表为准，非 `src/tools` 目录计数）
- **中英双语**界面，语言与主题（亮/暗）本地持久化
- **注册表驱动**：搜索、分类、收藏、最近使用、按工具代码分割
- **纯前端 / 可离线**：无业务后端；文件在浏览器内处理并下载
- 技术栈：Vue 3、Vite、TypeScript、Tailwind CSS 4、shadcn-vue（reka-ui）、vue-i18n、Pinia、Yarn 4

## 工具分类

| 分类 | 数量 | 说明 |
|---|---:|---|
| 开发 | 25 | JSON / 正则 / JWT / 各类代码格式化、网络与权限计算等 |
| AI / Agent | 8 | Token 计数、费用估算、Prompt 检查与脱敏、MCP / 工具定义、Agent 指令生成 |
| 编码解码 | 11 | Base64 / URL / Hash / AES / Morse 等 |
| 生成器 | 7 | 密码、UUID、二维码、Lorem、随机数等 |
| 转换 | 15 | 时间戳、命名风格、色值、CSV↔JSON、单位换算等 |
| 文本 | 10 | 字数统计、Diff、记事本、清洗与排版等 |
| 图片 | 9 | 缩放、编辑、滤镜、格式转换、切图、设计辅助等 |
| PDF | 26 | 旋转、水印、加解密、脱敏、互转 Office / 图片 / 文本等 |
| 办公 | 11 | Excel / Word / PPT 查看与转换、合并、创建 |
| 压缩 | 3 | gzip、图片压缩、PDF 压缩 |
| **合计** | **125** | |

> 部分 `src/tools` 下的目录若未写入注册表，不会出现在首页；README 以注册表为准。

## 快速开始

要求：**Node.js ≥ 20**，启用 Corepack 以使用 Yarn 4。

```bash
corepack enable
./build.sh dev          # 开发服务器，默认 http://127.0.0.1:5173
./build.sh build        # 类型检查 + 生产构建 → dist/
./build.sh preview      # 本地预览 dist/
./build.sh lint         # ESLint + vue-tsc
./build.sh test         # Vitest 单测
```

也可以直接使用 Yarn 脚本：`yarn dev` / `yarn build` / `yarn preview` / `yarn lint` / `yarn test`。

部署目标为**本地静态站点**（`vite preview` 或任意静态服务器托管 `dist/`）。

## 目录结构

```
SimpleTools/
├── build.sh            # dev | build | preview | lint | test
├── plan/               # 实施计划与调研笔记
├── public/             # 静态资源（favicon、样例图等）
├── src/
│   ├── components/     # 站点外壳与 UI
│   ├── i18n/           # 中英文本地化
│   ├── pages/          # 首页、工具页、404
│   ├── registry/       # 工具注册表（分类元数据）
│   │   └── tools/      # 按分类拆分的注册条目
│   ├── tools/          # 各工具实现（logic + Vue）
│   └── ...
└── thirdparty/         # 仅本地参考（已 gitignore，勿依赖）
```

## 说明

- `thirdparty/`（如 BrainCoder 参考实现）体积大，仅供对照，**不得被应用 import / 依赖**，也不纳入版本库。
- `public/pdfjs/` 由构建/资源管线准备，已忽略。
- 当前未包含需 WASM 的工具（如部分 PDF 合并/OCR）；纯 JS 路径已覆盖注册表中的工具。

## License

私有仓库。代码与资源版权归 SimpleAI2026 / 作者所有，未经许可请勿公开分发。
