# 40 个浏览器本地工具验收表

分支：`cursor/forty-browser-local-tools-3805`。版本保持 5.0.0。主计划 `plan/2026-11-08-40-browser-local-tools-plan.md` 未改内容。

状态说明：

- **单测通过**：`logic.test.ts` 覆盖示例、空输入、错误输入和该项边界；`src/lib/workflow/b1.test.ts` 至 `b4.test.ts` 覆盖计划中的正反例。
- **本地预览已走通**：2026-11-09 在 `vite preview`（127.0.0.1:4173）用约 390px 宽度打开中文界面。01 做了示例、清空（出现「没有可处理的输入」）、再载入示例；输出 JSON 含稳定 ID `q_59ab6821`。17 的输出保留 `x=1` 和 `#hero`，`utm_campaign` 只编码一次。截图：`/opt/cursor/artifacts/geo-question-panel-390.png`、`/opt/cursor/artifacts/utm-builder-390.png`。
- **扩展断网未实测**：没有在关闭网络的 Chrome 扩展配置里加载 MV3 包。Chrome 构建已确认包内没有 Pandoc，FFmpeg WASM 仍在包内，CSP 仍是 `script-src 'self' 'wasm-unsafe-eval'`。

| 编号 | tool-id | 实现 | 测试 | 状态 |
|---|---|---|---|---|
| 01 | geo-question-panel | `src/tools/geo-question-panel/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；390px 本地预览已走通；扩展断网未实测 |
| 02 | ai-answer-snapshot | `src/tools/ai-answer-snapshot/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；浏览器未实测 |
| 03 | ai-panel-observations | `src/tools/ai-panel-observations/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；浏览器未实测 |
| 04 | brand-entity-consistency | `src/tools/brand-entity-consistency/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 05 | claim-evidence-ledger | `src/tools/claim-evidence-ledger/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；浏览器未实测 |
| 06 | geo-change-experiment | `src/tools/geo-change-experiment/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 07 | citation-gap-map | `src/tools/citation-gap-map/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 08 | geo-access-evidence | `src/tools/geo-access-evidence/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 09 | evidence-answer-brief | `src/tools/evidence-answer-brief/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；浏览器未实测 |
| 10 | source-quote-verifier | `src/tools/source-quote-verifier/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 11 | agent-eval-cases | `src/tools/agent-eval-cases/`，`src/lib/workflow/b1.ts`，`src/lib/workflow/regexBudget.ts` | `logic.test.ts`，`b1.test.ts`，`regexBudget.test.ts` | 单测通过；浏览器未实测 |
| 12 | agent-trace-review | `src/tools/agent-trace-review/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 13 | blind-output-review | `src/tools/blind-output-review/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 14 | agent-workflow-preflight | `src/tools/agent-workflow-preflight/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 15 | eval-dataset-splitter | `src/tools/eval-dataset-splitter/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 16 | localization-lqa | `src/tools/localization-lqa/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 17 | utm-builder | `src/tools/utm-builder/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；390px 本地预览已走通；扩展断网未实测 |
| 18 | campaign-unit-economics | `src/tools/campaign-unit-economics/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 19 | cohort-retention-analyzer | `src/tools/cohort-retention-analyzer/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 20 | owned-marketing-report | `src/tools/owned-marketing-report/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 21 | ab-test-analyzer | `src/tools/ab-test-analyzer/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 22 | responsive-ad-asset-validator | `src/tools/responsive-ad-asset-validator/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 23 | product-feed-auditor | `src/tools/product-feed-auditor/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 24 | hreflang-map-auditor | `src/tools/hreflang-map-auditor/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 25 | redirect-migration-planner | `src/tools/redirect-migration-planner/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 26 | keyword-intent-map | `src/tools/keyword-intent-map/`，`src/lib/workflow/b2.ts` | `logic.test.ts`，`b2.test.ts` | 单测通过；浏览器未实测 |
| 27 | promotion-stack-simulator | `src/tools/promotion-stack-simulator/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 28 | review-theme-coder | `src/tools/review-theme-coder/`，`src/lib/workflow/b3.ts` | `logic.test.ts`，`b3.test.ts` | 单测通过；浏览器未实测 |
| 29 | ai-storyboard-variants | `src/tools/ai-storyboard-variants/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；浏览器未实测 |
| 30 | subtitle-toolkit | `src/tools/subtitle-toolkit/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；浏览器未实测 |
| 31 | generation-take-ledger | `src/tools/generation-take-ledger/`，`src/lib/workflow/b1.ts` | `logic.test.ts`，`b1.test.ts` | 单测通过；浏览器未实测 |
| 32 | video-delivery-preflight | `src/tools/video-delivery-preflight/`，`src/lib/workflow/b4.ts`，复用 `src/tools/ffmpeg/engine.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过（日志契约）；浏览器内 probe 未实测 |
| 33 | audio-level-auditor | `src/tools/audio-level-auditor/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 34 | edit-decision-log | `src/tools/edit-decision-log/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 35 | chapter-author | `src/tools/chapter-author/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 36 | visual-selects-board | `src/tools/visual-selects-board/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 37 | image-alt-review | `src/tools/image-alt-review/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 38 | design-token-auditor | `src/tools/design-token-auditor/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 39 | project-handoff-auditor | `src/tools/project-handoff-auditor/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |
| 40 | voiceover-timing-planner | `src/tools/voiceover-timing-planner/`，`src/lib/workflow/b4.ts` | `logic.test.ts`，`b4.test.ts` | 单测通过；浏览器未实测 |

每个工具目录都包含 `index.vue`、`logic.ts`、`logic.test.ts`、`messages.ts`。注册在 `src/registry/tools/growth-workflows.ts`、`market-workflows.ts`、`creator-workflows.ts`。界面八语在各自 `messages.ts`，公共导入错误在八个 locale 的 `common` 段。

## 与计划不一致、但保留能力的地方

- 用户正则没有走可终止的原生 `RegExp` Worker。MV3 CSP 不允许 blob worker，而 V8 的同步正则无法用 `AbortController` 打断。等价实现是 `src/lib/workflow/regexBudget.ts` 的步进解释器：超限返回 `timeout`，工具记为 `incomplete`，不算通过。前瞻、反向引用直接拒绝。
- 32 的单测使用 FFmpeg 文本日志。页面在选择本地媒体时才会调用既有 `runFfmpeg({ mode: 'probe' })`，不新增 WASM。
- 33 只接受明确的 PCM WAV（16/24/32 位整数或 32 位浮点）。不报告 LUFS。
- 德法西葡文案是完整句子，但部分重音被写成 ASCII，避免把英文 key 原样复制到其他语言。
- 处理结果里的 `summary` 目前是英文固定句。工具名、说明、免责声明、按钮和错误提示是八语。
- 只在本地生产预览里看了 01 和 17。其余 38 个工具没有逐页点开。
