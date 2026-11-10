# 保留并打磨 8 个工作流工具

## 目标

从 2026-11-09 新增的 40 个工具中只保留以下 8 个，其余 32 个从注册表、源码、测试与共享实现中清理：

- `utm-builder`（17）
- `ab-test-analyzer`（21）
- `product-feed-auditor`（23）
- `hreflang-map-auditor`（24）
- `redirect-migration-planner`（25）
- `subtitle-toolkit`（30）
- `video-delivery-preflight`（32）
- `design-token-auditor`（38）

保留原有 slug、分类、收藏与最近使用兼容性，不改变 Vue 3、TypeScript、八语、离线处理和三端边界。

## 实施方案

### 1. 清理范围

- 从 `growth-workflows.ts`、`market-workflows.ts`、`creator-workflows.ts` 删除另外 32 个注册项；空注册文件一并移除。
- 删除另外 32 个 `src/tools/<slug>/` 目录及其测试、八语文案。
- 将 8 个保留工具的业务逻辑收回到各自 `logic.ts`，删除不再使用的 `b1.ts` 至 `b4.ts`、`regexBudget.ts` 及对应测试。
- 精简 `src/lib/workflow/core.ts`，只保留 8 个工具共同需要的安全解析、CSV、工件与展示能力；删除通用 `ArtifactWorkbench.vue`。

### 2. 专用交互

- UTM：链接列表、五个标准 UTM 字段、冲突策略、逐条结果复制和 CSV 导出。
- A/B：两组样本表单、检验方向、转化率/差值/z/p/适用性结果，不把不适用的小样本称为显著。
- 商品 Feed：CSV/TSV 导入与粘贴、字段级问题表、GTIN/重复 ID/变体币种检查及 CSV 导出。
- Hreflang：可编辑的页面映射行、语言/alternates 输入、回链与自指问题表。
- 重定向：可编辑映射行、状态码选择、链/环/冲突结果及部署映射 CSV。
- 字幕：SRT/基础 VTT 导入、整体偏移、目标格式、cue 与重叠摘要、结果复制和下载；复杂样式明确拒绝转换。
- 视频交付：本地媒体选择与显式 probe、宽/高/FPS/声道合同字段、实际值与期望值对照、unknown 不当作通过；离开页面取消 FFmpeg。
- 设计 Token：JSON 导入与编辑、Token/引用/循环/大小写冲突结果及问题导出。

所有新控件继续使用工具自身的 `messages.ts` 和现有 `common` 文案，不引入新依赖，不执行导入内容，不发起网络请求。

### 3. 测试与验收

- 更新 8 个工具的逻辑测试，覆盖核心正反例、导出内容和错误边界。
- 为专用界面增加必要的行为测试，至少覆盖 UTM 表单、A/B 表单、字幕操作和视频 probe 调用契约。
- 确认被删除 slug 不再出现在运行时代码和注册表中。
- 执行 `yarn test`、`yarn lint`、`yarn build`、`./build.sh chrome`、`./build.sh vscode`。
- 用本地生产预览检查 8 个页面在约 390px 宽度下的主流程；构建后的 Chrome 清单与 ZIP 保持可加载。

## 边界

旧 40 工具调研与验收文档保留为历史记录，本文件记录新的保留范围。不恢复已删除工具，不把其他旧工具的无关问题纳入本次修改。
