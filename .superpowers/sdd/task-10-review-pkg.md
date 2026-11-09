# Review package Task 10
BASE: 78a0f5aacd59af63fbf2f105bea408cd7fb4bf97
HEAD: 48237293e5232c91180a7f74bfd80373fbdad9aa

## Commits
4823729 fix(agent): chrome BYOK host-permission warning and HostTool args typing
0c06712 docs(agent): note BYOK chrome host-permission constraint

## Stat
 README.md                                    |  1 +
 README_EN.md                                 |  1 +
 chrome-extension/README.md                   |  5 +++++
 src/agent/__tests__/ToolRegistry.test.ts     |  2 +-
 src/agent/hostTools/createHostTools.ts       | 20 +++++++++++---------
 src/agent/types.ts                           |  2 +-
 src/components/agent/AgentSettingsDialog.vue | 10 ++++++++++
 src/i18n/locales/de.ts                       |  1 +
 src/i18n/locales/en.ts                       |  1 +
 src/i18n/locales/es.ts                       |  1 +
 src/i18n/locales/fr.ts                       |  1 +
 src/i18n/locales/ja.ts                       |  1 +
 src/i18n/locales/ko.ts                       |  1 +
 src/i18n/locales/pt-BR.ts                    |  1 +
 src/i18n/locales/zh-CN.ts                    |  1 +
 15 files changed, 38 insertions(+), 11 deletions(-)

## Diff
diff --git a/README.md b/README.md
index a097992..aa57a8d 100644
--- a/README.md
+++ b/README.md
@@ -22,16 +22,17 @@
 
 ## 特性
 
 - **125 个工具**（以 `src/registry` 注册表为准，非 `src/tools` 目录计数）
 - **中英双语**界面，语言与主题（亮/暗）本地持久化
 - **注册表驱动**：搜索、分类、收藏、最近使用、按工具代码分割
 - **纯前端 / 可离线**：无业务后端；文件在浏览器内处理并下载
 - 技术栈：Vue 3、Vite、TypeScript、Tailwind CSS 4、shadcn-vue（reka-ui）、vue-i18n、Pinia、Yarn 4
+- **Agent（BYOK，实验）**：应用内 `/agent` 自带密钥的 OpenAI 兼容对话 + HostTools；密钥仅存本机。Chrome 插件版暂无 host 权限，扩展内直连云端 API 可能失败（优先网页版）。
 
 ## 工具分类
 
 | 分类 | 数量 | 说明 |
 |---|---:|---|
 | 开发 | 25 | JSON / 正则 / JWT / 各类代码格式化、网络与权限计算等 |
 | AI / Agent | 8 | Token 计数、费用估算、Prompt 检查与脱敏、MCP / 工具定义、Agent 指令生成 |
 | 编码解码 | 11 | Base64 / URL / Hash / AES / Morse 等 |
diff --git a/README_EN.md b/README_EN.md
index fe0cc08..5891d1b 100644
--- a/README_EN.md
+++ b/README_EN.md
@@ -22,16 +22,17 @@ Repository: https://github.com/SimpleAI2026/SimpleTools
 
 ## Features
 
 - **125 tools** (counted from the `src/registry` registry, not from `src/tools` folder count)
 - **Bilingual** UI (Chinese / English), with persisted locale and light/dark theme
 - **Registry-driven** search, categories, favorites, recent tools, and per-tool code splitting
 - **No backend**: files are processed locally and downloaded from the browser
 - Stack: Vue 3, Vite, TypeScript, Tailwind CSS 4, shadcn-vue (reka-ui), vue-i18n, Pinia, Yarn 4
+- **Agent (BYOK, experimental):** in-app `/agent` OpenAI-compatible chat with your own key + HostTools; keys stay on-device. The Chrome extension has no host permissions yet, so direct cloud API calls may fail (prefer the web build).
 
 ## Categories
 
 | Category | Count | Examples |
 |---|---:|---|
 | Developer | 25 | JSON, regex, JWT, formatters, network / chmod helpers |
 | AI / Agent | 8 | Token counter, API cost estimator, prompt linter / redactor / injection scan, MCP & tool defs, agent instructions |
 | Encode & Decode | 11 | Base64, URL, hash, AES, Morse, … |
diff --git a/chrome-extension/README.md b/chrome-extension/README.md
index 7deb765..3584557 100644
--- a/chrome-extension/README.md
+++ b/chrome-extension/README.md
@@ -24,8 +24,13 @@
 3. 「加载已解压的扩展程序」→ 选择本目录下的 `dist/`
 4. 点击工具栏 SimpleTools 图标，即可在新标签页使用
 
 ## 说明
 
 - `permissions` 为空；仅访问扩展自身 `chrome-extension://` 页面
 - SPA 使用相对路径 `base: './'` + **Hash 路由**（`VITE_ROUTER_MODE=hash`）
 - 图标由 `public/favicon.svg` 生成（16 / 32 / 48 / 128）
+
+## Agent（BYOK，实验）
+
+应用内路由 `/agent` 提供自带密钥的 OpenAI 兼容对话，并可调用 HostTools 打开/运行白名单离线工具。
+密钥仅存本机。Chrome 插件版暂未申请 host 权限，扩展内直连云端 API 可能失败；请优先用网页版或等待后续 optional host permissions。
diff --git a/src/agent/__tests__/ToolRegistry.test.ts b/src/agent/__tests__/ToolRegistry.test.ts
index f769cce..0dbbefb 100644
--- a/src/agent/__tests__/ToolRegistry.test.ts
+++ b/src/agent/__tests__/ToolRegistry.test.ts
@@ -16,17 +16,17 @@ describe('ToolRegistry', () => {
     reg.register({
       name: 'echo',
       description: 'Echo',
       parameters: {
         type: 'object',
         properties: { text: { type: 'string' } },
         required: ['text'],
       },
-      handler: (args: { text: string }) => ({ text: args.text }),
+      handler: (args) => ({ text: String((args as { text?: string }).text ?? '') }),
     })
 
     const ok = await reg.run('echo', '{"text":"hi"}', {
       threadId: 't1',
       abortSignal: new AbortController().signal,
     })
     expect(ok).toEqual({ ok: true, result: { text: 'hi' } })
 
diff --git a/src/agent/hostTools/createHostTools.ts b/src/agent/hostTools/createHostTools.ts
index dfc764b..3e4ae51 100644
--- a/src/agent/hostTools/createHostTools.ts
+++ b/src/agent/hostTools/createHostTools.ts
@@ -28,22 +28,23 @@ export function createHostTools(deps: HostToolDeps): HostTool[] {
           description: 'Optional category id filter (e.g. ai, developer, text)',
         },
         query: {
           type: 'string',
           description: 'Optional search string over slug/keywords/name',
         },
       },
     },
-    handler: (args: { category?: string; query?: string }) => {
+    handler: (args) => {
+      const a = (args ?? {}) as { category?: string; query?: string }
       let tools = TOOLS
-      if (args.category) {
-        tools = tools.filter((t) => t.category === args.category)
+      if (a.category) {
+        tools = tools.filter((t) => t.category === a.category)
       }
-      const q = (args.query ?? '').trim().toLowerCase()
+      const q = (a.query ?? '').trim().toLowerCase()
       if (q) {
         tools = tools.filter((t) => {
           const name = deps.t(`tools.${t.slug}.name`).toLowerCase()
           const desc = deps.t(`tools.${t.slug}.description`).toLowerCase()
           const hay = [t.slug, t.category, ...t.keywords, name, desc].join(' ').toLowerCase()
           return hay.includes(q)
         })
       }
@@ -64,18 +65,18 @@ export function createHostTools(deps: HostToolDeps): HostTool[] {
       'Navigate the SimpleTools UI to an offline tool page by slug (e.g. token-counter).',
     parameters: {
       type: 'object',
       properties: {
         slug: { type: 'string', description: 'Tool slug from list_tools' },
       },
       required: ['slug'],
     },
-    handler: async (args: { slug: string }) => {
-      const slug = String(args.slug || '').trim()
+    handler: async (args) => {
+      const slug = String((args as { slug?: string } | null)?.slug || '').trim()
       if (!getTool(slug)) {
         return { ok: false, error: `Unknown tool slug: ${slug}` }
       }
       await deps.router.push({ name: 'tool', params: { slug } })
       return { ok: true, slug, path: `/tools/${slug}` }
     },
   }
 
@@ -93,25 +94,26 @@ export function createHostTools(deps: HostToolDeps): HostTool[] {
         input: {
           type: 'object',
           description:
             'Tool-specific payload. token-counter: { text, family?, contextWindow? }. prompt-secret-redactor: { text, options? }.',
         },
       },
       required: ['slug', 'input'],
     },
-    handler: (args: { slug: string; input: Record<string, unknown> }) => {
-      const slug = String(args.slug || '').trim()
+    handler: (args) => {
+      const a = (args ?? {}) as { slug?: string; input?: Record<string, unknown> }
+      const slug = String(a.slug || '').trim()
       if (!isOfflineToolWhitelisted(slug)) {
         return {
           ok: false,
           error: `Slug not in offline whitelist: ${slug}. Allowed: token-counter, prompt-secret-redactor`,
         }
       }
-      const input = args.input ?? {}
+      const input = a.input ?? {}
       if (slug === 'token-counter') {
         const text = String(input.text ?? '')
         const family = (input.family as 'o200k' | 'cl100k' | 'claude' | 'gemini' | 'deepseek') || 'o200k'
         const contextWindow = Number(input.contextWindow ?? 128000) as 8000 | 32000 | 128000 | 200000
         return { ok: true, slug, result: analyzeText(text, family, contextWindow) }
       }
       if (slug === 'prompt-secret-redactor') {
         const text = String(input.text ?? '')
diff --git a/src/agent/types.ts b/src/agent/types.ts
index c7189cd..35b7079 100644
--- a/src/agent/types.ts
+++ b/src/agent/types.ts
@@ -46,17 +46,17 @@ export interface ToolContext {
   threadId: string
   abortSignal: AbortSignal
 }
 
 export interface HostTool {
   name: string
   description: string
   parameters: object
-  handler: (args: any, ctx: ToolContext) => Promise<unknown> | unknown
+  handler: (args: unknown, ctx: ToolContext) => Promise<unknown> | unknown
 }
 
 export interface HistoryStore {
   listThreads(): Promise<ChatThread[]>
   getMessages(threadId: string): Promise<ChatMessage[]>
   upsertThread(t: ChatThread): Promise<void>
   appendMessage(m: ChatMessage): Promise<void>
   updateMessage(m: ChatMessage): Promise<void>
diff --git a/src/components/agent/AgentSettingsDialog.vue b/src/components/agent/AgentSettingsDialog.vue
index 154397a..b7e3a59 100644
--- a/src/components/agent/AgentSettingsDialog.vue
+++ b/src/components/agent/AgentSettingsDialog.vue
@@ -23,29 +23,39 @@ watch(settingsOpen, (isOpen) => {
   if (isOpen) agent.loadSettingsIntoDraft()
 })
 
 function onCancel() {
   agent.loadSettingsIntoDraft()
   settingsOpen.value = false
 }
 
+const isChrome = import.meta.env.VITE_TARGET === 'chrome'
+
 function onSave() {
   agent.saveSettings()
 }
 </script>
 
 <template>
   <Dialog v-model:open="settingsOpen">
     <DialogContent class="sm:max-w-lg">
       <DialogHeader data-testid="agent-settings-dialog">
         <DialogTitle>{{ $t('agent.settingsTitle') }}</DialogTitle>
         <DialogDescription>{{ $t('agent.settingsDesc') }}</DialogDescription>
       </DialogHeader>
 
+      <p
+        v-if="isChrome"
+        class="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
+        data-testid="agent-settings-chrome-warning"
+      >
+        {{ $t('agent.chromeHostWarning') }}
+      </p>
+
       <div class="grid gap-3">
         <div class="grid gap-1.5">
           <Label for="agent-api-base">{{ $t('agent.apiBaseUrl') }}</Label>
           <Input
             id="agent-api-base"
             v-model="draftSettings.apiBaseUrl"
             data-testid="agent-settings-base-url"
             placeholder="https://api.openai.com/v1"
diff --git a/src/i18n/locales/de.ts b/src/i18n/locales/de.ts
index bfa8ace..1c23f08 100644
--- a/src/i18n/locales/de.ts
+++ b/src/i18n/locales/de.ts
@@ -234,14 +234,15 @@ const de: MessageSchema = {
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
     roleUser: 'You',
     roleAssistant: 'Assistant',
     roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default de
diff --git a/src/i18n/locales/en.ts b/src/i18n/locales/en.ts
index cf7e09c..c844e2f 100644
--- a/src/i18n/locales/en.ts
+++ b/src/i18n/locales/en.ts
@@ -234,14 +234,15 @@ const en: MessageSchema = {
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
     roleUser: 'You',
     roleAssistant: 'Assistant',
     roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default en
diff --git a/src/i18n/locales/es.ts b/src/i18n/locales/es.ts
index 40d67e0..a07f7df 100644
--- a/src/i18n/locales/es.ts
+++ b/src/i18n/locales/es.ts
@@ -234,14 +234,15 @@ const es: MessageSchema = {
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
     roleUser: 'You',
     roleAssistant: 'Assistant',
     roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default es
diff --git a/src/i18n/locales/fr.ts b/src/i18n/locales/fr.ts
index 1d1062b..ddac6cf 100644
--- a/src/i18n/locales/fr.ts
+++ b/src/i18n/locales/fr.ts
@@ -234,14 +234,15 @@ const fr: MessageSchema = {
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
     roleUser: 'You',
     roleAssistant: 'Assistant',
     roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default fr
diff --git a/src/i18n/locales/ja.ts b/src/i18n/locales/ja.ts
index 18b37be..7eae707 100644
--- a/src/i18n/locales/ja.ts
+++ b/src/i18n/locales/ja.ts
@@ -234,14 +234,15 @@ const ja: MessageSchema = {
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
     roleUser: 'You',
     roleAssistant: 'Assistant',
     roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default ja
diff --git a/src/i18n/locales/ko.ts b/src/i18n/locales/ko.ts
index 065fb26..71482cc 100644
--- a/src/i18n/locales/ko.ts
+++ b/src/i18n/locales/ko.ts
@@ -234,14 +234,15 @@ const ko: MessageSchema = {
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
     roleUser: 'You',
     roleAssistant: 'Assistant',
     roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default ko
diff --git a/src/i18n/locales/pt-BR.ts b/src/i18n/locales/pt-BR.ts
index ed38136..130d3cf 100644
--- a/src/i18n/locales/pt-BR.ts
+++ b/src/i18n/locales/pt-BR.ts
@@ -234,14 +234,15 @@ const ptBR: MessageSchema = {
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
     roleUser: 'You',
     roleAssistant: 'Assistant',
     roleTool: 'Tool',
+    chromeHostWarning: 'The Chrome extension has no host permissions yet, so BYOK cloud API calls may fail. Prefer the web build, or wait for optional host permissions in a later release.',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default ptBR
diff --git a/src/i18n/locales/zh-CN.ts b/src/i18n/locales/zh-CN.ts
index fd73215..2b43f96 100644
--- a/src/i18n/locales/zh-CN.ts
+++ b/src/i18n/locales/zh-CN.ts
@@ -232,15 +232,16 @@ const zhCN = {
     cancel: '取消',
     empty: '发送一条消息开始对话。HostTools：list_tools / open_tool / run_offline_tool。',
     missingSettings: '请先配置 Base URL、API Key 与模型。',
     toolCall: '调用工具',
     toolResult: '工具结果',
     roleUser: '你',
     roleAssistant: '助手',
     roleTool: '工具',
+    chromeHostWarning: 'Chrome 插件版暂未申请 host 权限，扩展内直连云端 API 可能失败；请优先用网页版，或等待后续 optional host permissions。',
     streaming: '生成中…',
     error: '出错了',
   },
 }
 
 export default zhCN
 export type MessageSchema = typeof zhCN
