# it-tools 差距补齐计划

> 日期：2026-11-12 · 仅计划，未改应用代码
> 参考源：`thirdparty/it-tools`（https://github.com/CorentinTh/it-tools，浅克隆；`thirdparty/` 已在 `.gitignore`，不提交）
> 对比方法：按两边工具目录名、`src/registry/tools/*` 的 slug 与 keywords，加几个相近工具的代码逐个对照；未逐一打开页面验证。
> 结论：it-tools 共 90 个工具，SimpleTools 已有或基本覆盖约 45 个；**缺 42 个**，**部分覆盖 4 个**。

## 约束（沿用现有规则）

- 全部在浏览器本地运行：不走后端、云 API、LLM、CDN 动态加载代码。
- 目录结构 `src/tools/<id>/{index.vue,logic.ts,logic.test.ts,messages.ts}`，在 `src/registry` 注册。
- 8 种界面语言（zh-CN、en、ja、ko、de、fr、es、pt-BR），适配手机。
- 复制按钮统一放在输出区标题行右侧；产出要贴给 AI/Agent 的工具在底部加「使用方法」（`step1 -> step2 -> step3`）。
- 版本保持 5.0.0；不自动合并、不发布。
- it-tools 为 GPL-3.0：只参考功能与交互，不拷贝代码，依赖选 MIT/Apache 等宽松许可。

## 一、缺失的 42 个工具

### 加密与安全（9）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| bcrypt | bcrypt | bcrypt 哈希与校验 | bcryptjs（MIT），可调 cost |
| rsa-key-pair-generator | rsa-key-pair-generator | 生成 RSA 公私钥 PEM | WebCrypto `generateKey` + 导出 PKCS8/SPKI |
| bip39-generator | bip39-generator | 助记词生成与校验 | @scure/bip39（MIT），注意词表体积 |
| otp-code-generator-and-validator | otp-generator | TOTP/HOTP 生成、校验、otpauth 二维码 | WebCrypto HMAC + 现有二维码组件 |
| password-strength-analyser | password-strength | 密码强度、熵、破解时间估计 | 纯 TS 熵计算，可选 zxcvbn-ts |
| basic-auth-generator | basic-auth-generator | 生成 `Authorization: Basic` 头 | 纯 TS |
| string-obfuscator | string-obfuscator | 遮挡字符串中间部分 | 纯 TS |
| pdf-signature-checker | pdf-signature-checker | 读取 PDF 数字签名信息 | 解析 PDF 签名字典 + PKCS#7（pkijs，BSD）；工作量偏大 |
| safelink-decoder | safelink-decoder | 还原 Outlook SafeLinks 原始 URL | 纯 TS URL 解析 |

### ID 与生成器（6）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| ulid-generator | ulid-generator | 批量生成 ULID、解析时间 | 纯 TS + crypto.getRandomValues |
| mac-address-generator | mac-address-generator | 随机 MAC，可设前缀与格式 | 纯 TS |
| ipv6-ula-generator | ipv6-ula-generator | 按 RFC 4193 生成 ULA 前缀 | 纯 TS + WebCrypto SHA-1 |
| random-port-generator | random-port-generator | 随机非保留端口 | 纯 TS |
| svg-placeholder-generator | svg-placeholder-generator | 指定尺寸、颜色、文字的占位 SVG | 纯 TS，可导出 SVG / data URL |
| meta-tag-generator | meta-tag-generator | 生成 SEO / Open Graph / Twitter meta 标签 | 纯 TS 表单 |

### 网络（3）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| ipv4-range-expander | ipv4-range-expander | 起止 IP 转最小 CIDR 集合 | 纯 TS，可复用 cidr-calculator 逻辑 |
| mac-address-lookup | mac-address-lookup | 由 MAC 查厂商 | 需内置 OUI 数据（离线，注意体积与数据许可） |
| user-agent-parser | user-agent-parser | 解析浏览器、系统、设备 | ua-parser-js（v1 为 MIT；v2 为 AGPL，需避开） |

### 格式转换（5）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| json-diff | json-diff | JSON 结构化差异 | 纯 TS 递归对比 |
| toml-to-yaml | toml-yaml | TOML 与 YAML 互转（合并 yaml-to-toml） | 复用现有 toml-json、json-yaml 依赖 |
| yaml-to-toml | （同上） | | |
| yaml-viewer | yaml-viewer | YAML 格式化、折叠查看 | 复用 json-viewer 组件 |
| docker-run-to-docker-compose-converter | docker-run-to-compose | `docker run` 命令转 compose.yaml | 自写参数解析（composerize 为 MIT 可参考） |

### 文本（5）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| ascii-text-drawer | ascii-art-text | ASCII 艺术字 | figlet（MIT），字体本地打包 |
| text-to-nato-alphabet | nato-alphabet | 文本转北约音标字母 | 纯 TS |
| numeronym-generator | numeronym-generator | 生成 i18n 这类缩写 | 纯 TS |
| emoji-picker | emoji-picker | 搜索、复制 emoji 与码点 | 本地 emoji 数据（unicode-emoji-json 等，MIT） |
| html-wysiwyg-editor | html-wysiwyg-editor | 所见即所得编辑并导出 HTML | tiptap（MIT） |

### 数据校验（3）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| iban-validator-and-parser | iban-validator | IBAN 校验与拆解 | ibantools（MPL-2.0）或自写 mod-97 |
| phone-parser-and-formatter | phone-parser | 号码解析、格式化、归属国家 | libphonenumber-js（MIT），选 min 元数据 |
| email-normalizer | email-normalizer | 规范化邮箱（大小写、点号、加号别名） | 纯 TS |

### 计算与时间（5）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| math-evaluator | math-evaluator | 表达式计算 | mathjs（Apache-2.0）或 expr-eval，禁止 eval |
| percentage-calculator | percentage-calculator | 百分比、增减幅 | 纯 TS |
| eta-calculator | eta-calculator | 按进度和速度估算完成时间 | 纯 TS |
| chronometer | stopwatch | 秒表与计次 | performance.now() |
| benchmark-builder | benchmark-builder | 多组数据均值、中位数、方差对比 | 纯 TS |

### 速查（4）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| git-memo | git-cheatsheet | Git 常用命令速查 | 本地 8 语言内容 |
| regex-memo | regex-cheatsheet | 正则语法速查 | 可与 regex-tester 互链 |
| mime-types | mime-types | 扩展名与 MIME 互查 | mime-db 数据（MIT） |
| keycode-info | keycode-info | 显示按键的 key、code、keyCode | 浏览器 KeyboardEvent |

### 设备（2）

| it-tools | 建议 slug | 说明 | 实现思路 |
|---|---|---|---|
| device-information | device-information | 屏幕、UA、语言、硬件并发等 | 浏览器 API；Chrome 扩展环境需验证 |
| camera-recorder | camera-recorder | 摄像头拍照与录像 | getUserMedia + MediaRecorder；扩展需声明权限 |

## 二、部分覆盖的 4 个（增强现有工具，不另开同类）

| it-tools | 现状 | 补齐方式 |
|---|---|---|
| crontab-generator | 只有 `cron-parser`，能解析不能生成 | 给 cron-parser 加可视化生成模式，或新建 `crontab-generator` 并互链 |
| base64-file-converter | `image-base64` 只支持图片 | 新建 `base64-file`，支持任意文件与 data URL 互转 |
| hmac-generator | HMAC 藏在 `checksum-calculator` 里 | 新建独立 `hmac-generator`（WebCrypto），保留原入口 |
| list-converter | `text-lines` 只有部分列表处理 | 给 text-lines 补加前后缀、去重、排序、合并分隔符的一站式转换 |

## 三、建议批次

1. **第一批（开发者高频，10 个）**：bcrypt、otp-generator、rsa-key-pair-generator、ulid-generator、json-diff、user-agent-parser、crontab-generator、docker-run-to-compose、math-evaluator、git-cheatsheet
2. **第二批（小而快，纯 TS）**：basic-auth-generator、string-obfuscator、safelink-decoder、mac-address-generator、ipv6-ula-generator、random-port-generator、svg-placeholder-generator、meta-tag-generator、ipv4-range-expander、toml-yaml、yaml-viewer、nato-alphabet、numeronym-generator、email-normalizer、percentage-calculator、eta-calculator、stopwatch、benchmark-builder、regex-cheatsheet、mime-types、keycode-info、hmac-generator、base64-file、text-lines 增强
3. **第三批（依赖数据或较大库，先评估体积）**：bip39-generator、password-strength、mac-address-lookup、ascii-art-text、emoji-picker、html-wysiwyg-editor、iban-validator、phone-parser、device-information、camera-recorder、pdf-signature-checker

## 四、验收

- 每个工具有 logic 单测；lint、typecheck、`./build.sh build`、`./build.sh chrome` 通过。
- 390px 手机宽度截图；8 种语言无缺失键。
- Chrome 扩展离线可用（camera-recorder、device-information 单独确认权限与行为）。
- 新增依赖逐个核对许可证与打包体积，写入 PR 说明。
