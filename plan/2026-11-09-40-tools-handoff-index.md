# SimpleTools 40工具资料与四批实施交接索引

交接记录：2026-11-09 Asia/Shanghai。三份原文逐字节保留，不是重建版。原文中的“仅调研/未实施授权”为当时历史状态；用户本次已授权后续实现，本执行者仅交付资料，代码由父bot另行处理。

## Mac状态

ListMachines：LINKXZHOU-MC1 connected=true。本轮对目标文件的正常Read被拒：`Path is outside the allowed local-exec root and was refused: /Volumes/my/github/SimpleTools/plan/2026-11-08-40-browser-local-tools-plan.md`。已立即停止Mac操作，未尝试其他路线，未CopyFromBox，未写入Mac。原有不同内容文件未覆盖。

## 完整原件（本持久目录，可作为CloudAgent附件）

- `/cursor/stores/store-37e40781-baba-4e1f-b3a0-30cb99985659/simpletools-plan-handoff/2026-11-08-40-browser-local-tools-plan.md`
  - 58180 bytes；SHA256 `aad91d3f982eaf4e938ad7fcb50986a5ebab9d2560dfc5169a83a6df6127c27d`
- `/cursor/stores/store-37e40781-baba-4e1f-b3a0-30cb99985659/simpletools-plan-handoff/2026-11-08-tools-expansion-research-plan.md`
  - 128441 bytes；SHA256 `6a3bcad2abcf71082ab05ce9a8bf5af56bc02d97d633d59c64cec9eedea57d37`
- `/cursor/stores/store-37e40781-baba-4e1f-b3a0-30cb99985659/simpletools-plan-handoff/2026-11-08-tools-open-source-mapping.md`
  - 57135 bytes；SHA256 `8bc0e21f266cc29fb19e3f4803195d0cbea166af2a923c093a8db3b75a3daceb`

## 四批tool-id（严格从主plan提取：4×10=40，编号与slug唯一）

### B1 文件证据/创作骨架

- 01 `geo-question-panel` — GEO意图/问题面板
- 02 `ai-answer-snapshot` — AI回答提及/引用快照分析
- 03 `ai-panel-observations` — AI可见度重复观测面板
- 05 `claim-evidence-ledger` — 主张、引用与新鲜度台账
- 09 `evidence-answer-brief` — 证据驱动内容Brief
- 11 `agent-eval-cases` — Agent样本与确定性规则评测
- 17 `utm-builder` — 活动UTM链接治理
- 29 `ai-storyboard-variants` — AI分镜与生成版本本
- 30 `subtitle-toolkit` — 字幕时间轴工具箱
- 31 `generation-take-ledger` — 素材来源与使用权台账

### B2 对照/审校/复盘

- 04 `brand-entity-consistency` — 品牌实体事实一致性检查
- 06 `geo-change-experiment` — GEO内容改版实验包
- 07 `citation-gap-map` — 竞品引用来源差距图
- 10 `source-quote-verifier` — 本地引文逐字核对
- 12 `agent-trace-review` — Agent轨迹与资源复盘
- 13 `blind-output-review` — 输出盲评与人工校准
- 15 `eval-dataset-splitter` — 评测集划分与泄漏检查
- 16 `localization-lqa` — 多语文案LQA检查
- 20 `owned-marketing-report` — 自有营销报表对账
- 26 `keyword-intent-map` — 关键词意图与页面归属图

### B3 全球营销/跨境规则

- 08 `geo-access-evidence` — AI搜索访问前提审计
- 18 `campaign-unit-economics` — 投放与跨境单位经济模型
- 19 `cohort-retention-analyzer` — 用户分群留存分析
- 21 `ab-test-analyzer` — A/B转化结果分析
- 22 `responsive-ad-asset-validator` — 响应式广告资产预检
- 23 `product-feed-auditor` — 跨境商品Feed审计
- 24 `hreflang-map-auditor` — 多语站点Hreflang映射审计
- 25 `redirect-migration-planner` — 站点迁移重定向规划
- 27 `promotion-stack-simulator` — 促销叠加与到手价模拟
- 28 `review-theme-coder` — 客户反馈主题编码

### B4 媒体与交付工程

- 14 `agent-workflow-preflight` — Agent工作流静态预检
- 32 `video-delivery-preflight` — 音视频交付规格预检
- 33 `audio-level-auditor` — 音频电平与削波质检
- 34 `edit-decision-log` — 剪辑选段决策表
- 35 `chapter-author` — 音视频章节与节目说明
- 36 `visual-selects-board` — 图片与关键帧选片板
- 37 `image-alt-review` — 图像替代文本审核
- 38 `design-token-auditor` — 设计Token一致性审计
- 39 `project-handoff-auditor` — 创作项目交接完整性审计
- 40 `voiceover-timing-planner` — 配音脚本时长与录制排期

## 实施约束摘要

- 40独立新增，8 GEO＋8 AI/Agent＋12营销跨境＋12创作者；增强另计。
- 39项JS/TS主逻辑＋1项复用既有FFmpeg WASM；不引模型/在线API，不自动采集。
- 主plan每项已含输入输出、许可与repo、风险验收；四批均需导入→编辑→保存→重开、8语、手机小样、三端与离线资源验证。浏览器运行未实测。
- 主plan是当前决策依据；主调研和开源mapping为证据补充，旧12项选型已被40版替代。
- 此交接不代表代码已实现或测试通过。
