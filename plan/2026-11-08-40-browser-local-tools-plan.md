# SimpleTools 本期40个独立新增工具：浏览器本地研究与需求计划

> **当前决策清单，替代早期12项选型；不是缩减范围，也不是实施授权。** 采集日期：2026-11-08 Asia/Shanghai（UTC+8）。仅调研、去重、技术选型与plan；没有实现/安装/构建/发布/commit/push。Mac权限Never未重试，未写入Mac，版本保持5.0.0。浏览器运行、性能、包体与断网验收均未实测。

**Goal：** 推荐值得实施的40个独立新增工具（40个唯一拟定tool-id），已有增强/组合另列且不占数。
**Architecture：** Vue/TS纯前端，输入来自用户显式选择的本地文件或手填；可保存版本化工件。共享既有CSV/ZIP/FFmpeg等底层不等于重复工具；不做账户采集/后端定时监测/模型推理。
**Tech Stack：** 沿用Vue/shadcn、Yarn4、八语与既有离线资源。**39项主逻辑JS/TS，1项主流程复用现成FFmpeg浏览器WASM（32）**；不是39项必须纯手写或只有1项可受益于WASM。新增第三方运行依赖0、新WASM引擎0、模型0是这版建议选择，非用户硬限制/已构建测量。

## 0. 规模、来源强弱与分组

| 组 | 编号 | 新增数 | 本期工作对象 |
|---|---|---:|---|
| GEO / AI增长 | 01–08 | 8 | 问题→回答证据→重复观测→实体/主张→实验/来源差距/访问前提 |
| AI内容 / Agent工作流 | 09–16 | 8 | 证据brief/逐字核对、样本、轨迹、人工盲评、静态图、holdout、LQA |
| 全球营销 / 跨境 | 17–28 | 12 | 活动链接/经济模型/留存/报表/实验/广告/Feed/国际SEO/迁移/主题/优惠/反馈 |
| 音视频 / AI创作者 / 设计 | 29–40 | 12 | 分镜/字幕/权利、媒体质检/剪辑决策/章节、选片/无障碍/Token/交接/口播 |
| **合计** | **01–40** | **40** | 不是40个转换器、模板或现有功能换皮 |

筛选判断：任务和可保存输出是否独立、与现有registry是否重复、浏览器离线能否成立、证据强弱、实现与数据风险。没有虚构精确需求评分/全球岗位使用率/全球插件排行。R1–R17是一手需求/规范或既有产品流程证据，**并不证明本地工具的用户规模/付费意愿**；“扩展”来源的工具是产品机会推演，已标明。优先度/工作量S/M/L均是主观产品/工程判断。后续访谈要验证实际文件样本、使用频率和工具独立入口价值，但本轮不给用户自行研究的任务。

为什么不用另外两种扩大方法：把已有FFmpeg/图像参数拆40张卡会重复；把GEO/Agent开源服务硬搬WASM则违反浏览器本地边界。本版选“独立业务工件＋少量真正媒体分析”，保留既有音视频编辑能力的增强。

## 1. 新鲜registry核实与语义去重

本轮通过内置GitHub连接器只读main的`src/registry/index.ts`、11个`src/registry/tools/*.ts`及相关FFmpeg/tool-def源码，没有克隆/访问Mac。读取时main HEAD仍为`9378d49dd1d5aaddd23857d51d63c21830f3c6b2`，[提交来源](https://github.com/SimpleAI2026/SimpleTools/commit/9378d49dd1d5aaddd23857d51d63c21830f3c6b2)，提交时间2026-11-05 15:08:00 Asia/Shanghai（源值07:08:00Z）。按文件读取不是原子快照/不能保证Mac HEAD相同。

- registry静态声明**131个唯一slug**；其中Pandoc条件启用，Chrome/VSCode排除后**130**。40个建议slug与这131个均无重名；还逐项比较任务而非仅查名字。实施后若都注册且其他不变，目标才是Web171/Chrome170，**当前仍131/130，不是已经增加**。
- 新鲜证据：[registry聚合](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/index.ts)、[AI](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/ai.ts)、[media](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/media.ts)、[text](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/text.ts)、[developer-a](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/developer-a.ts)、[developer-b](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/developer-b.ts)、[office](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/office.ts)、[convert-a](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/convert-a.ts)、[compress](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/compress.ts)、[encode](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/encode.ts)、[generate](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/generate.ts)、[pdf](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/registry/tools/pdf.ts)。静态列表及工具结果路径在`40-tools-registry-evidence.json`。
- 现有`agent`、token/cost、system-prompt-linter、secret-redactor、injection-scanner、mcp-config-builder、agent-tool-def、agent-instructions不重造。新鲜[tool-def逻辑](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/tools/agent-tool-def/logic.ts)是参数/格式定义转换，不是评测集、轨迹、holdout或工作流图预检。
- 现有FFmpeg已转码、抽/静音、拼接、取帧、probe以及尺寸/码率/字幕水印参数；[logic](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/tools/ffmpeg/logic.ts)、[界面](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/tools/ffmpeg/index.vue)。probe现为日志/文本导出，不是结构化质量契约；因此32的独立范围必须是**媒体＋客户规格→issue工件**，只包一层probe不算完成新工具。没有独立字幕cue编辑/UTM注册；另窄读[url-parser逻辑](https://github.com/SimpleAI2026/SimpleTools/blob/main/src/tools/url-parser/logic.ts)，已有query编辑/重建而非活动批量治理，17必须交付命名字典/必填/冲突等独立契约，不能只预填utm键；30须交付cue编辑而非仅烧录。
- 现有CSV/Excel、text-lines、notepad、diff、word-counter、URL、图像/FFmpeg、OCR/PDF提取可以共享；“开一个旧工具→另一个旧工具”的导引不计新增。后面每项写明新增语义/验收，若只实现其旧能力那不是该项完成。

## 2. 公共技术字典与证据等级

- **Native**：**JS/TS原生/自研，无新增第三方依赖**：JSON/File/Blob/Map/Set/URL/Canvas/必要WebCrypto/worker；不复制外部代码，沿项目现有许可（不擅指定SPDX）。
- **CSV复用**：**JS/TS自研＋既有CSV（技术A/E1）** [PapaParse](https://github.com/mholt/PapaParse)，[MIT](https://github.com/mholt/PapaParse/blob/master/LICENSE)；已有依赖、无新增。
- **ZIP复用**：**JS/TS自研＋既有ZIP（技术A/E1）** [fflate](https://github.com/101arrowz/fflate)，[MIT](https://github.com/101arrowz/fflate/blob/master/LICENSE)；CSV如需复用既有PapaParse/MIT；无新增。
- **WASM复用**：**现成浏览器WASM＋TS规则（技术B/E1）** [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)，[wrapper MIT](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/LICENSE)，core/codec依实际构建另审；已有引擎，无新增。

CSV/ZIP复用的许可证文件均已在上轮GitHub实读；package声明范围为`papaparse ^5.7.0`、`fflate ^0.8.3`，不是锁定解析结果。WASM复用是已有`@ffmpeg/ffmpeg ^0.12.15`＋单线程`@ffmpeg/core ^0.12.10`；不用新core-mt或新引擎。Native不意指忽略现有Vue和工具基础设施许可；只是无需为本项新增第三方算法库。原生TS不要复制授权不明桌面项目/规范示例代码。

**E1**=上游明确浏览器支持/现成WASM发行；PapaParse、fflate、FFmpeg有E1（见原开源mapping与[FFmpeg overview](https://ffmpegwasm.netlify.app/docs/overview/)）。**E2**=本项静态设计判断，所有新业务功能均E2；**E3**=本仓库浏览器集成/性能未实测，40项全部仍E3。不是“官方库支持浏览器”就证明本工具完成。

**技术分类A/B/C/D：** A现成浏览器JS库可采用；B现成浏览器WASM（仅复用已有FFmpeg）；C原生项目理论移植但无核实browser build，D服务/Node/Python/数据库/模型API完整形态。C/D不计40。promptfoo/DeepEval/Ragas/Langfuse/GetCito只参考工件/流程，不作为本期依赖；Remotion自定义许可、SubtitleEdit/ExifTool/Storyboarder/Nomi宿主/许可边界保留原mapping，不在这里改写为浏览器库。

**全部条目的本地/三端契约：** 用户手填或显式选择CSV/JSON/JSONL/TXT/字幕/本地媒体，浏览器处理并下载工件；不请求URL/账户/自动采集，不执行导入代码/HTML/表达式。Web/Chrome全页/VSCode webview只用浏览器能力，无宿主Node。移动指移动Web，非手机安装MV3：单列编辑、分页预览、可取消分批处理/导出是主流程；大媒体可提示用小样/桌面，不能暗中上传。八语`zh-CN/en/ja/ko/de/fr/es/pt-BR`覆盖空态、错误、说明、未知/规则版本；不意味着自动八语翻译/OCR/语义识别。每行的具体风险/验收补充此公共契约。

## 3. 本期40个独立新增工具

下列均为建议独立注册的新任务；编号是本期编号，旧候选ID仅追溯。输出是未来可保存交付物，不是本轮已生成的业务结果。表内每项都遵守第2节离线/许可/三端契约。

### 3.1 GEO / AI增长（8项）

| 编号 / 拟定tool-id / 用户 | 日常任务：输入→本地处理→可保存输出；下一步决策 | 技术 / repo / 许可 / 已有依赖 | 独立性、风险与未来验收；估计 |
|---|---|---|---|
| **01 GEO意图/问题面板**<br>`geo-question-panel`<br>GEO策略/AI增长 | 自有问题CSV/手填及来源→稳定ID、语言/受众分层与冻结版本→panel.json/CSV。**下一步：**决定采哪些问题、补哪些真实来源。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**text-lines只去重，不能冻结观测分母；不同措辞不自动合并。**边界/验收：**不生成问题/回答；验收：v2加题不改变v1，往返保留来源/ID。**M**；来源R1/R3；追溯G01。 |
| **02 AI回答提及/引用快照分析**<br>`ai-answer-snapshot`<br>GEO分析师 | 合法取得的回答TXT/CSV/JSON及引用列→别名候选匹配、人工确认引用/unknown→逐回答证据CSV/JSON。**下一步：**决定补录歧义或纠正品牌资料。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**URL解析不识别回答级提及/引用证据；区别03的多次观测。**边界/验收：**私密对话脱敏，不抓聊天页；验收：提及无引用、引域未提品牌、无法判断三类分开。**M**；来源R1/R3；追溯G05。 |
| **03 AI可见度重复观测面板**<br>`ai-panel-observations`<br>AI增长/品牌分析 | 冻结面板+重复观测/失败记录→按产品、模式、日期分层与分母核算→coverage.csv/观测摘要JSON。**下一步：**决定补采还是有条件比较。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**不是02单回答解析，也不是市场占有率/实时监控；原G08并为此处比较视图不多计。**边界/验收：**一次回答不稳定，API/UI不混；验收：计划10次、回答8次、提及4次分别列8/10和4/8。**M**；来源R3；追溯G07。 |
| **04 品牌实体事实一致性检查**<br>`brand-entity-consistency`<br>品牌/跨境内容运营 | 人工实体别名、属性、地区/币种、有效期及来源表→同条件事实冲突规则→冲突CSV/JSON。**下一步：**决定哪份自有资料需更新。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**json-viewer呈现结构，不识别实体属性冲突；不做知识图谱或自动消歧。**边界/验收：**人工确认别名；验收：US USD99与DE EUR109不冲突，同期同地区99与129标两来源。**M**；来源R1/R3；追溯G03。 |
| **05 主张、引用与新鲜度台账**<br>`claim-evidence-ledger`<br>AI编辑/事实审校 | claim、摘录、来源、证据文件ID与复核日→支持/反驳/待核/过期关系→ledger.json/CSV。**下一步：**决定复核、补证还是暂不发布。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**notepad无claim-source多对多/版本/复核状态；不是离线事实验证。**边界/验收：**引用不等于支持；验收：2023材料支持2026价格时待核，不显示自动判真。**M**；来源R1/R3；追溯G04。 |
| **06 GEO内容改版实验包**<br>`geo-change-experiment`<br>GEO内容策略 | 改版版本/处理组/对照/问题版本与合法观测→登记假设、条件、缺失与描述性对比→experiment.json/复盘Markdown。**下一步：**决定继续采样、回滚或下一轮实验。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**diff只比较文本，03只统计观测；此处锁定干预、对照与变更证据。**边界/验收：**改前后不等于因果；验收：同时更换模型/问题面板必须标不可比，不给提升保证。**M**；来源R2/R3；追溯G06。 |
| **07 竞品引用来源差距图**<br>`citation-gap-map`<br>GEO竞品/内容研究 | 多品牌回答引用表+人工域名归属/主题标签→来源-品牌-问题图与缺失机会→gap.csv/图数据JSON。**下一步：**决定优先补哪类自有证据/内容。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**不再做一个03分组计数器：输出来源归属/主题覆盖及行动清单，不承诺可购买引用。**边界/验收：**仅导入已获得数据；验收：同域共享引用与同名品牌分开，unknown归属不算竞品独占。**M**；来源R3；追溯G09。 |
| **08 AI搜索访问前提审计**<br>`geo-access-evidence`<br>技术SEO/GEO | 用户导入robots.txt、测试UA/URL及手填响应头/页面控制字段JSON→规则路径解释与前提冲突→audit.json/CSV。**下一步：**决定请求站点维护者复核哪条控制。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**不是HTML formatter；联合访问证据/UA规则而非拆robots、schema多个卡。**边界/验收：**不请求URL、不导任意HTML、不验证站点真实可达；验收：最长匹配/同长allow、%编码有反例，缺HTTP证据记unknown；schema/llms.txt不保证入选。**L**；来源R1/R4；追溯G02。 |

### 3.2 AI内容 / Agent工作流（8项）

| 编号 / 拟定tool-id / 用户 | 日常任务：输入→本地处理→可保存输出；下一步决策 | 技术 / repo / 许可 / 已有依赖 | 独立性、风险与未来验收；估计 |
|---|---|---|---|
| **09 证据驱动内容Brief**<br>`evidence-answer-brief`<br>AI内容策略/编辑 | 问题ID、受众、人工要点、证据台账→要求-证据映射与缺口登记→brief.md/JSON。**下一步：**决定补材料还是交给写手。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**不是notepad模板换皮：有要求覆盖/证据引用完整性、版本与缺口对象；不自动生成正文。**边界/验收：**不伪造事实/引文；验收：无来源要求保留缺口，证据删除后相关要点变待核。**M**；来源R1/R3；追溯E02。 |
| **10 本地引文逐字核对**<br>`source-quote-verifier`<br>AI编辑/研究助理 | 引文+用户粘贴的来源原文/定位→精确与明确归一化匹配、断章省略提示→quote-check.csv/JSON。**下一步：**决定更正引文或人工重读上下文。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**05追踪支持关系，此处重跑可复现字符/定位匹配；不把diff当语义核查。**边界/验收：**无语义判真，不自动读PDF/联网；验收：数字被改必须不匹配，省略号不冒充完整原句。**M**；来源R1；追溯扩展：编辑可复现校对。 |
| **11 Agent样本与确定性规则评测**<br>`agent-eval-cases`<br>Agent QA/工作流运营 | case、已有输出、固定字段/JSON路径/字符串/受限regex规则→包内worker判定→results.csv/cases.jsonl/版本包。**下一步：**决定哪些回归需要开发者修复。 | JS/TS＋[fflate](https://github.com/101arrowz/fflate) MIT/已有（ZIP复用） | **去重：**agent/system-prompt-linter不管理输出回归工件；不执行Agent，也不假称完整JSON Schema引擎。**边界/验收：**日志脱敏，regex限时可终止；验收：坏JSON invalid、缺材料unknown、违反规则fail、超时未完成，不冒充通过。**M**；来源R5；追溯A01。 |
| **12 Agent轨迹与资源复盘**<br>`agent-trace-review`<br>Agent运营/QA | 自有事件JSONL、调用ID/父子/时间/人工费率→时间线、重试/失败/资源对账→timeline.json/issue.csv。**下一步：**决定定位哪个步骤/重试链。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**api-cost-estimator只估单项费用；此处跨事件因果链/缺失记录，不执行任何动作。**边界/验收：**乱序/缺事件/时区不能编补；验收：重试不同attempt分开，费率未知显示unknown；权限判断只人工备注不另拆工具。**M**；来源R5；追溯A02。 |
| **13 输出盲评与人工校准**<br>`blind-output-review`<br>AI编辑/Agent评审 | 多版本已有文本、rubric、人工评分→可复现匿名顺序、揭盲/分歧统计→review.json/CSV。**下一步：**决定人工偏好差异需何种复核。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**diff是文本变化，随机抽签无评分/匿名映射；不自动judge，也不新增媒体盲评换皮卡。**边界/验收：**本地操作者可见源数据，不是安全匿名系统；验收：相同seed可重建顺序，揭盲前UI不显示版本标签。**M**；来源R5；追溯A03。 |
| **14 Agent工作流静态预检**<br>`agent-workflow-preflight`<br>Agent设计/运营 | 手填/导入自有节点-边-终点-访问预算图JSON→环/不可达/无界重试及已声明约束检查→graph-audit.json/CSV。**下一步：**决定补终止条件还是修改人工审批路径。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**不是mcp-config-builder/agent-tool-def：检查声明图结构，不生成配置或推断代码真实行为；不拆12授权子功能。**边界/验收：**不执行条件表达式，不宣称适配全部框架/安全保证；验收：A→B→A无上限标循环，缺边终点unknown。**L**；来源R5；追溯扩展：运行前结构检查。 |
| **15 评测集划分与泄漏检查**<br>`eval-dataset-splitter`<br>Agent QA/AI数据运营 | 带样本ID/来源组/标签的自有CSV/JSONL→组约束、确定性seed划分、精确重复/冲突检查→train-dev-holdout文件/manifest。**下一步：**决定隔离哪些来源与污染样本。 | JS/TS＋[fflate](https://github.com/101arrowz/fflate) MIT/已有（ZIP复用） | **去重：**text-lines不能组级划分/保持holdout；11消费样本评测，此处产出可冻结数据分区。**边界/验收：**不做embedding语义去重；验收：同conversation组不跨区，同seed重现，近义句仅待人工。**M**；来源R5；追溯扩展：A01数据治理。 |
| **16 多语文案LQA检查**<br>`localization-lqa`<br>AI本地化编辑/跨境运营 | source-target字符串表+术语/占位符规则→缺译、数字/链接/术语/占位符确定性核对→issues.csv/审核JSON。**下一步：**决定退回哪条翻译。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**不是case-converter/diff/word-counter；需跨语言资源ID、规则版本与审核状态。**边界/验收：**不评价语义翻译质量，不自动翻译；验收：源{name}译文丢失标错，规则词缺失是提示非机器判错。**M**；来源R1/R6；追溯扩展：8语内容交付。 |

### 3.3 全球营销 / 跨境（12项）

| 编号 / 拟定tool-id / 用户 | 日常任务：输入→本地处理→可保存输出；下一步决策 | 技术 / repo / 许可 / 已有依赖 | 独立性、风险与未来验收；估计 |
|---|---|---|---|
| **17 活动UTM链接治理**<br>`utm-builder`<br>全球营销/投放 | URL+命名模板/CSV→参数冲突选择/编码/批量治理→links.csv/差异JSON。**下一步：**决定统一链接后手工交投放。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**当前registry无UTM；url-parser已有通用query编辑/重建，仍无批量活动命名/必填/字典冲突契约。**边界/验收：**不发送点击验证、不放PII；验收：保留?x=1#hero，中文不双重编码，重复UTM可选择覆盖；同活动source大小写冲突/模板缺必填在批量issue定位。**S**；来源R7；追溯M01。 |
| **18 投放与跨境单位经济模型**<br>`campaign-unit-economics`<br>投放/跨境经营 | 自填花费/收入/毛利/退款/物流/汇率→ROAS/贡献利润/盈亏与敏感性→scenario.json/CSV。**下一步：**决定预算/价格测试。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**不拆ROAS、毛利、汇率成多个卡；api-cost-estimator只针对模型费。**边界/验收：**汇率/税/费率均人工版本输入，无实时行情或盈利保证；验收：零分母、退款与不同币种不混算。**M**；来源R8；追溯M02。 |
| **19 用户分群留存分析**<br>`cohort-retention-analyzer`<br>增长/产品营销 | 匿名user事件CSV、时区/首次事件/观察窗口→按首次事件分群、去重、成熟窗口→retention.csv/配置JSON。**下一步：**决定补观察还是改激活策略。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**CSV转换不处理cohort分母/未成熟格；区别20跨报表对账。**边界/验收：**无跟踪SDK、不反识别；验收：未来月份未成熟不是0，重复事件不增加用户数。**M**；来源R8；追溯扩展：原报表机会。 |
| **20 自有营销报表对账**<br>`owned-marketing-report`<br>投放/内容增长 | 自有广告花费/转化/订单CSV+人工字段映射→按活动、窗口、币种对账与差异说明→reconciliation.csv/映射JSON。**下一步：**决定修采集口径还是复核差额。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**excel-merge只合并；本工具验证join键、归因窗/币种/多对多，不伪造跨平台真归因。**边界/验收：**不接账号/API；验收：一对多join不放大收入，USD/EUR未给汇率不得合计。**M**；来源R8；追溯M03。 |
| **21 A/B转化结果分析**<br>`ab-test-analyzer`<br>增长实验/投放 | 独立两组成功数/试验数、预先设定检验方向→大样本两比例检验、差异/适用性说明→analysis.json/CSV。**下一步：**决定继续收数或人工复核。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**18算经营假设；06登记GEO改版不保证随机因果；本工具只二元独立实验的明确统计契约。**边界/验收：**小样本/多重窥视/非随机需警告，不做序贯或因果保证；验收：相同比例z=0，成功数>N拒绝，近似不适用不强报显著。**M**；来源R9；追溯扩展：原AB机会。 |
| **22 响应式广告资产预检**<br>`responsive-ad-asset-validator`<br>全球广告投放 | 广告组/标题描述/固定位置/必现声明+有日期的规则集→跨字段长度/固定冲突/重复与覆盖检查→asset-issues.csv/工件JSON。**下一步：**决定交审核还是补资产。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**word-counter只计数；此处资产组/必现声明/固定位置契约，不按平台模板拆多个卡。**边界/验收：**不预测Ad Strength/CTR或自动发布；验收：声明只固定在不保证展示位置必须提示，CJK双宽按所选规则。**M**；来源R10；追溯扩展：原广告文案机会。 |
| **23 跨境商品Feed审计**<br>`product-feed-auditor`<br>电商/Shopping投放 | 自有CSV/TSV Feed+目标市场/日期规则→必填、ID/变体关系、币种/GTIN格式及校验位→feed-issues.csv/修正建议JSON。**下一步：**决定修商品数据再手工提交。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**不是csv-formatter；有商品/变体/国家要求语义，不新增一个GTIN单功能卡。**边界/验收：**不检查远端图片/库存/GS1真实分配，不保证获批；验收：重复ID/缺币种/变体组冲突可定位，AI来源标签不能默默删除。**L**；来源R11；追溯扩展：原跨境商品机会。 |
| **24 多语站点Hreflang映射审计**<br>`hreflang-map-auditor`<br>国际SEO | 用户URL/语言/互指/canonical映射CSV→自指、回链、集群与冲突规则→issues.csv/建议映射JSON。**下一步：**决定修哪组语言关系。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**url-parser无多页面回链图；不是自动爬站或泛化HTML评分。**边界/验收：**不确认站点部署/Google采用；验收：A指B但B未回指报错，x-default不误当语言，语言规则注明版本。**M**；来源R6；追溯扩展：原国际SEO机会。 |
| **25 站点迁移重定向规划**<br>`redirect-migration-planner`<br>SEO/网站运营 | 旧URL→新URL/状态码映射CSV→循环、链、冲突、缺目标与路径保留检查→deployment-map.csv/审核JSON。**下一步：**决定修映射再交开发部署。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**url-parser只拆URL，http-status只查字典；此处导向图/迁移工件，不发送HTTP。**边界/验收：**不保证真实跳转/SEO保留，不生成可执行不受控配置；验收：A→B→A检测环，301/302与未知状态分开。**M**；来源R6；追溯扩展：原站点审计机会。 |
| **26 关键词意图与页面归属图**<br>`keyword-intent-map`<br>SEO/内容营销 | 合法自有关键词/人工意图与目标URL表→词面候选分组、人工确认归属/重叠→ownership.csv/缺口JSON。**下一步：**决定合并主题还是补页面。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**text-lines无关键词-意图-URL关系；01是问题面板观测契约，本项是站点页面内容规划。**边界/验收：**不获取搜索量/难度/排名，不用词面相似冒充语义；验收：同词不同地区可分组，双URL归属标人工选择。**M**；来源R1/R3；追溯扩展：原关键词机会。 |
| **27 促销叠加与到手价模拟**<br>`promotion-stack-simulator`<br>跨境运营/活动策划 | 购物篮、优惠顺序/门槛/互斥、手填运税/币种→逐步价格轨迹与边界反例→quote-cases.csv/规则JSON。**下一步：**决定修改活动规则还是交客服确认。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**18测经营利润；本项测试消费者结算规则，不把百分比/固定券拆独立工具。**边界/验收：**不是法律/税务合规或实时价；验收：100先减20再9折=72，逆序=70；币种精度和舍入步骤可追溯。**M**；来源R11；追溯扩展：原跨境活动机会。 |
| **28 客户反馈主题编码**<br>`review-theme-coder`<br>增长研究/电商 | 合法自有反馈CSV+人工taxonomy→人工/字面规则多标签、证据片段与分歧计数→coded.csv/主题问题清单JSON。**下一步：**决定修产品/说明还是补访谈。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**不是关键词频次/通用表格；保存片段-标签-版本-审核关系，不自动语义聚类。**边界/验收：**不抓评论/联系人、不推断情绪/敏感属性；验收：一条多标签不重复算总人数，未编码不是负反馈。**M**；来源R5；追溯扩展：原研究工作流。 |

### 3.4 音视频 / AI创作者 / 设计（12项）

| 编号 / 拟定tool-id / 用户 | 日常任务：输入→本地处理→可保存输出；下一步决策 | 技术 / repo / 许可 / 已有依赖 | 独立性、风险与未来验收；估计 |
|---|---|---|---|
| **29 AI分镜与生成版本本**<br>`ai-storyboard-variants`<br>AI视频创作者 | shot、人工prompt版本/模型名/参考与take记录→版本关系/单次改动/缺文件检查→storyboard.json/shot.csv/包。**下一步：**决定哪次生成值得保留或重试。 | JS/TS＋[fflate](https://github.com/101arrowz/fflate) MIT/已有（ZIP复用） | **去重：**notepad无shot-variant-take关系；不另拆提示词模板、Take数量作工具。**边界/验收：**不生成/下载模型，参考版权自核；验收：同shot只改camera可追溯，缺资产不联网补取。**M**；来源R5；追溯C01。 |
| **30 字幕时间轴工具箱**<br>`subtitle-toolkit`<br>字幕/视频编辑 | 本地SRT/基础VTT→时间校验/偏移/有限格式互转/纯稿→字幕文件/损失报告JSON。**下一步：**决定修时间还是交剪辑。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**当前registry无独立字幕编辑工具；FFmpeg可烧录但不校验/编辑cue；所有参数只算这一个工具。**边界/验收：**无ASR/翻译，复杂STYLE/REGION/voice保留原始或拒转；验收：59.900秒+200ms进位，重叠不一律当错误。**M**；来源R12；追溯C03。 |
| **31 素材来源与使用权台账**<br>`generation-take-ledger`<br>AI创作者/制片 | 资产/take、来源/许可文件/地区用途/期限与人工预算→使用范围/到期/缺证据关联→rights.json/clearance.csv。**下一步：**决定可提交审核哪些素材。 | JS/TS＋[PapaParse](https://github.com/mholt/PapaParse) MIT/已有（CSV复用） | **去重：**29管理创作迭代；此处资产-许可-用途多对多/期限/证据，非水印或元数据清除。**边界/验收：**不裁定版权归属/AI可商用；验收：仅社交许可不能自动扩到广告，unknown不标已授权。**M**；来源R11；追溯C02。 |
| **32 音视频交付规格预检**<br>`video-delivery-preflight`<br>视频剪辑/制片QC | 本地媒体+客户规格JSON→既有FFmpeg probe日志提取可得字段、逐项约束对照→preflight.csv/原始probe与规则版本JSON。**下一步：**决定退回转码还是交付播放验收。 | WASM＋TS：[ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm) wrapper MIT/core另审；已有（WASM复用） | **去重：**现有ffmpeg只给probe日志/变换；此处客户契约、多文件issue/unknown，不是新裁切/转码卡。**边界/验收：**不假设有ffprobe二进制/所有字段可读；验收：1080p源对720p合同报尺寸不符，解析不到声道记unknown，不自动转码。**L**；来源R13；追溯扩展：原媒体交付，非C04换皮。 |
| **33 音频电平与削波质检**<br>`audio-level-auditor`<br>播客/音频编辑 | 本地PCM WAV+窗口/阈值→TS读取样本、逐通道peak/RMS/DC/满幅计数→levels.csv/定位SVG。**下一步：**决定重录、调增益或人工听审。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**FFmpeg现有转换无此窗口化电平问题工件；不是另一个音频格式转换。**边界/验收：**仅明确PCM子集，无LUFS/true-peak/听感判断；验收：零样本RMS=0且dB负无穷可解释，满幅样本数量正确，损坏chunk拒绝。**L**；来源R14；追溯扩展：原音频编辑需求。 |
| **34 剪辑选段决策表**<br>`edit-decision-log`<br>剪辑/导演 | 多个源clip ID、手工入出点/FPS与排序→源范围/时间线累加/重叠和缺素材检查→cuts.csv/自有edit.json。**下一步：**决定交剪辑组哪些选段/补哪个源。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**FFmpeg start/end只导一个处理参数；此处多源到成片的可保存剪辑决策，不再数一个裁切工具。**边界/验收：**不输出未经验证CMX/AAF/XML或执行剪辑；验收：两段各3秒时间线6秒，in>out拒绝，不擅把VFR当固定FPS。**M**；来源R12/R13；追溯扩展：原媒体工作流。 |
| **35 音视频章节与节目说明**<br>`chapter-author`<br>播客/视频编辑 | 手工章节、时间点/标题/说明与本地时长→顺序/间隔/覆盖、人工编辑节目要点→chapters.csv/JSON/时间戳TXT。**下一步：**决定发布说明是否可用。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**字幕30是逐cue文本呈现；本项是章节导航/节目结构与说明关系，不只是字幕格式导出。**边界/验收：**不ASR/摘要/上传，不保证平台账号支持；验收：YouTube模式非00:00首章/少于3章/章长不足按版本规则提示。**M**；来源R12/R15；追溯扩展：原自媒体发布需求。 |
| **36 图片与关键帧选片板**<br>`visual-selects-board`<br>设计/剪辑/摄影 | 本地图像或用户已取出的关键帧+候选组→人工pick/reject/评分理由/选择版本→selects.csv/JSON/带编号联系表PNG。**下一步：**决定交付哪些画面给设计/剪辑。 | JS/TS＋[fflate](https://github.com/101arrowz/fflate) MIT/已有（ZIP复用） | **去重：**image-splitter切网格，imagemagick变换；新任务是候选评审状态/选择清单，不把尺寸/拼图参数算工具。**边界/验收：**不自动判美或取远端缩略图；验收：重排仍关联原asset ID，未评不当reject，图表与CSV编号一致。**M**；来源R11/R16；追溯扩展：原创作素材评审。 |
| **37 图像替代文本审核**<br>`image-alt-review`<br>设计/内容无障碍 | 自有图片、使用语境/用途与人工alt文案→装饰/功能/信息图人工决策树及缺项检查→alt-map.csv/审核JSON。**下一步：**决定补描述、标装饰还是专家复核。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**image-ocr识字不理解用途；此工具不是自动alt生成/图片转文字。**边界/验收：**不保证WCAG合规；验收：功能图标无目的描述提示，装饰图允许空alt，图中文字是否附近已有由人确认。**M**；来源R16；追溯扩展：原设计岗位。 |
| **38 设计Token一致性审计**<br>`design-token-auditor`<br>设计系统/品牌设计 | 本地tokens JSON及命名契约→有限DTCG类型/引用/循环/输出命名冲突检查→token-issues.csv/解析图JSON。**下一步：**决定修引用/单位还是交开发。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**json-viewer只展示，color-converter只转换；不新数一个调色板/对比度工具。**边界/验收：**仅声明子集，非W3C标准认证，不执行CSS/远程$ref；验收：a→b→a报环，大小写碰撞是输出警告不是原JSON非法。**L**；来源R17；追溯扩展：原品牌设计需求。 |
| **39 创作项目交接完整性审计**<br>`project-handoff-auditor`<br>制片/设计交付 | 需求manifest+用户显式选择的本地文件集合→文件ID/相对路径/引用/哈希/必交项核验→handoff-audit.json/缺项CSV。**下一步：**决定补文件/冻结版本后交接。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**hash-generator算摘要；此处验证交付契约/依赖/版本，不是ZIP打包换皮；32检查媒体内部规格，此处检查项目完整性。**边界/验收：**不读任意磁盘/导入ZIP不执行；验收：同名异内容、引用缺失、../路径冲突可见，文件没选记未提供非不存在。**M**；来源R11/R5；追溯扩展：原交付包机会。 |
| **40 配音脚本时长与录制排期**<br>`voiceover-timing-planner`<br>口播/播客/短视频创作者 | 分段脚本、人工校准语速/停顿/目标时长→字词单位选择、各段估算/累计cue与超时差→recording-cues.csv/JSON。**下一步：**决定缩稿、延长镜头还是安排补录。 | JS/TS原生/自研；无新增第三方库；沿项目现有许可（Native） | **去重：**word-counter只字词统计；本项管理分段起止/配音停顿/目标时长预算与版本，不另拆提词器模板。**边界/验收：**不TTS/ASR、不声称真实读秒；验收：120词/120词每分钟+5秒停顿=65秒，语言单位/语速未知不猜默认。**M**；来源R14/R15；追溯扩展：原口播创作需求。 |

## 4. 为什么这些是40个，而不是增强/组合凑数

独立性不是一个slug就证明：每项应有独立任务入口、输入契约、保存工件与验收；共用CSV/表格/worker不损害独立性，但只包旧功能不能算新交付。

| 易混项 | 明确边界 / 不另计什么 |
|---|---|
| 02 / 03 / 07 | 单回答证据、重复观测口径、来源归属/主题差距的决策工件各异；跨产品比较合入03，**原G08不另计**；02内不同解析格式不算多个工具 |
| 05 / 10 / 09 | 事实支持台账、逐字引文核对、需求-证据brief；10不判事实，09不生成内容；不是三个事实评分器 |
| 11 / 12 / 14 / 15 | 已导入输出规则评测、事后事件复盘、运行前声明图预检、holdout数据隔离；14是自有声明图格式，**不是把旧A04参数/确认策略增强换名**；12不再拆权限/成本卡 |
| 18 / 27 | 经营贡献利润情景 vs 消费者优惠叠加/结算反例；币种/百分比/国家模板不能另算工具 |
| 17 / 22 / 23 | 链接治理、广告资产组契约、商品Feed语义，均不只是CSV转换/字数计数；平台规则模板数量不计工具 |
| 29 / 31 / 34 | 生成创作版本关系、素材许可使用范围、已有clip的剪辑决策表；不是把prompt/take/镜头数量拆卡 |
| 30 / 35 | 字幕cue的时间/文本编辑 vs 人工节目章节/导航与说明；章节用同一时间解析器不等于另造字幕转换器；不得仅把SRT转成时间戳就宣称35完成 |
| 32 / 39 | 媒体内部编码/尺寸等合同质检 vs 项目文件/引用/版本的完整性；前者不自动转码，后者不只是ZIP/哈希包装 |
| 36 / 13 | 人工选片/联系表/交剪辑的选择工件 vs 文本生成输出的匿名rubric评审；不按评分模板/媒体格式继续拆工具 |
| 38 / 40 | Token引用/命名图审计 vs 色彩转换；配音分段时间预算/录制cue vs word-counter。若最终只有色彩/字数旧结果，就不能计入本期完成数 |

### 原26候选与早期12选型的去向

- 原26中的**18项原新增任务保留到40版**：G01/G02/G03/G04/G05/G06/G07/G09；E02；A01/A02/A03；C01/C02/C03；M01/M02/M03。本文编号与旧ID对应在每行追溯。
- 原G08并入03视图不另注册；G10官方AI报表适配仍后续，缺真实官方导出schema，不能用任意CSV解析冒充完成。M04仍组合导引不算新增。
- 原E01/E03/A04/C04/C05仍按增强计，见下表。其余22项为从原研究工作流延伸的独立任务设计（每行“扩展”），不是声称22个产品有已验证需求规模。
- 早期12是“9新＋3增强”的局部技术选型，**不是本期总量**。那9个新增任务都保留（01/02/03/04/05/11/17/29/30）；3个增强移到不计数区。现在40个新增是完整本期建议，分批交付不是只做首批10/12。

### 已有增强 / 复用组合：单独列表，全部不计40

| 原项 / 现有目标 | 建议增强 | 技术 / 开源 / 许可 | 为何不计新增 |
|---|---|---|---|
| E01 → `diff-checker` | AI稿数字/链接/限定词变化与版本审核 | [jsdiff](https://github.com/kpdecker/jsdiff)，[BSD-3-Clause](https://github.com/kpdecker/jsdiff/blob/master/LICENSE)，已有 | 是现有diff模式，不另挂新卡 |
| E03 → `word-counter`/事实台账联动 | 发布审核状态/人工披露与证据交接 | 原生TS＋既有组件，项目许可；无新库 | 原研究已定义为增强，不能换名计新增 |
| A04 → `agent-tool-def`/`agent-instructions` | 动作定义的人工确认/作用域提示 | 原生TS；不引运行器；项目许可 | 仍是定义侧能力增强，不冒充新安全系统 |
| C04 → `ffmpeg` | 短片任务向导/取消/清理/格式与字幕水印验收 | 既有[ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm)，wrapper MIT，core/codec另审 | 裁切/抽音/拼接/字幕烧录已是旧引擎功能或参数，不各算新工具 |
| C05 → `image-resizer`/既有图像能力 | 多尺寸素材、封面预览与交付包 | Canvas＋已有fflate/MIT；必要时已有[Magick WASM](https://github.com/dlemstra/magick-wasm)，[Apache-2.0包](https://github.com/dlemstra/magick-wasm/blob/main/LICENSE)，底层另审 | 图像尺寸/格式/水印/组合不单注册凑数 |
| M04 / OCR / PDF / 转换器 | 数据交接导引、用户先从原工具提取材料 | 既有Tesseract/PDFium/CSV/ZIP等；不新增引擎 | eng+chi_sim仅既有OCR两语，不是ASR/八语OCR；Pandoc仅Web、不纳Chrome |

## 5. 全浏览器本地技术、安全和许可闸口

此处复用前轮已核实事实，不重新抓25仓库。要区分“依赖有浏览器发行”与“应用已离线可用”：**本轮没有运行任何浏览器/构建。**

### 5.1 包内执行与MV3

- 所有执行JS/chunk/worker/WASM与必要字体/数据随扩展包离线交付；可懒加载包内资产，不能默认CDN或首次下载模型。Web需事先完整缓存资源，不能把第一次在线访问叫断网首用。Chrome RHC规则包含JS/WASM：[官方说明](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code)。
- 既有[manifest](https://github.com/SimpleAI2026/SimpleTools/blob/9378d49dd1d5aaddd23857d51d63c21830f3c6b2/chrome-extension/manifest.json)为MV3、permissions空、`script-src 'self' 'wasm-unsafe-eval'; object-src 'self'`。wasm-unsafe-eval不是JS eval/Function许可；不加unsafe-eval：[CSP官方文档](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)。本轮不改manifest，不增加all_urls/cookies/debugger/录屏/麦克风权限。
- 重任务运行在扩展**全页文档＋包内Dedicated Worker**，关闭页面时中止/说明未保存；不依赖popup长驻或后台service worker保活：[生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)。VSCode仅webview，不偷用宿主Node/CLI。
- 既有FFmpeg engine的toBlobURL和fflate上游[`src/worker.ts`](https://github.com/101arrowz/fflate/blob/master/src/worker.ts)的Blob worker是已发现的静态CSP风险，不是已确认故障/已修好。优先包内实体worker/本地core URL；ZIP在实体worker用同步API，或小数据受限同步，避免直接假定异步Blob-worker已兼容。对32、11/15/29/36导出同样适用。源码offlineUrl不能证明发布包资产完整。

### 5.2 内存、codec与AI边界

- 固定既有单线程FFmpeg core；threads要SAB/隔离，现manifest无COOP/COEP，不假定可用；SIMD与线程不同，不宣称同一二进制自动fallback。仅随包有非SIMD发行物且验证后才能降级。详情沿用旧选型第4节的Chrome COOP/COEP、Emscripten/V8来源。
- 32只消费现有probe可得日志与用户合同，不假设存在ffprobe/WASM新组件；容器/codec/FPS/音轨有缺失就unknown，必须保留原始证据、规则/解析版本；不能把所有unknown报通过。损坏/超限文件可失败，产品验收仍需支持明确样例与错误解释。
- 33的可靠基线是明确支持的PCM RIFF/WAV（建议先16/24/32位有符号PCM及32位float，逐一类型守卫/测试；不支持RF64/ADPCM时拒绝并说明）。DataView读取chunk边界/WORD padding；峰值/RMS/满幅不是LUFS/true-peak，不能偷换术语。可选浏览器解码能力只探测，不默认为所有压缩格式可解；用户可先用**已有**FFmpeg转WAV，该转换不重复计工具。
- 限输入行数/字节/字段深度/单元格长度/worker预算，阈值要实施实测，不捏造统一MB。MEMFS/解码帧/Uint8Array/输出Blob/ZIP多次拷贝会叠加；串行、分批、取消、释放ObjectURL/worker与MEMFS，不能让用户以为零拷贝。媒体预览和产物播放受浏览器codec限制，解出Blob不等于可播。
- 不加LanguageModel下载、onnx/transformers模型、大模型/ASR/TTS/LLM judge；不移植Python/Node/桌面全应用；不采SEO实时排名/量、AI引用或广告/联系人数据。API模拟不等于真实AI搜索产品；不保证GEO排名/引用，不把schema/llms.txt当入选凭证。

### 5.3 导入导出和隐私

- CSV引号/BOM/编码/公式注入；导出对`= + - @`等危险表格前缀提供安全策略与原文保留选项，不默默改变ID/数字。JSON/JSONL限制深度、拒危险原型键、逐行错误定位，不把JSON值当脚本/模板。不要运行用户JS/表达式或外部schema自定义keyword。
- 正则在可终止的包内worker，限制长度/语法/flags与时间预算；超时是未完成，不算pass。`AbortController`本身不能打断同步灾难性regex，必须能terminate worker。统计计算同样有限时/数值边界。
- 任意HTML/Markdown/SVG导入内容当文本；不把它插入DOM/加载资源，不用“DOMParser inert”冒充禁网。图片仅明确支持的本地位图或受控解码；不渲染可执行SVG/外链，不开远端字体。需要后续HTML支持必须另审sanitizer与资源隔离，不纳本轮默认能力。
- 本期ZIP主用于导出，不新增导入任意ZIP/自动解压执行的路径；39先显式选择本地文件集合，检查相对路径/引用而非扫描磁盘。ZIP导出路径规范化、防穿越/重复名/大包OOM；输出不夹带未经用户选择的原始私密文件。
- 默认会话内处理、显式选择保存与清除；IndexedDB/下载不保证物理擦除/加密或多用户隔离。财务、对话、订单、评测日志先脱敏，批量导出明确包含哪些字段/文件。零网络不等于可忽视隐私/版权。
- 31只是证据/范围记录，37只是辅助决策树，38是DTCG有限子集，21是明确假设下统计；均不做法律/合规/语义真伪/安全认证保证。原论文实验提升也不能外推为业务效果。

## 6. 本期实现批次：4×10＝40（仅计划）

分批是控制共享工件与性能风险，不把本期缩回10/12。所有批次合计40个独立新增；增强不占批次数。每项可单独导入示例文件，不强制先用另一个卡，也不建通用工作流编排引擎。下列编号仅对应第3节。

| 批次 | 精确10项 | 阶段目标 / 可独立验收的结果 |
|---|---|---|
| B1 文件证据/创作骨架 | 01、02、03、05、09、11、17、29、30、31 | GEO问题-证据-观测与case闭环；字幕/分镜/权利、活动链接均能本地保存和重开；无需媒体WASM |
| B2 对照/审校/复盘 | 04、06、07、10、12、13、15、16、20、26 | 事实冲突、实验、来源差距、逐字核对、人工盲评、holdout/LQA和报表/内容规划有各自问题工件 |
| B3 全球营销/跨境规则 | 08、18、19、21、22、23、24、25、27、28 | robots解释/财务/留存/两比例/广告/Feed/多语站/迁移/促销/反馈，固定日期规则与反例可复算 |
| B4 媒体与交付工程 | 14、32、33、34、35、36、37、38、39、40 | 静态图预检、媒体/WAV质量、剪辑/章节/选片、无障碍/Token/项目交接/配音；资源/CSP/内存闸口逐项过 |

### 接入点与每批验收策略

- **建议新建（未创建）：** 每个唯一tool-id对应`src/tools/<tool-id>/{index.vue,logic.ts,logic.test.ts,messages.ts}`，按现有ToolMeta注册；`src/registry/index.ts`已glob各工具组。可建议新建`src/registry/tools/growth-workflows.ts`、`creator-workflows.ts`等分组文件，但**category只能先用现有合法枚举**，不假设marketing/GEO category已存在；也可向已有组追加，实施计划再决定。
- **已核实复用点：** `src/lib/csv.ts/zip.ts/download.ts`、i18n messages发现机制；FFmpeg `src/tools/ffmpeg/engine.ts`已有ensure/run/terminate。32不得直接使用未经版本化的日志正则当稳定API；应先定义自己的“已提取/unknown/invalid＋原文出处”工件，测试源日志变动，不伪造现成probe JSON接口。
- **建议的共享边界：** schema_version、稳定asset/question/case ID、来源/采集模式/时间/语言、字段缺失与invalid/unknown、导出manifest。逻辑至少有两个真实调用才抽共享模块，不为40项搭大框架；工件兼容先CSV/JSON文件交接，不假设现成跨卡事件总线。
- 每批先固定合成/脱敏样例→写表内正反例的纯逻辑测试→小型浏览器导入/编辑/保存/重开→恶意输入/取消重跑→八语/三端/手机小样→新profile断网资源检查。**这是未来测试策略，不是本轮测试结果。** 不写几十页实现代码，不在本轮运行测试/构建。
- 01–08验证提及/引用/unknown、API与产品UI口径、源版本和分母；11–16验证case/holdout/匿名映射/日志泄漏、图循环与regex超时；17–28对零分母、币种/时区、独立抽样/小样本、广告双宽/固定、Feed版本、回链/循环用反例；29–40对字幕复杂格式、媒体未知字段、WAV损坏chunk、文件ID/权利/哈希/图片解码/时间基与大文件做反例。
- 八语逐一核对工具名、输入/错误/未知/许可提示；手机单列/触控/可读表、选择/导出/清除均需实测。35/34允许不支持codec时仅手动时间与文件信息，不让主编辑流程依赖播放；32/33最低支持的短小媒体样例必须实测，不以“去桌面”替代全部手机流程。

## 7. 来源与新增定向核实

统一采集2026-11-08 Asia/Shanghai。复用来源不冒称本轮重新抓取；新增官方链接本轮均取得可读正文，404不采用。官网/规范支持需求或技术机制，不证明新工具已实现/市场规模。GitHub库许可/日期详表保持原文件，未重拉25仓库活动或stars。

| 代码 | 真实来源 / 日期口径 | 支撑与限制 |
|---|---|---|
| R1 | [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)、[结构化数据政策](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)、[OpenAI crawlers](https://developers.openai.com/api/docs/bots)；复用原plan N01/N04/N05采集与文档日期 | 抓取/搜索资格/内容要求，不保证引用；不把训练bot与搜索bot等同，不代替真实网络检测 |
| R2 | [GEO原始论文](https://arxiv.org/abs/2311.09735)；复用原plan N09的版本/实验说明 | 对照与证据可借鉴，论文实验提升不是可复制业务ROI/排名承诺 |
| R3 | [Profound insights](https://docs.tryprofound.com/answer-engine-insights/about)、[Prompt Designer](https://docs.tryprofound.com/answer-engine-insights/prompt-designer)、[Peec sources](https://docs.peec.ai/understanding-sources)、[Peec metrics](https://docs.peec.ai/metrics/understanding-your-metrics)、[Ahrefs方法](https://ahrefs.com/blog/brand-radar-methodology/)；复用N10–N15 | 问题面板/来源/重复观测的真实产品流程；整个平台联网采样不纳本地依赖，不将竞品指标照搬成全球份额 |
| R4 | [RFC9309](https://www.rfc-editor.org/rfc/rfc9309.html)，本轮取得正文；正文版权2022，返回文本未显完整出版日期 | 最长/同长allow、分组与编码等测试机制；robots不是访问授权；按规范独立实现，不复制受其他许可约束示例代码 |
| R5 | [promptfoo](https://github.com/promptfoo/promptfoo)、[Langfuse](https://github.com/langfuse/langfuse)、[Label Studio](https://github.com/HumanSignal/label-studio)；复用已核实README/许可/活动日期，见原mapping | 样本/轨迹/人工标签等对象的流程参考，14/15/28/39具体本地产品形态是推演；不用完整服务代码/模型运行器 |
| R6 | [Google多语版本](https://developers.google.com/search/docs/specialty/international/localized-versions)，本轮正文；页面标更新2026-09-21，仅日期无时分，不虚构上海精确时间 | 自指/互指/绝对URL/语言与x-default；对16是跨语内容治理旁证，不证明LQA语义正确；25迁移图设计是机会推演 |
| R7 | [Google Analytics UTM规范](https://support.google.com/analytics/answer/10917952?hl=en)，复用原plan旧T01与M01已核实来源/日期 | 活动参数/归因治理；本工具不生成真实流量或归因 |
| R8 | [GA4 Cohort exploration](https://support.google.com/analytics/answer/9670133?hl=en)，本轮可读；未显更新日；另复用原M02/M03需求证据 | cohort纳入/回访、粒度/时区/计算口径；不宣称本工具等于GA设备身份口径/完整报表导出。经营模型和对账仍是本地产品推演 |
| R9 | [NIST两比例检验](https://www.itl.nist.gov/div898/handbook/prc/section3/prc33.htm)，本轮可读，未显更新日 | pooled z与大样本/独立假设；本期只该明确近似/适用性闸口，小样本不直接伪报显著，不实现序贯检验 |
| R10 | [Google响应式搜索广告](https://support.google.com/google-ads/answer/7684791?hl=en)，本轮可读，未显更新日 | 标题/描述组、固定位置/必现声明/双宽等真实约束；采用有日期规则，不引用页面营销提升百分比作本工具效果 |
| R11 | [Merchant Center产品数据规范](https://support.google.com/merchants/answer/7052112?hl=en)，本轮可读，未显更新日 | ID/变体/币种/商品来源标注与资产权利；页面明确AI图像来源元数据应保留。27/31/36/39为相关工作流推演，不是全球合规认证 |
| R12 | [WebVTT规范](https://www.w3.org/TR/webvtt1/)，本轮可读；Candidate Recommendation Draft 2026-05-20 | 字幕/章节、复杂STYLE/REGION/voice与时间语法；未成最终Recommendation，不声称自研完整兼容 |
| R13 | [FFmpeg浏览器发行概览](https://ffmpegwasm.netlify.app/docs/overview/)，复用上轮可读证据；本轮窄读SimpleTools engine/logic/UI证据见第1节 | 现成browser WASM，不是证明32的日志解析/质量规则或每个codec已验证 |
| R14 | [MDN Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)、[Microsoft RIFF/WAV](https://learn.microsoft.com/en-us/windows/win32/xaudio2/resource-interchange-file-format--riff-)，本轮可读；正文未显更新日 | 浏览器样本处理/RIFF chunk与WORD padding；33/40具体电平/脚本时长工具是设计判断，不把RMS当LUFS |
| R15 | [YouTube章节](https://support.google.com/youtube/answer/9884579?hl=en)，本轮可读，未显更新日 | 手工时间戳/首章/最小章数/长度及账号可得性；不自动上传、不保证账号支持 |
| R16 | [W3C WAI alt决策树](https://www.w3.org/WAI/tutorials/images/decision-tree/)，本轮可读，未显更新日 | 图像用途/装饰/功能/上下文的人工审核依据；36选片产品形态是推演，不是WAI推荐选片工具 |
| R17 | [DTCG Format 2025.10](https://www.designtokens.org/TR/2025.10/format/)，本轮可读；Final Community Group Report 2025-10-28 | Token结构/类型/引用/循环；社区报告明确不是W3C Standard，首期支持子集必须声明，不远程解析ref |

上轮关键技术官方来源仍有效：Chrome CSP/RHC/SW/COOP/COEP、Emscripten线程、V8 SIMD、Tesseract本地路径、WebCodecs/DOMParser详见历史12选型第8节。本轮猜测的FFmpeg `/docs/usage/`返回404，**丢弃不作推荐来源**，继续用已核实overview/既有源码；没有绕过连接器失败/认证限制。未引入新公开repo硬依赖，因此没有未核实许可证库塞入40。

## 8. 仍未验证与交付状态

- **证据覆盖已做：** 新鲜registry 131唯一slug（Chrome130）、40建议唯一slug无重名；每项有任务/工件/决策/技术/独立性/风险/验收/估计；18旧新增＋22工作流扩展；4批每批10项；5个旧增强及组合区不计数。机器核验记录见`40-browser-local-tools-document-verification.json`，不是仓库测试。
- **未验证边界：** 工具独立入口的实际使用频率/付费价值；真实合法导出样本与多语规则；GEO观测稳定性/实体歧义；NIST数值实现/抽样假设；robots完整规范反例；媒体probe可提字段与codec；WAV子集；DTCG子集；CSP/打包完整性/性能/手机阈值/字库；任何法律意见。明确的子集与unknown策略属于建议契约，不把未测写成通过。
- **范围保护：** 40是本期推荐新增目标，任何一项若实施时只得到旧工具同义模式，不能算40完成；应补足本文独立契约，而不是通过加模板/格式/尺寸增加计数。增强可以同期做，但始终单列。
- **保存：** 本文`/workspace/deliverables/2026-11-08-40-browser-local-tools-plan.md`。原主plan当前结论/路线图已同步指向本文；早期12清单开头标历史被替代。原GitHub开源mapping不覆盖。改前备份为`2026-11-08-tools-expansion-research-plan.before-40-tools.md`与`2026-11-08-browser-local-tools-selection.before-40-tools.md`。
- **没有发生：** Mac访问/写入、源码/package/版本修改、依赖安装、构建、运行测试、任何联网采集/模型调用、commit/push/发布。仍是调研与计划，未实施。
