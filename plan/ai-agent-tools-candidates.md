# AI Agent 配套工具候选清单（供评审）

调研范围：近 1–2 年开发者围绕 **Coding Agent / MCP / Prompt / Context** 常用的浏览器侧配套能力。  
参考站点：[AIDevUtils](https://aidevutils.com/)、[ToolsHub AI](https://toolhq.dev/ai-tools/)、[A2Z AI tools](https://a2z.tools/ai-developer-tools)、MCP 生态与 Cursor/Claude Code 周边讨论。  
约束：本项目是纯前端、本地离线优先；**不建议**把需要常驻后端或远程 MCP 运行时的能力做成站内工具。

图例：
- **适合本站**：纯浏览器即可实现
- **勉强可做**：纯前端能做一部分，体验有限
- **不适合本站**：需要本机进程 / 远程服务 / Agent 宿主

---

## A. 强烈建议优先（纯前端、刚需、和现有工具箱气质一致）

| # | 候选工具 | 做什么 | 为什么常见 | 实现要点 |
|---|---|---|---|---|
| 1 | Token / Context 计数器 | 按模型估算 prompt 占用 token、占 context 比例 | 调 prompt、控成本必用 | tiktoken WASM（OpenAI 精确）；Claude/Gemini 标明为估算 |
| 2 | API 费用估算器 | 输入 token × 单价 → 单次/月费用 | 和 token 计数成对出现 | 内置常见模型价目表（可本地改） |
| 3 | System Prompt 检查器 / Linter | 找矛盾规则、空占位符、缺输出格式、过长等 | Agent 调参刚需 | 规则引擎，不调模型 |
| 4 | Prompt 模板填充器 | `{{var}}` 变量填充、缺值检查、预览 | 可复用 prompt 管理 | 纯字符串处理 |
| 5 | Prompt 密钥脱敏 | 粘贴前遮住 API Key / Token / PII | 安全刚需 | 正则 + 启发式 |
| 6 | Prompt Injection 扫描 | 对「不可信文本」做注入模式扫描 | Agent 读外部内容前检查 | 启发式规则，非证明安全 |
| 7 | JSON Schema / Structured Output 构建器 | 生成 OpenAI / Claude / Gemini 结构化输出 schema | Function calling & 结构化回复 | 表单 → JSON Schema + 各家差异提示 |
| 8 | Tool / Function 定义生成器 | 一份描述导出 MCP / Anthropic / OpenAI 三种 schema | 写 Agent 工具定义 | 格式转换 |
| 9 | Tool 定义格式转换器 | MCP ↔ Anthropic ↔ OpenAI 互转 | 多宿主迁移 | 同上 |
| 10 | MCP 客户端配置生成 / 校验 | 生成并校验 `mcp.json` / Claude Desktop / Cursor 配置 | 人人都在配 MCP | JSON schema 校验 |
| 11 | MCP tools/list 检查器 | 粘贴 tools/list JSON，检查 name/description/inputSchema | 接新 MCP 前自检 | 只读解析，不连服务器 |
| 12 | MCP 配置合并器 | 多份 mcpServers 合并、去重、冲突提示 | 多项目配置汇总 | 纯 JSON |
| 13 | Agent 上下文预算规划 | 系统提示 + 工具 schema + RAG + 历史轮次 → 还能塞多少 | Context engineering | 依赖 token 计数 |
| 14 | Coding Agent 指令文件生成 | 生成 `AGENTS.md` / `CLAUDE.md` / Cursor Rules / Windsurf Rules | 新项目起手式 | 模板生成 |
| 15 | Claude Skill / SKILL.md 脚手架 | 从表单生成 Skill 目录与 SKILL.md | Skill 生态兴起 | Markdown 模板 |
| 16 | Agent 任务 Prompt 生成器 | 给 Cursor / Claude Code / Codex 写结构化任务说明 | 减少「随便说一句」 | 表单 → Markdown |
| 17 | llms.txt 生成器 | 站点给 AI 爬虫看的 `llms.txt` | 新规范，站点侧配套 | 文本模板 |
| 18 | AI 爬虫 robots 片段 | 生成屏蔽 GPTBot/ClaudeBot 等的 robots 规则 | SEO / 隐私 | 静态文本 |

---

## B. 值得做、但优先级次之

| # | 候选工具 | 做什么 | 备注 |
|---|---|---|---|
| 19 | OpenAPI → MCP 工具定义 | OpenAPI YAML/JSON → MCP tools | 体积与边界情况较多 |
| 20 | MCP Tool 描述质量检查 | 对 description 打分（是否对 Agent 友好） | 启发式 |
| 21 | Agent 安全检查清单 | 按目标/工具生成安全 checklist | 文档型工具 |
| 22 | LLM Red-team Prompt 生成 | 按 OWASP LLM Top 10 生成对抗测试 prompt | 文本模板 |
| 23 | OWASP LLM Top 10 自检 | 问卷式风险自评 | 文档型 |
| 24 | Prompt Diff | 两个 prompt 版本并排 diff | 可复用现有 diff-checker |
| 25 | Chat Messages JSON 规范化 | 把杂乱对话整理成 OpenAI/Anthropic messages 数组 | 格式转换 |
| 26 | Embedding / Chunk 尺寸建议 | 按文本长度建议 chunk size、重叠 | 估算型 |
| 27 | WebMCP / 页面 Agent 就绪检查 | 检查 HTML 是否暴露 WebMCP tools | 偏前沿 |
| 28 | JSON Schema → Zod / Pydantic / TS | schema 代码生成 | 和现有 json-to-typescript 相近可扩展 |

---

## C. 不建议放进本站（需要宿主/后端/常驻进程）

| 能力 | 原因 |
|---|---|
| 官方 MCP Inspector / 真连 MCP Server 调试 | 需要本机起进程、SSE/stdio |
| Context7、GitHub MCP、Playwright MCP、Browser MCP | 是 MCP 服务或扩展，不是网页小工具 |
| BYOK 在线 Summarizer / 改写 / 解释代码 | 需用户 API Key 且出网调模型；和「纯本地工具箱」定位冲突（若你坚持可单独做 BYOK 分类） |
| Agent Eval / 回放真实 PR | 需要运行时与数据集托管 |
| Cursor Agent SDK 托管运行 | 平台能力，不是站内工具 |

---

## D. 推荐首批落地（若你点头，建议先做这 8 个）

1. Token / Context 计数器  
2. API 费用估算器  
3. System Prompt Linter  
4. Prompt 密钥脱敏  
5. Prompt Injection 扫描  
6. MCP 配置生成 + 校验  
7. Tool 定义生成（MCP/OpenAI/Anthropic）  
8. Coding Agent 指令文件生成（AGENTS.md / CLAUDE.md / Cursor Rules）

新分类建议：`AI / Agent`（中英：`AI / Agent`）。

---

## 待你确认

- 首批做上面 D 的 8 个，还是从 A 里自己勾？
- 要不要单独开「AI / Agent」分类？
- BYOK（浏览器直连模型）要不要做？默认建议不做。
