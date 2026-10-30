# SimpleTools · Chrome 扩展

将 SimpleTools SPA 打包为 **Chrome Manifest V3** 扩展。点击工具栏图标会在新标签页打开完整应用（无弹窗），无需宿主权限。

## 构建

在仓库根目录：

```bash
./build.sh chrome
# 或
./chrome-extension/build.sh
```

产物：

- `chrome-extension/dist/` — 可直接「加载已解压的扩展程序」
- `chrome-extension/simpletools-chrome.zip` — 打包 zip

## 安装（开发者模式）

1. 打开 Chrome → `chrome://extensions`
2. 开启「开发者模式」
3. 「加载已解压的扩展程序」→ 选择本目录下的 `dist/`
4. 点击工具栏 SimpleTools 图标，即可在新标签页使用

## 说明

- `permissions` 为空；仅访问扩展自身 `chrome-extension://` 页面
- SPA 使用相对路径 `base: './'` + **Hash 路由**（`VITE_ROUTER_MODE=hash`）
- 图标由 `public/favicon.svg` 生成（16 / 32 / 48 / 128）
