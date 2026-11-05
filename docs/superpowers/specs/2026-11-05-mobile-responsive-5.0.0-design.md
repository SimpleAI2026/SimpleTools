# SimpleTools 5.0.0 Mobile Responsive Design

## Goal

Narrow-screen Web（≥375px / ~390–430）使每个工具的主流程在手机浏览器上可走通。困难工具（PDF annotate/canvas 等）可降级简化 UI。不做 PWA。版本：Web + Chrome + VS Code → **5.0.0**。

## Constraints（用户确认）

| 项 | 约定 |
| --- | --- |
| Target | 手机浏览器响应式（窄屏 Web） |
| Acceptance | 全部工具主流程在手机上可走通 |
| Hard tools | PDF annotate / canvas 可降级简化 UI |
| Versions | `package.json` + `chrome-extension/manifest.json` + `vscode-extension/package.json` 全部 5.0.0 |
| Approach | 共享组件优先 |
| Push | 未经明确要求不 push |

## Audit baseline（2026-11-05 Mac main）

- Current versions: Web / Chrome **4.0.0**，VS Code **3.0.1**；本地 main ahead of origin ~**27** commits
- 工具审计：共 **131** 个 — OK **38** / Partial **89** / Broken **4**
- Broken：**agent**、**pdf-redact**、**pdf-editor**、**pdf-auto-redact**
- 现状：
  - viewport meta：有
  - Tailwind `sm` / `md` / `lg`：稀疏使用
  - 无 Drawer / Sheet、无 safe-area、无 PWA

## Architecture

1. **共享组件优先**：TextIO / ConvertIO、PdfPageCanvas、SheetTable，再 shell，再 Broken，再剩余 Partial
2. **Breakpoints**：沿用 Tailwind `sm` / `md` / `lg`
   - `<lg`：竖排 stack 或 Tabs
   - 侧栏 → drawer
3. **明确不做**：PWA / `vite-plugin-pwa`

## Shell

- **AppHeader**：窄屏下语言 / Chrome / VS Code / theme 收进 overflow 菜单
- **HomePage**：保持单列 + chip wrap
- **Agent**：`<md` 时 thread list 收进 drawer；删除操作始终可见
- **Touch targets**：主操作 ≥ **44px**

## Shared components

### TextIO / ConvertIO（约 65 个工具依赖）

- 去掉硬编码 `h-[500px]`
- 使用 `min(500px, 45dvh)`，或窄屏 Input / Output **Tabs**

### PdfPageCanvas

- `width = min(prop, container)`
- 允许 scale / scroll
- 手机端降级 toolbars

### SheetTable

- `overflow-auto` + 横向滚动提示
- 可选 card rows 布局

### Sidebar grid tools

- `<lg` stack
- toolbars `flex-wrap`

## Tool work order

1. Shell（AppHeader / HomePage / Agent）
2. Shared（TextIO、PdfPageCanvas、SheetTable）
3. Broken 4（agent、pdf-redact、pdf-editor、pdf-auto-redact）
4. Remaining Partial（`lg:grid-cols-[1fr_*]`、`grid-cols-4`、editors 等）
5. Version bump + Chrome zip rebuild

## Out of scope

- PWA、原生 App
- Chrome / VS Code 作为移动端表面（仅版本 bump）
- HostTools whitelist 扩展
- Push to remote

## Success criteria

在约 **390px** 宽度下：

1. 从首页导航
2. 打开任意工具
3. 完成主流程（输入 / 选文件 → 执行 → 结果 / 下载）

不得出现不可用的横向滚动陷阱。困难工具允许简化 UI 后仍可完成主流程。
