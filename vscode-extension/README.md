# SimpleTools · VS Code 扩展

在 VS Code Webview 中运行 SimpleTools SPA（离线、无后端）。

## 构建

在仓库根目录：

```bash
./build.sh vscode
# 或
./vscode-extension/build.sh
```

产物：

- `vscode-extension/media/` — Vite 构建的 SPA
- `vscode-extension/out/extension.js` — 扩展宿主
- `vscode-extension/simpletools-3.0.0.vsix` — 可安装包

## 安装

```bash
code --install-extension vscode-extension/simpletools-3.0.0.vsix
```

或在 VS Code：扩展视图 → `…` → **Install from VSIX…**

## 使用

命令面板（⌘⇧P / Ctrl+Shift+P）→ **SimpleTools: Open**

## 说明

- Webview 内必须使用 **Hash 路由**（`VITE_ROUTER_MODE=hash`）
- `localResourceRoots` 指向 `media/`；HTML 通过 `asWebviewUri` + `<base>` 加载资源
- pdf.js worker / CMap 依赖 webview CSP（已放行 `worker-src` / `blob:`）；若个别 PDF 工具异常，优先检查 CSP 与 worker 路径
- publisher：`SimpleAI2026`
- `vsce` 会对工具内示例密钥（如 secret redactor 样例）误报；构建脚本已用 `--allow-package-secrets` 放行该类假阳性

