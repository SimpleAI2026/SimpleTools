# SimpleTools：GitHub开源项目映射与复用事实表

> **采集：2026-11-08 Asia/Shanghai（UTC+8）。调研与计划，未实施。** 本文对应主plan第13节，保持原26候选/GEO10项与首批10不变。没有克隆/下载代码包/装依赖/运行仓库，没有访问Mac、修改SimpleTools源码或版本、commit/push。所有仓库通过内置cursor-github公开读取，不借CLI或原始API补绕。

## 1. 怎么读这份表

- **逐项核实：** 25个仓库对象（URL、语言、默认分支、archived）、README、实际LICENSE/COPYING/已定位的分发EULA、默认分支首项commit。细分包/部署/standalone文档仅针对关键许可/运行时风险窄读。GitHub自动license字段是线索，不是最终授权判定；正文优先。
- **时间口径：** 下列时间均由GitHub commit的committer ISO时间转换为Asia/Shanghai，并链接到该确切commit。它不是作者时间、最近release、所有分支的最后活动或最后稳定版本。没有查询release就标“release未核实”，不把pushed_at代替commit。README/LICENSE为采集时可读快照，未为全部项目锁依赖版本；Nomi能力正文额外固定到已核实提交。未从图片名/徽章推断发布日期。
- **许可范围：** 20项被审范围有明确OSI许可，其中18项宽松许可、2项AGPL；Langfuse/FFmpeg另以2项分层核查；Remotion为1项source-available；Storyboarder/ExifTool为2项整体授权未解决。分类不等于法务意见，不把GPL/AGPL说成不能商用；相关复制/修改/网络服务/分发/NOTICE/源代码义务需按实际方案审查。`LicenseRef-*`为本文内部自定义标记，不是OSI批准的标准SPDX。
- **复用方式定义：** 依赖候选=未来选定版本后才验证包体、运行时、CSP、授权；数据/交互参考=不复制实现、不捆绑服务；现有引擎复用=只增强既有能力。模型API、外站抓取、云评测/追踪归C，文件导入本地分析归B；local-first/self-hosted/offline-eval都不自动等于A断网运行。
- **未核实的通用项：** 未安装或执行，所以不声称三端已兼容、无网络、零遥测、漏洞安全、性能通过；未遍历全部传递依赖/做SBOM，未确认商业服务当前价格/导出字段/API权限，未咨询法律。star没有被当质量或排序指标，本表不报星数。

## 2. 首批与全量映射索引

首批仍是G01/G05/G07/G04/C03/C04/G03/A01/C01/C05：1项已有适合、8项部分可用、1项未找到关键业务模块。全26项中1项已有适合、21项部分可用、4项未找到（G04/G06/G10/E03）；“未找到”仅指本次审查范围，不声称全球没有项目。全部项目及具体可复用单元已在主plan分组列出，下面保留简短核对索引。

| 候选 | 判断 | 本表项目ID |
|---|---|---|
| G01 | 部分可用 | OSS02, OSS03, OSS04 |
| G02 | 部分可用 | OSS01, OSS07, OSS05 |
| G03 | 部分可用 | OSS06, OSS01, OSS04 |
| G04 | 未找到经过核实匹配项 | OSS21, OSS13 |
| G05 | 部分可用 | OSS02, OSS03 |
| G06 | 未找到经过核实匹配项 | OSS08, OSS09 |
| G07 | 部分可用 | OSS02, OSS09, OSS03 |
| G08 | 部分可用 | OSS02, OSS09 |
| G09 | 部分可用 | OSS02 |
| G10 | 未找到经过核实匹配项 | OSS03, OSS01 |
| E01 | 部分可用 | OSS08, OSS05, OSS10 |
| E02 | 部分可用 | OSS02, OSS05 |
| E03 | 未找到经过核实匹配项 | OSS04, OSS20 |
| A01 | 部分可用 | OSS09, OSS10, OSS11, OSS12 |
| A02 | 部分可用 | OSS12, OSS10 |
| A03 | 部分可用 | OSS13, OSS12, OSS09 |
| A04 | 部分可用 | OSS04, OSS09, OSS10 |
| C01 | 部分可用 | OSS24, OSS18, OSS08 |
| C02 | 部分可用 | OSS24, OSS20 |
| C03 | 部分可用 | OSS14, OSS23, OSS15 |
| C04 | 已有适合 | OSS16, OSS17 |
| C05 | 部分可用 | OSS19, OSS16, OSS20 |
| M01 | 部分可用 | OSS25 |
| M02 | 部分可用 | OSS22 |
| M03 | 部分可用 | OSS03, OSS22 |
| M04 | 部分可用 | OSS03, OSS21 |

## 3. 25仓库事实与复用决策

以下每项采集日期均为2026-11-08 Asia/Shanghai，仓库/README/许可文件读取成功。`archived=false`仅为观察到的标记，不能替代维护判断。所有“浏览器可”均为文档/静态评估，未做构建实测。

### OSS01 · Advance-Labs/aeo-toolkit

- **完整仓库：** https://github.com/Advance-Labs/aeo-toolkit（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/Advance-Labs/aeo-toolkit/blob/main/README.md)。
- **许可 / SPDX范围：** Apache-2.0（公开核心；不覆盖私有托管平台）；分类：OSI。[核实文件 `LICENSE`](https://github.com/Advance-Labs/aeo-toolkit/blob/main/LICENSE)。
- **活动 / 归档：** [2026-11-08 10:47:34 Asia/Shanghai](https://github.com/Advance-Labs/aeo-toolkit/commit/0d3c6de7feb43f755a6866570e97d0f88baa1752)，默认分支`main`首项commit，SHA `0d3c6de7feb43f755a6866570e97d0f88baa1752`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G02, G03。完整monorepo的公开审计/爬虫/HTML提取/Schema校验包与Chrome扩展；可借meta/JSON-LD/robots检查单元，不是完整开源AI可见度SaaS。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript、Node工具链、React扩展；html-parser依赖Cheerio。公开parser声明无网络；爬虫/扩展的URL、robots/sitemap等请求需要网络。托管控制台、Google/Bing整合和MCP已移至私库。
- **能否浏览器离线：** B：导入HTML后的解析可研究；原扩展会向被审站点请求文件，不能叫完全离线。parser浏览器打包兼容性本轮未构建验证。
- **Web / Chrome / VSCode / 手机：** Web需验证Cheerio包与体积；Chrome不搬原host permissions，仍从手动导入起步；VSCode webview同样不能假定Node权限。
- **数据发送 / 授权 / 成本：** 本地parser不需要模型API/数据库；原扩展仅本地分析但有目标站点请求；托管MCP/API、OAuth/收费不在Apache公开代码保证内。
- **建议复用方式：** 部分包可作为未来依赖候选；更优先参考事实提取与规则解释，禁止照搬总分权重/入选保证。
- **不能直接复用的缺口：** 不采纳README把llms.txt当引用信号/AI版robots的普适说法，必须服从第2节Google/OpenAI机制证据；不能由“schema有效”推断真实索引/引用。
- **额外核实来源：** [packages/html-parser/package.json](https://github.com/Advance-Labs/aeo-toolkit/blob/main/packages/html-parser/package.json)。

### OSS02 · ai-search-guru/getcito-worlds-first-open-source-aio-aeo-or-geo-tool

- **完整仓库：** https://github.com/ai-search-guru/getcito-worlds-first-open-source-aio-aeo-or-geo-tool（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/ai-search-guru/getcito-worlds-first-open-source-aio-aeo-or-geo-tool/blob/master/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/ai-search-guru/getcito-worlds-first-open-source-aio-aeo-or-geo-tool/blob/master/LICENSE)。
- **活动 / 归档：** [2026-11-05 14:50:26 Asia/Shanghai](https://github.com/ai-search-guru/getcito-worlds-first-open-source-aio-aeo-or-geo-tool/commit/c2a055c3ccc27633e79e5f3f0d994c48e605eaba)，默认分支`master`首项commit，SHA `c2a055c3ccc27633e79e5f3f0d994c48e605eaba`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G01, G05, G07, G08, G09, E02。完整GEO应用：品牌/问题、提及/引用/竞品、报告、内容/增长任务；适合借观测对象与界面分工，不是浏览器解析库。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。Next.js/React/TypeScript、Node/Express/node-cron、PostgreSQL/Supabase Auth与Storage；README要求Node24及提供商账户。
- **能否浏览器离线：** 不能整套浏览器离线；自托管也要API服务/数据库。B可参考导出工件，C才考虑已授权接口。
- **Web / Chrome / VSCode / 手机：** Web只能做自己的本地导入器；Chrome/VSCode不捆绑Next/Express/Supabase，不导入service-role key。
- **数据发送 / 授权 / 成本：** 启用AI、数据库、分析/发布整合会向相应提供商发送内容；Gemini/Cloro等默认配置及采样有费用；README称产品分析/录屏关闭不等于模型调用不外传。
- **建议复用方式：** 仅产品/数据建模参考；未来导入/导出适配必须另取合法实际样本，不承诺现在兼容其版本化API。
- **不能直接复用的缺口：** 问题版本冻结、unknown分母、API≠UI、引用原文与采集来源仍按本plan另设；截图预览明确是占位指标，不拿作效果数据。

### OSS03 · mholt/PapaParse

- **完整仓库：** https://github.com/mholt/PapaParse（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/mholt/PapaParse/blob/master/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/mholt/PapaParse/blob/master/LICENSE)。
- **活动 / 归档：** [2026-10-28 00:53:10 Asia/Shanghai](https://github.com/mholt/PapaParse/commit/1fcb83c64acf61ae636b556b0eadeebaca0aea33)，默认分支`master`首项commit，SHA `1fcb83c64acf61ae636b556b0eadeebaca0aea33`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G01, G05, G07, G10, A01, M03, M04。CSV解析/反向生成库，支持浏览器本地文件与worker/分块；只是导入底座，不是GEO/广告报表语义。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript，浏览器/Node；本地模式无需服务器、数据库或模型。
- **能否浏览器离线：** A/B可；禁止开启download远程URL模式，离线打包worker与脚本。
- **Web / Chrome / VSCode / 手机：** Web/Chrome/VSCode可评估；Chrome worker路径/CSP与大文件主线程占用需测试，手机预览限行。
- **数据发送 / 授权 / 成本：** 本地文件无需发送；远程download模式会请求URL，不能默认开。处理PII/CSV公式注入，导出转义和原件区分。
- **建议复用方式：** 已有src/lib/csv.ts优先复用；只有不足且许可/包体核实后考虑依赖，不无故并装第二CSV栈。
- **不能直接复用的缺口：** 不提供品牌实体/事实判断、报表口径或版本管理；官网支持浏览器不等于本仓库三端已验收。

### OSS04 · ajv-validator/ajv

- **完整仓库：** https://github.com/ajv-validator/ajv（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/ajv-validator/ajv/blob/master/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/ajv-validator/ajv/blob/master/LICENSE)。
- **活动 / 归档：** [2026-04-24 21:46:21 Asia/Shanghai](https://github.com/ajv-validator/ajv/commit/f177fe323420ccb23e1a79445fd470cbf80aee7c)，默认分支`master`首项commit，SHA `f177fe323420ccb23e1a79445fd470cbf80aee7c`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G01, G03, G04, A01, A04, E03, C01。JSON Schema验证库；可校验本工具工件的字段/枚举/结构，不核实品牌事实或动作安全。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript/JavaScript，浏览器/Node；无需DB或模型API。
- **能否浏览器离线：** A可；正常compile使用Function构造器，严格CSP需要构建期standalone预编译固定schema，不在运行时编译用户schema。
- **Web / Chrome / VSCode / 手机：** Web/Chrome MV3/VSCode webview均按更严CSP设计；不建议为Ajv放开unsafe-eval。
- **数据发送 / 授权 / 成本：** 固定本地schema无需发送；禁用远程$ref/异步加载和不可信自定义keyword，限制输入复杂度。
- **建议复用方式：** 未来可作构建期依赖/导出的静态验证函数；小表单可沿用现有TS规则，先不要引入运行时编译。
- **不能直接复用的缺口：** 结构通过≠内容真实/授权已取得；不得把导入任意JSON Schema当执行代码功能。
- **额外核实来源：** [docs/standalone.md](https://github.com/ajv-validator/ajv/blob/master/docs/standalone.md)。

### OSS05 · mozilla/readability

- **完整仓库：** https://github.com/mozilla/readability（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/mozilla/readability/blob/main/README.md)。
- **许可 / SPDX范围：** Apache-2.0；分类：OSI。[核实文件 `LICENSE.md`](https://github.com/mozilla/readability/blob/main/LICENSE.md)。
- **活动 / 归档：** [2026-07-09 19:32:19 Asia/Shanghai](https://github.com/mozilla/readability/commit/ab4027a8b37669745016869a37a504727992b2ba)，默认分支`main`首项commit，SHA `ab4027a8b37669745016869a37a504727992b2ba`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G02, G04, E01, E02。HTML正文提取库，可产生textContent、标题/作者等候选；不等于通用SEO DOM、结构化数据提取或事实核查。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript；浏览器DOM可直接供解析，Node需额外DOM实现；不需DB/模型。
- **能否浏览器离线：** B可：用户HTML的隔离DOM副本，禁外部资源。Readability不是sanitizer。
- **Web / Chrome / VSCode / 手机：** Web/Chrome/VSCode导入可用；不因有扩展用途就加入activeTab；手机限HTML体积。
- **数据发送 / 授权 / 成本：** 本地解析无需发送；恶意HTML需额外安全处理，原页面与提取正文对照，保留被省略内容的风险提示。
- **建议复用方式：** 作为可选提取组件/行为参考，不替代现有HTML工具与人工claim取证。
- **不能直接复用的缺口：** 提取会忽略导航/表格等重要内容，G02仍需原HTML；不得用其输出判断抓取完整/证据支持。

### OSS06 · digitalbazaar/jsonld.js

- **完整仓库：** https://github.com/digitalbazaar/jsonld.js（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/digitalbazaar/jsonld.js/blob/main/README.md)。
- **许可 / SPDX范围：** BSD-3-Clause（LICENSE前言为非强制捐助期待）；分类：OSI。[核实文件 `LICENSE`](https://github.com/digitalbazaar/jsonld.js/blob/main/LICENSE)。
- **活动 / 归档：** [2026-03-05 00:43:17 Asia/Shanghai](https://github.com/digitalbazaar/jsonld.js/commit/7a93609e475edeebef372ba17ae8e3508b4a324f)，默认分支`main`首项commit，SHA `7a93609e475edeebef372ba17ae8e3508b4a324f`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G03, G02。JSON-LD expand/compact/flatten等语法与图结构处理；可统一@id/属性表示，不能自动完成现实世界品牌实体消歧。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript，支持浏览器/Node；不需DB/模型。
- **能否浏览器离线：** A/B有条件：使用本地已知context和受限documentLoader，默认远程context不能假定离线。
- **Web / Chrome / VSCode / 手机：** 三端均需本地context打包与体积评估；不请求额外Chrome域权限来“修复”context。
- **数据发送 / 授权 / 成本：** 远程context可能向第三方发请求/泄漏URL，需默认禁网；语义不明的词汇保持原始输入，不能静默丢字段。
- **建议复用方式：** 可选依赖；JSON-LD简单提取先用JSON.parse与显式规则，不为G03强建知识图谱。
- **不能直接复用的缺口：** 根metadata为NOASSERTION，但实际LICENSE明确New BSD 3-clause；捐助不是硬性商用费。不能把相同@id当事实无误。

### OSS07 · samclarke/robots-parser

- **完整仓库：** https://github.com/samclarke/robots-parser（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/samclarke/robots-parser/blob/master/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE.md`](https://github.com/samclarke/robots-parser/blob/master/LICENSE.md)。
- **活动 / 归档：** [2026-10-08 16:05:55 Asia/Shanghai](https://github.com/samclarke/robots-parser/commit/785195c5a6f996655c43049349d1445274b83a15)，默认分支`master`首项commit，SHA `785195c5a6f996655c43049349d1445274b83a15`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G02。robots文本对UA/path的本地规则判断与解释基础；不是HTTP抓取或真实索引检查。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript，README以Node用法为主；无需DB/模型/自带抓站。
- **能否浏览器离线：** A/B规则可离线；浏览器bundle和Node相关依赖本轮未构建验证。
- **Web / Chrome / VSCode / 手机：** Web/Chrome/VSCode先验证纯规则层；不把Node示例直接当webview可执行；手机文本输入可行。
- **数据发送 / 授权 / 成本：** 无须模型API/外站请求；如未来下载robots另属C并有URL/redirect/权限校验。
- **建议复用方式：** 候选依赖/测试语料参考；规则版本与UA策略必须符合实际Google/OpenAI系统，默认手填robots。
- **不能直接复用的缺口：** robots允许不验证WAF/CDN、抓取、noindex、引用；ChatGPT-User等用户请求不简单套搜索爬虫规则。

### OSS08 · kpdecker/jsdiff

- **完整仓库：** https://github.com/kpdecker/jsdiff（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/kpdecker/jsdiff/blob/master/README.md)。
- **许可 / SPDX范围：** BSD-3-Clause；分类：OSI。[核实文件 `LICENSE`](https://github.com/kpdecker/jsdiff/blob/master/LICENSE)。
- **活动 / 归档：** [2026-10-27 19:45:40 Asia/Shanghai](https://github.com/kpdecker/jsdiff/commit/8d706c8f2c17283d1061308113c95146a5118aa6)，默认分支`master`首项commit，SHA `8d706c8f2c17283d1061308113c95146a5118aa6`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** E01, G06, C01。字符/词/行/结构文本diff与patch库，可生成审稿/版本差异；不是事实核查或实验因果分析。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript，浏览器/Node；无服务/DB/模型。
- **能否浏览器离线：** A可；大输入设限/worker，人工处理语义差异。
- **Web / Chrome / VSCode / 手机：** 三端纯JS可评估；CJK词分割/Intl实现与移动性能需覆盖，不假定空格分词适合八语。
- **数据发送 / 授权 / 成本：** 本地无发送；恶意diff片段渲染转义。日志/草稿默认不持久化。
- **建议复用方式：** 优先复用既有diff-checker；不为E01/G06再引第二差异引擎，缺审稿分类在上层补。
- **不能直接复用的缺口：** 数值/限定词语义、claim引用和版本审核状态需要本产品建模；patch成功≠内容真实。

### OSS09 · promptfoo/promptfoo

- **完整仓库：** https://github.com/promptfoo/promptfoo（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/promptfoo/promptfoo/blob/main/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/promptfoo/promptfoo/blob/main/LICENSE)。
- **活动 / 归档：** [2026-11-08 03:12:54 Asia/Shanghai](https://github.com/promptfoo/promptfoo/commit/2a6fdf9b2e1600ffa2a204e70e9fea7cb0c14cff)，默认分支`main`首项commit，SHA `2a6fdf9b2e1600ffa2a204e70e9fea7cb0c14cff`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** A01, A03, A04, G07, G08。Node CLI/评测库/本地结果viewer，支持模型比较、assertion/回归与安全测试；不是浏览器内评测服务。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript、Node运行器与本地文件/缓存；执行模型/被测Agent需相应模型服务或API。
- **能否浏览器离线：** 其“本地运行”不等于断网：本地模型可无云推理，云provider会发送prompt；不能浏览器直接跑完整CLI。
- **Web / Chrome / VSCode / 手机：** 三端仅导入结果/编辑case的B工作流；不把Node运行器塞Chrome/VSCode webview或暗中启动宿主程序。
- **数据发送 / 授权 / 成本：** provider/judge/红队目标可能发网与计费、工具执行可有外部效果；分享/遥测/远端功能需配置核实。仅本地处理日志无需调用它。
- **建议复用方式：** 参考case/assertion/结果对比的工件概念；未来格式适配另核schema，不承诺当前导出的JSONL直接兼容。
- **不能直接复用的缺口：** 不把红队生成/攻击执行纳入A01；同一次API eval不证明消费者AI产品可见度；README“100% local”不能覆盖远程provider。

### OSS10 · confident-ai/deepeval

- **完整仓库：** https://github.com/confident-ai/deepeval（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/confident-ai/deepeval/blob/main/README.md)。
- **许可 / SPDX范围：** Apache-2.0；分类：OSI。[核实文件 `LICENSE.md`](https://github.com/confident-ai/deepeval/blob/main/LICENSE.md)。
- **活动 / 归档：** [2026-11-08 05:30:17 Asia/Shanghai](https://github.com/confident-ai/deepeval/commit/93b4b3063a0b5ab043b46375e591cfcf9ed0d43f)，默认分支`main`首项commit，SHA `93b4b3063a0b5ab043b46375e591cfcf9ed0d43f`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** A01, A02, A03, A04。主要Python评测框架：任务完成、工具选择/参数、参考集/轨迹和LLM judge指标；可参考维度，不照搬评分即真值。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为Python（不代表全部组成）。Python为主，README也出现JS整合示例，但本轮未核实独立浏览器运行包；API/本地模型与可选Confident AI服务。
- **能否浏览器离线：** 不直接浏览器离线执行框架；B可导入已授权日志/评测结果，A本地人工rubric另做。
- **Web / Chrome / VSCode / 手机：** Web/Chrome/VSCode仅自己实现文件分析与case编辑；不推荐将Python/Node评测引擎打包扩展。
- **数据发送 / 授权 / 成本：** LLM judge通常有推理费用/外传，登录Confident AI会记录case/trace；README本地NLP不保证全部模式不发送。
- **建议复用方式：** 仅参考工具正确性等人工rubric与最小样本字段；C执行/云追踪必须单独决策。
- **不能直接复用的缺口：** “幻觉”分数并非互联网事实核验；与人工确认校准。具体exports/SDK/telemetry defaults未全审。

### OSS11 · vibrantlabsai/ragas

- **完整仓库：** https://github.com/vibrantlabsai/ragas（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/vibrantlabsai/ragas/blob/main/README.md)。
- **许可 / SPDX范围：** Apache-2.0；分类：OSI。[核实文件 `LICENSE`](https://github.com/vibrantlabsai/ragas/blob/main/LICENSE)。
- **活动 / 归档：** [2026-02-24 15:47:18 Asia/Shanghai](https://github.com/vibrantlabsai/ragas/commit/298b68274234c060deacab3cf5fb52aa3a20e885)，默认分支`main`首项commit，SHA `298b68274234c060deacab3cf5fb52aa3a20e885`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** A01, A03, E01。主要面向RAG/LLM评测与测试集生成；上下文/回答/参考材料分离可启发样本字段。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为Python（不代表全部组成）。Python框架，模型/embedding服务按所选metric配置；不需强制采用其云平台但需相应运行环境。
- **能否浏览器离线：** 不能作为浏览器离线事实检查器；本地模型也另需模型文件/服务；B只导入工件。
- **Web / Chrome / VSCode / 手机：** 三端仅处理用户导入CSV/JSON；不安装Python，不借VSCode宿主偷偷运行。
- **数据发送 / 授权 / 成本：** 合成测试/LLM judge/embedding会消耗本地算力或API费；遥测/数据去向本轮未逐项配置审计，不能承诺零外传。
- **建议复用方式：** 方法和字段参考；本轮不接集成。原explodinggradients/ragas请求返回规范owner为vibrantlabsai，本文采用实际返回URL。
- **不能直接复用的缺口：** 检索上下文一致性≠现实事实真；README标coming-soon的某些agent模板不能当现成功能。

### OSS12 · langfuse/langfuse

- **完整仓库：** https://github.com/langfuse/langfuse（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/langfuse/langfuse/blob/main/README.md)。
- **许可 / SPDX范围：** MIT（非ee路径） + 自定义Enterprise许可（ee路径）；分类：分层。[核实文件 `LICENSE`](https://github.com/langfuse/langfuse/blob/main/LICENSE)。
- **活动 / 归档：** [2026-11-08 00:42:38 Asia/Shanghai](https://github.com/langfuse/langfuse/commit/b9529a9336d5854d5970b7b1c91b8d92a41db5dd)，默认分支`main`首项commit，SHA `b9529a9336d5854d5970b7b1c91b8d92a41db5dd`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** A01, A02, A03。完整LLM/Agent观测、trace、数据集与评测平台；适合参考run/span/observations与人工注释关系。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript/Node、Web服务/worker；仓库docker-compose明确PostgreSQL、ClickHouse、Redis、MinIO/S3；不是单页静态应用。
- **能否浏览器离线：** 自托管可控制部署，但不是浏览器纯离线；B导入合法trace/CSV/JSON，C未来才可接API。
- **Web / Chrome / VSCode / 手机：** 三端只做文件分析；不搬整个平台，不把SDK自动发trace作为默认；webview无后台服务。
- **数据发送 / 授权 / 成本：** trace可能含prompt/输出/PII/密钥；自托管实例也需审计出站；compose的TELEMETRY_ENABLED默认true；模型judge另有费用。
- **建议复用方式：** 仅数据对象/人工评审交互参考；禁止把ee目录当MIT。若复用代码需逐文件确认范围与第三方许可。
- **不能直接复用的缺口：** 根LICENSE不是全仓MIT；本地trace工具只读不执行日志中的操作；精确API适配待真实样本。
- **额外核实来源：** [ee/LICENSE](https://github.com/langfuse/langfuse/blob/main/ee/LICENSE)；[docker-compose.yml](https://github.com/langfuse/langfuse/blob/main/docker-compose.yml)。

### OSS13 · HumanSignal/label-studio

- **完整仓库：** https://github.com/HumanSignal/label-studio（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/HumanSignal/label-studio/blob/develop/README.md)。
- **许可 / SPDX范围：** Apache-2.0（所审开源版；不包含商业服务保证）；分类：OSI。[核实文件 `LICENSE`](https://github.com/HumanSignal/label-studio/blob/develop/LICENSE)。
- **活动 / 归档：** [2026-11-08 00:56:21 Asia/Shanghai](https://github.com/HumanSignal/label-studio/commit/6901e93759139b361d303064628b3ccc629d7069)，默认分支`develop`首项commit，SHA `6901e93759139b361d303064628b3ccc629d7069`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** A03, G04。完整多模态人工标注应用；参考标注任务、review/评分与导出，不把它当claim新鲜度台账。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。Python后端与JS/TS前端，服务和数据存储；常见SQLite/PostgreSQL部署，具体当前部署选项需实施前核对。
- **能否浏览器离线：** 自托管不是静态浏览器离线；B可利用有权导出的人工标注，A轻量盲评自己实现。
- **Web / Chrome / VSCode / 手机：** 三端不直接嵌整套服务；导入任务数据/离线审阅无新Chrome权限；手机长文本标注可桌面降级。
- **数据发送 / 授权 / 成本：** 远程素材URL、云存储/ML backend可能外传或产生费用；本地导出需脱敏和授权；商业版边界不能与Apache混淆。
- **建议复用方式：** 仅工作流/人工评审模式参考，不引入标注平台作为本地工具依赖。
- **不能直接复用的缺口：** 并未提供G04 claim→证据时效/矛盾处理的核实匹配；A03仍需本产品盲化/随机/版本日志契约。

### OSS14 · gsantiago/subtitle.js

- **完整仓库：** https://github.com/gsantiago/subtitle.js（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/gsantiago/subtitle.js/blob/master/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/gsantiago/subtitle.js/blob/master/LICENSE)。
- **活动 / 归档：** [2025-11-17 01:32:00 Asia/Shanghai](https://github.com/gsantiago/subtitle.js/commit/e4c7ad0427dd102619a09378e69cfdcd831a7582)，默认分支`master`首项commit，SHA `e4c7ad0427dd102619a09378e69cfdcd831a7582`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C03。SRT解析/输出、时间戳与resync库，WebVTT仅部分支持；同步API存在但主API为Node streams。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript，package engines Node>=10、multipipe/split2等依赖；ESM存在不证明无Node依赖。
- **能否浏览器离线：** 文本算法可离线；完整包浏览器无polyfill支持未核实，不能直接标“即插即用浏览器”。
- **Web / Chrome / VSCode / 手机：** Web/Chrome/VSCode先评估抽离纯时间戳/同步逻辑；避免为小工具引入整套stream polyfill；手机限字幕大小。
- **数据发送 / 授权 / 成本：** 本地处理无API费，字幕原文有隐私/版权；VTT样式、voice/region等可能丢失。
- **建议复用方式：** 部分可用：算法/测试参考优先，依赖采用须过bundle审查；与OSS23的VTT能力互补但不默认双装。
- **不能直接复用的缺口：** 不覆盖完整WebVTT、字幕冲突UI/ASR/翻译；README覆盖率宣称不当本产品测试结果。
- **额外核实来源：** [package.json](https://github.com/gsantiago/subtitle.js/blob/master/package.json)。

### OSS15 · SubtitleEdit/subtitleedit

- **完整仓库：** https://github.com/SubtitleEdit/subtitleedit（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/SubtitleEdit/subtitleedit/blob/main/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/SubtitleEdit/subtitleedit/blob/main/LICENSE)。
- **活动 / 归档：** [2026-11-08 04:28:58 Asia/Shanghai](https://github.com/SubtitleEdit/subtitleedit/commit/19bba8bf93dc681351ffb88072228ffa11e9925a)，默认分支`main`首项commit，SHA `19bba8bf93dc681351ffb88072228ffa11e9925a`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C03, C04。完整桌面字幕编辑应用，可参考时间轴/格式错误和人工编辑行为；不是JS字幕库。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为C#（不代表全部组成）。C#/.NET桌面应用，音视频/OCR/ASR等功能可能依赖外部引擎/服务；无需为本计划启用。
- **能否浏览器离线：** 桌面本地工作不代表浏览器可直接运行；只提炼交互/格式边界，B本地字幕由自己的逻辑处理。
- **Web / Chrome / VSCode / 手机：** 不嵌入Web/Chrome/VSCode webview，不加原生运行器；移动端只借简化编辑交互。
- **数据发送 / 授权 / 成本：** 字幕文本本地无API要求，但可选ASR/模型服务的数据/费用要分开；本轮未安装/运行。
- **建议复用方式：** 仅产品与边界案例参考；LICENSE实读为MIT，不沿用“字幕工具一定GPL”的印象。
- **不能直接复用的缺口：** 无法直接提供Vue组件；未把可选桌面AI功能算成SimpleTools已有引擎。

### OSS16 · ffmpegwasm/ffmpeg.wasm

- **完整仓库：** https://github.com/ffmpegwasm/ffmpeg.wasm（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/README.md)。
- **许可 / SPDX范围：** MIT（@ffmpeg/ffmpeg wrapper）；core随FFmpeg/外部库许可，不能合称MIT；分类：分层。[核实文件 `LICENSE`](https://github.com/ffmpegwasm/ffmpeg.wasm/blob/main/LICENSE)。
- **活动 / 归档：** [2025-09-17 08:49:07 Asia/Shanghai](https://github.com/ffmpegwasm/ffmpeg.wasm/commit/f876f907c7e9b9bf51d4ed0b913a855a63ae63fc)，默认分支`main`首项commit，SHA `f876f907c7e9b9bf51d4ed0b913a855a63ae63fc`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C04, C03, C05。浏览器FFmpeg WASM引擎与wrapper；现有SimpleTools已依赖的能力，不是新增机会/引擎替换。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为C（不代表全部组成）。TS/JS wrapper + C/C++编译的WASM core/worker；不需服务器/数据库/模型API，编解码器取决于打包core。
- **能否浏览器离线：** A可：沿用已有离线资源策略。完整codec/filter、内存和多线程隔离仍受限。
- **Web / Chrome / VSCode / 手机：** Web/Chrome/VSCode webview复用既有engine.ts与offlineAssets；不依赖Node ffmpeg；手机短片/串行/取消与MEMFS清理。
- **数据发送 / 授权 / 成本：** 本地素材不上传，无推理费；不能让示例CDN加载破坏离线；core与x264等外部库许可证、发布notice/源代码义务按实际构建审查。
- **建议复用方式：** 唯一“已有适合”首批项：增强现有C04；不重复安装、不承诺升级到上游版本；保留5.0.0。
- **不能直接复用的缺口：** 不是完整剪辑器/ASR；MIT wrapper不代表二进制全MIT；2GB FAQ上限不是手机能力保证。
- **额外核实来源：** [ffmpeg.wasm官方FAQ](https://ffmpegwasm.netlify.app/docs/faq/)（同日WebFetch可读；未标明文档日期）。

### OSS17 · remotion-dev/remotion

- **完整仓库：** https://github.com/remotion-dev/remotion（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/remotion-dev/remotion/blob/main/README.md)。
- **许可 / SPDX范围：** 自定义Remotion License；无标准OSI SPDX（记LicenseRef-Remotion作本文内部标签）；分类：source-available。[核实文件 `LICENSE.md`](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)。
- **活动 / 归档：** [2026-11-07 23:58:06 Asia/Shanghai](https://github.com/remotion-dev/remotion/commit/5dee2b6b14f7f0cebb040b7d92b0097b6be582a9)，默认分支`main`首项commit，SHA `5dee2b6b14f7f0cebb040b7d92b0097b6be582a9`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C04, C05。完整React程序化视频生态；场景/时间轴/渲染概念可参考，不是Vue纯离线小工具。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript/React；播放组件可浏览器，常用完整渲染需Node/浏览器渲染环境，可选云渲染。
- **能否浏览器离线：** 浏览器能预览不等于完整MP4导出无服务器；本轮不替换现有FFmpeg。
- **Web / Chrome / VSCode / 手机：** React不直接变Vue组件；Chrome/VSCode不搬渲染服务，手机渲染资源需独立设计。
- **数据发送 / 授权 / 成本：** 本地编辑本身不需模型API，云render或模型额外计费；许可证按主体/规模区分，免费许可含衍生软件出售/再许可限制。
- **建议复用方式：** 仅参考/本轮不引入依赖；商用条件不是“MIT免费随便用”，需单独许可审查/授权。
- **不能直接复用的缺口：** 标准OSI开源候选之外的对照；公司许可/未来版本条款不能凭旧README假定已满足。

### OSS18 · wonderunit/storyboarder

- **完整仓库：** https://github.com/wonderunit/storyboarder（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/wonderunit/storyboarder/blob/master/README.md)。
- **许可 / SPDX范围：** NOASSERTION：未找到明确覆盖源码的标准许可；分发EULA为自定义限制条款；分类：未知。[核实文件 `build/license_en.txt`](https://github.com/wonderunit/storyboarder/blob/master/build/license_en.txt)。
- **活动 / 归档：** [2022-07-01 01:42:04 Asia/Shanghai](https://github.com/wonderunit/storyboarder/commit/8b81a25c71d5f7ca46e8d5b8e3d4f7b3968f95c2)，默认分支`master`首项commit，SHA `8b81a25c71d5f7ca46e8d5b8e3d4f7b3968f95c2`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C01。传统分镜/绘图/animatic完整应用；有reference/change/export等流程，但不是已核实AI prompt/take版本库。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript/Electron桌面，package含原生/桌面依赖和electron-google-analytics；不需模型生成API才能绘图。
- **能否浏览器离线：** 桌面本地编辑不代表浏览器离线；无服务器前提也不等于符合无遥测核心。
- **Web / Chrome / VSCode / 手机：** 不直接打入Web/Chrome/VSCode；只看流程，不移植原生/Photoshop集成。
- **数据发送 / 授权 / 成本：** 存在自定义EULA的数据收集/传输与再分发限制；本轮未运行，不背书实际遥测行为或商用权。
- **建议复用方式：** 仅非代码产品参考；不得因README称open source就复制源码或宣称OSI开源。
- **不能直接复用的缺口：** 根目录无LICENSE，package指向build/license_en.txt且实际为限制型EULA；源码授权待明确。默认分支2022后未见新提交，未归档不等于活跃。
- **额外核实来源：** [package.json](https://github.com/wonderunit/storyboarder/blob/master/package.json)。

### OSS19 · fabricjs/fabric.js

- **完整仓库：** https://github.com/fabricjs/fabric.js（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/fabricjs/fabric.js/blob/master/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/fabricjs/fabric.js/blob/master/LICENSE)。
- **活动 / 归档：** [2026-11-05 16:02:54 Asia/Shanghai](https://github.com/fabricjs/fabric.js/commit/5157cd00903e75da3240eb3c952adc4c71ba8ab2)，默认分支`master`首项commit，SHA `5157cd00903e75da3240eb3c952adc4c71ba8ab2`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C05, C01。浏览器Canvas对象编辑、文本/图形/图片变换与序列化库，不是社媒模板/素材权限系统。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript/JavaScript；浏览器可用，Node端另有canvas等环境；不用DB/模型。
- **能否浏览器离线：** A可：仅加载本地文件/内置字体，禁止远程URL素材。
- **Web / Chrome / VSCode / 手机：** 三端可评估但包体/字体/触摸/worker需测；Canvas编辑可交互，手机避免过大画布。
- **数据发送 / 授权 / 成本：** 本地无需发送/推理费；远程素材会请求且可能taint画布；不要执行导入SVG中的活动内容。
- **建议复用方式：** 现有image-editor/resizer优先；只有必须新增可编辑图层且已有组件不足才考虑依赖，不为了C05重写编辑器。
- **不能直接复用的缺口：** 尺寸/安全区/清单/zip/metadata保留须产品补齐；Canvas导出不能保证IPTC/C2PA等来源保留。

### OSS20 · exiftool/exiftool

- **完整仓库：** https://github.com/exiftool/exiftool（GitHub仓库对象验证存在）。
- **实读功能来源：** [README](https://github.com/exiftool/exiftool/blob/master/README)。
- **许可 / SPDX范围：** NOASSERTION（LICENSE为GPLv3文本；README称Artistic或GPL，整体SPDX/版本未消除矛盾）；分类：未知。[核实文件 `LICENSE`](https://github.com/exiftool/exiftool/blob/master/LICENSE)。
- **活动 / 归档：** [2026-11-05 22:54:41 Asia/Shanghai](https://github.com/exiftool/exiftool/commit/9b8664dfcf2c609d3cc8925d380e98ad2a379f9b)，默认分支`master`首项commit，SHA `9b8664dfcf2c609d3cc8925d380e98ad2a379f9b`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C02, C05。Perl元数据读取/写入完整CLI/模块，可参考EXIF/IPTC/XMP/C2PA支持表与选择性清理边界；不是权利认证服务。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为Perl（不代表全部组成）。Perl模块/CLI，需本地原生环境；无模型API/DB/服务器才能读写文件。
- **能否浏览器离线：** 原生本地可离线，但不是浏览器WASM库；本轮不移植、不装Perl。
- **Web / Chrome / VSCode / 手机：** Web/Chrome/VSCode不直接调用宿主CLI；只对照支持表，继续复用现有引擎并验证格式。
- **数据发送 / 授权 / 成本：** 本地CLI可不外传，但复制/分发需先澄清许可范围；metadata/GPS/肖像等敏感，不自动删来源标记。
- **建议复用方式：** 仅规格/测试边界参考；不推荐作为本期依赖，不能因README说free就认定整体可商用。
- **不能直接复用的缺口：** GPL/Artistic差异待核，不默认选择宽松一方；读取C2PA≠验证签名/授权，重编码可能失效。

### OSS21 · zotero/zotero

- **完整仓库：** https://github.com/zotero/zotero（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/zotero/zotero/blob/main/README.md)。
- **许可 / SPDX范围：** AGPL-3.0-only（COPYING指明version 3；含商标/第三方说明）；分类：OSI。[核实文件 `COPYING`](https://github.com/zotero/zotero/blob/main/COPYING)。
- **活动 / 归档：** [2026-11-07 11:04:04 Asia/Shanghai](https://github.com/zotero/zotero/commit/228f132e1a2c38745ae07bea6c1600b8bddc3b73)，默认分支`main`首项commit，SHA `228f132e1a2c38745ae07bea6c1600b8bddc3b73`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** G04, M04。完整资料/文献引用管理桌面应用；可参考source/item/附件/来源记录，非claim→事实有效期/矛盾台账。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript/本地桌面运行时与数据库；同步/联网资料抓取为额外功能；不是纯浏览器组件。
- **能否浏览器离线：** 资料可本地管理，不代表整个Zotero可放入离线Web；B只导入合法手工元数据/实际导出。
- **Web / Chrome / VSCode / 手机：** 三端不搬应用/同步服务；标准导出适配要核实际样本，不凭相近名称声称兼容。
- **数据发送 / 授权 / 成本：** 启用同步/取回资料会发网；附件版权/账号/存储费用由实际服务决定；AGPL及商标/第三方义务需审查，非武断“不能商用”。
- **建议复用方式：** 仅工作流/元数据设计参考；不复制代码来省一个本地台账，避免带入不匹配的运行时/许可义务。
- **不能直接复用的缺口：** G04最重要的claim支持/反驳/有效期不在本轮核实匹配范围，因此G04仍记未找到关键业务模块。

### OSS22 · josdejong/mathjs

- **完整仓库：** https://github.com/josdejong/mathjs（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/josdejong/mathjs/blob/develop/README.md)。
- **许可 / SPDX范围：** Apache-2.0；分类：OSI。[核实文件 `LICENSE`](https://github.com/josdejong/mathjs/blob/develop/LICENSE)。
- **活动 / 归档：** [2026-11-07 01:38:19 Asia/Shanghai](https://github.com/josdejong/mathjs/commit/89ecb4cdaf4f8dd945159785d35d07c48aa99903)，默认分支`develop`首项commit，SHA `89ecb4cdaf4f8dd945159785d35d07c48aa99903`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** M02。数值/BigNumber/单位/表达式等通用数学库，可参考精度处理；不是广告归因/税费模型。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript，浏览器/Node；无服务/DB/模型API。
- **能否浏览器离线：** A可；只固定公式/受控输入，优先现有算术或最小导入，不开放任意复杂表达式。
- **Web / Chrome / VSCode / 手机：** 三端可评估；完整库较重，受控构建/体积和手机计算资源需验证；不改Chrome CSP。
- **数据发送 / 授权 / 成本：** 本地计算不发送/无API费；表达式复杂度/对象访问与精度边界需安全审查；汇率/费表不会自动变实时。
- **建议复用方式：** 选择性依赖或方法参考，不为几个ROAS公式默认引整个库；重用已有数值能力。
- **不能直接复用的缺口：** 利润/税/归因/币种口径仍由产品定义与专业复核，数值精确不等于业务模型正确。

### OSS23 · videojs/vtt.js

- **完整仓库：** https://github.com/videojs/vtt.js（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/videojs/vtt.js/blob/0.15.x/README.md)。
- **许可 / SPDX范围：** Apache-2.0；分类：OSI。[核实文件 `LICENSE`](https://github.com/videojs/vtt.js/blob/0.15.x/LICENSE)。
- **活动 / 归档：** [2023-07-20 23:01:33 Asia/Shanghai](https://github.com/videojs/vtt.js/commit/e9c8ae056c259226538b762e78d53c4c8871d643)，默认分支`0.15.x`首项commit，SHA `e9c8ae056c259226538b762e78d53c4c8871d643`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C03。WebVTT parser/cue/region处理与浏览器shim；不是SRT全工具或音频转字幕。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript，README明确Browser构建；默认分支0.15.x，开发链较旧。
- **能否浏览器离线：** A可研究，资源本地打包；读取/解析VTT不需服务器/模型。
- **Web / Chrome / VSCode / 手机：** 三端浏览器层可用性需验证，尤其原生VTTCue/VTTRegion/shim行为；手机保持小样本。
- **数据发送 / 授权 / 成本：** 本地无发送/费用；cue文本渲染必须隔离，不能把VTT当任意HTML。
- **建议复用方式：** 部分可用的浏览器VTT核心候选/测试语料；不自动采用旧构建链，也不宣称包已通过现代浏览器兼容。
- **不能直接复用的缺口：** 不支持完整SRT互转/发布审核/冲突UI；2023后默认分支未见新提交，先做兼容/安全评估。

### OSS24 · aqm857886159/Nomi

- **完整仓库：** https://github.com/aqm857886159/Nomi（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/aqm857886159/Nomi/blob/745b3c5b4d5806718813109d750481eb571c9f0e/README.md)。
- **许可 / SPDX范围：** AGPL-3.0-only（README明确当前版；历史Apache不自动覆盖当前代码）；分类：OSI。[核实文件 `LICENSE`](https://github.com/aqm857886159/Nomi/blob/main/LICENSE)。
- **活动 / 归档：** [2026-11-07 21:45:24 Asia/Shanghai](https://github.com/aqm857886159/Nomi/commit/745b3c5b4d5806718813109d750481eb571c9f0e)，默认分支`main`首项commit，SHA `745b3c5b4d5806718813109d750481eb571c9f0e`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** C01, C02。真正AI视频工作台：shot/prompt/model/参考图、take重试、时间轴与本地项目文件；能参考AI新增工作对象而非传统绘图改名。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为TypeScript（不代表全部组成）。TypeScript/React/Vite + Electron本地runtime/存储/模型调用，Node20+开发；不是Vue组件或静态网页。
- **能否浏览器离线：** 项目/提示/资产可本地，模型生成通常是授权API或本地ComfyUI/模型服务；local-first不等于生成离线/免费。
- **Web / Chrome / VSCode / 手机：** 不把Electron/文件系统/密钥调用搬进Chrome/Web/VSCode webview；C01首批只独立做文件交接与版本本。
- **数据发送 / 授权 / 成本：** 默认不发送/统计opt-in为README自述，实际出站未运行审计；连接的模型/中转服务将接收prompt/图像且有费用，授权/再分发与AGPL义务需审查。
- **建议复用方式：** 仅工件关系/人工确认/Take流程参考；直接复制AGPL代码前需许可兼容性审查，不安装其MCP/模型，不执行文档中的系统放行命令。
- **不能直接复用的缺口：** 未核实本地权利/consent/实际账单台账完整性，C02仍需补；README含未来日期文件名，不据图片路径推发布时间，能力引用固定到已核实提交。

### OSS25 · mahnunchik/utm-builder

- **完整仓库：** https://github.com/mahnunchik/utm-builder（GitHub仓库对象验证存在）。
- **实读功能来源：** [README.md](https://github.com/mahnunchik/utm-builder/blob/master/README.md)。
- **许可 / SPDX范围：** MIT；分类：OSI。[核实文件 `LICENSE`](https://github.com/mahnunchik/utm-builder/blob/master/LICENSE)。
- **活动 / 归档：** [2017-05-15 22:46:05 Asia/Shanghai](https://github.com/mahnunchik/utm-builder/commit/9feff4f343176d54bee9666f46c2ecd753cc1c4a)，默认分支`master`首项commit，SHA `9feff4f343176d54bee9666f46c2ecd753cc1c4a`；`archived=false`。release时间未核实。
- **关联工具 / 实际能力：** M01。单函数UTM参数构建小库，直接匹配链接参数子任务；不是活动命名/批量/PII治理工具。
- **语言 / 运行时 / 服务器数据库：** GitHub主要语言标记为JavaScript（不代表全部组成）。JavaScript/CommonJS、README以npm为入口；不需DB/模型/服务器。
- **能否浏览器离线：** 可本地构造URL，但浏览器bundle与边界行为本轮未测试。
- **Web / Chrome / VSCode / 手机：** 三端更推荐原生URL/URLSearchParams与现有URL工具，避免引入陈旧Node式依赖；手机表单即可。
- **数据发送 / 授权 / 成本：** 本地无需发送/费用；URL中不放PII，不自动请求/缩短链接。
- **建议复用方式：** 仅API/行为参考，不建议新增依赖；2017后默认分支未见新提交，不拿未归档当维护保证。
- **不能直接复用的缺口：** 现有query/fragment、重复UTM、Unicode/大小写/批量和命名策略需要本产品测试，README功能简单不等于全边界通过。

## 4. 关键跨项目限制，不能被“开源”两个字盖住

### 4.1 GEO：技术审计不是可见度因果引擎

- AEO Toolkit公开模块可以节省页面事实提取/规则整理，但其README含llms.txt/评分等主张，不作为Google入选条件或引用保证。主plan的Google/Search/OpenAI官方机制仍优先；不复制总分权重和无法验证的“AI信任信号”。
- GetCito是GEO完整应用的真实例子，不是轻量离线组件：Next/Express、PostgreSQL/Supabase、node-cron和付费提供商依赖不能藏起来。可以参考prompt→run→brand/citation→task的业务对象；B导入与C授权采集是不同产品层。
- G04主张台账、G06改版对照包、G10官方新报表适配、E03发布审阅包未核实到关键模块：Zotero/Label Studio/CSV/diff/Schema库只支持邻近步骤，不能强塞成整项已解决。没有为了让每行有热门仓库而改任务定义。
- 本轮没有读取/核实任何GEO项目数据采集适配器的完整权限/平台条款；消费端浏览器采集必须另做授权/条款判断，不借现成项目规避会话或站点限制。GEO数据工具不提供真实全球排名/搜索量/稳定引用的担保。

### 4.2 评测：框架跑在本地，不代表模型和数据不外传

- promptfoo/DeepEval/Ragas可帮助设计dataset、expected/context、工具正确性与人工rubric；不把它们装进Chrome包，不给前端塞Python/Node运行环境。API/provider/judge与遥测/云上报逐项决定。
- Langfuse完整部署还需要多个存储/后台服务，`TELEMETRY_ENABLED`在所读compose默认true。MIT核心不覆盖ee代码；自托管也不是无网络保证。
- 仅计划本地JSON/CSV/日志读写，不声称已经实现某项目的格式兼容。标准化需真实导出样本、字段版本、unknown和错误处理测试，不凭相同文件扩展名判断兼容。日志内的指令、工具调用只作文本，绝不执行。

### 4.3 创作：已有引擎优先，素材许可和软件许可分开

- FFmpeg wrapper MIT与core/codec许可分层，不以GitHub根license代替实际WASM构建审查；保留现有engine/worker与本地加载，未改/升级依赖，不能重复算一个“新FFmpeg工具”。
- subtitle.js是Node stream优先、VTT部分支持；vtt.js面向浏览器但默认分支较旧。先确定需要保留的cue/voice/style/region语义，再决定使用哪个纯逻辑单元；不得默认完整互转无损。
- Nomi的shot/model/prompt/reference/take非常贴合AI创作新增工作流，但Electron、本地文件/模型调用与AGPL边界不匹配直接嵌Vue静态工具。只借工件关系；现成生成模型调用不是本轮授权。其模型/relay的保密、肖像与输出许可另审，平台代码开源不授予素材权利。
- Remotion有主体/规模与衍生分发限制，不叫OSI开源；Storyboarder找不到覆盖源码的标准许可，已读分发EULA不能充当复制许可。ExifTool根LICENSE与README表述不一致，明确留待澄清，不擅自选择宽松授权。
- Fabric/Canvas重新编码可能丢元数据；ExifTool读写能力不能保证C2PA签名有效或第三方权利已取得。选择性去GPS、保留原件/manifest、遵守有关AI来源标记要求，不能用“隐私清理”移除全部生成来源。

## 5. 证据检查记录与交付

- 每个repo URL均由内置get_repository核实，所有README、许可文件链接依据实际get_file_contents成功结果；最近活动均有list_commits返回的commit全URL。唯一文件名404是robots-parser根`LICENSE`，工具返回目录后按正确`LICENSE.md`读取，旧错链未引用。没有仓库not-found被当不存在结论或改用raw API绕过。
- Ragas原检索起点explodinggradients/ragas返回新规范URL https://github.com/vibrantlabsai/ragas；本文使用新地址，不以原名推断不同项目。
- Storyboarder根目录无LICENSE、README仅外链“open source license thoughts”；依package所指读取`build/license_en.txt`后确认是自定义EULA。故整体源码授权标NOASSERTION，而非猜MIT或照宣传认开源。
- ExifTool已核实LICENSE GPLv3全文、README“Artistic or GPL”表述；本轮不继续无限追源，保守作为参考项目而非可直接采用依赖，具体授权版本/范围待确认。
- 所有默认分支名/归档状态/精确提交时间、README/许可证/commit工具证据文件索引已保存到`open-source-reuse-audit.json`，另有`open-source-tool-mapping.json`；这些是调研数据，不是安装/配置/实现脚本。原始metadata和commit摘要亦在同目录，可审计时间转换。
- 主plan：`/workspace/deliverables/2026-11-08-tools-expansion-research-plan.md`。
- 本附表：`/workspace/deliverables/2026-11-08-tools-open-source-mapping.md`。
- 改前备份：`/workspace/deliverables/2026-11-08-tools-expansion-research-plan.before-open-source.md`。
- Mac访问此前Never，本轮未重试；没有写入`/Volumes/my/github/SimpleTools`，没有改变源码/package/5.0.0、构建、发布、commit/push或创建Canvas。

**结论：有可借的开源“单元”和真实AI工作台，但没有一个经本轮核实、能无代价整套替代26项需求的纯离线前端。优先现有引擎+小型本地解析/验证，完整GEO/评测/桌面生成平台只作工件与工作流参考；许可、运行时和数据发送各自过闸。仍是调研与计划，未实施。**
