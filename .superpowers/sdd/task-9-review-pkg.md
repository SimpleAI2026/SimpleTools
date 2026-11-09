# Review package Task 9 (with fixes)
BASE: 3a31e12b06e63e5c511e782b47cf9ec4e1806e7c
HEAD: 78a0f5aacd59af63fbf2f105bea408cd7fb4bf97

## Commits
78a0f5a fix(agent): i18n role labels and restore composer draft
7834791 feat(agent): add chat UI threads messages composer settings

## Stat
 src/components/agent/AgentComposer.vue       |  66 +++++++++++++++++
 src/components/agent/AgentMarkdown.vue       |  17 +++++
 src/components/agent/AgentMessage.vue        |  93 ++++++++++++++++++++++++
 src/components/agent/AgentMessageList.vue    |  45 ++++++++++++
 src/components/agent/AgentSettingsDialog.vue | 102 +++++++++++++++++++++++++++
 src/components/agent/AgentThreadList.vue     |  43 +++++++++++
 src/components/layout/AppHeader.vue          |   7 +-
 src/i18n/locales/de.ts                       |   3 +
 src/i18n/locales/en.ts                       |   3 +
 src/i18n/locales/es.ts                       |   3 +
 src/i18n/locales/fr.ts                       |   3 +
 src/i18n/locales/ja.ts                       |   3 +
 src/i18n/locales/ko.ts                       |   3 +
 src/i18n/locales/pt-BR.ts                    |   3 +
 src/i18n/locales/zh-CN.ts                    |   3 +
 src/pages/AgentPage.vue                      |  40 ++++++++++-
 src/stores/agent.ts                          |   5 +-
 17 files changed, 436 insertions(+), 6 deletions(-)

## Diff
diff --git a/src/components/agent/AgentComposer.vue b/src/components/agent/AgentComposer.vue
new file mode 100644
index 0000000..248d5ca
--- /dev/null
+++ b/src/components/agent/AgentComposer.vue
@@ -0,0 +1,66 @@
+<script setup lang="ts">
+import { computed, ref } from 'vue'
+import { Send, Square } from 'lucide-vue-next'
+import { Button } from '@/components/ui/button'
+import { Textarea } from '@/components/ui/textarea'
+import { useAgentStore } from '@/stores/agent'
+
+const agent = useAgentStore()
+const draft = ref('')
+
+const canSend = computed(() => draft.value.trim().length > 0 && !agent.streaming)
+
+async function submit() {
+  const text = draft.value.trim()
+  if (!text || agent.streaming) return
+  draft.value = ''
+  const accepted = await agent.send(text)
+  // Restore input if send rejected before starting (e.g. missing BYOK settings).
+  if (!accepted) draft.value = text
+}
+
+function onKeydown(e: KeyboardEvent) {
+  if (e.key === 'Enter' && !e.shiftKey) {
+    e.preventDefault()
+    void submit()
+  }
+}
+</script>
+
+<template>
+  <div class="border-t p-3" data-testid="agent-composer">
+    <div class="mx-auto flex max-w-3xl items-end gap-2">
+      <Textarea
+        v-model="draft"
+        class="min-h-[72px] h-auto max-h-40 font-sans"
+        :placeholder="$t('agent.placeholder')"
+        :disabled="agent.streaming"
+        rows="2"
+        data-testid="agent-composer-input"
+        @keydown="onKeydown"
+      />
+      <Button
+        v-if="agent.streaming"
+        variant="outline"
+        size="icon"
+        class="shrink-0"
+        data-testid="agent-stop"
+        :aria-label="$t('agent.stop')"
+        @click="agent.stop()"
+      >
+        <Square class="size-3.5 fill-current" />
+      </Button>
+      <Button
+        v-else
+        size="icon"
+        class="shrink-0"
+        data-testid="agent-send"
+        :disabled="!canSend"
+        :aria-label="$t('agent.send')"
+        @click="submit"
+      >
+        <Send class="size-4" />
+      </Button>
+    </div>
+  </div>
+</template>
diff --git a/src/components/agent/AgentMarkdown.vue b/src/components/agent/AgentMarkdown.vue
new file mode 100644
index 0000000..e5f4b0c
--- /dev/null
+++ b/src/components/agent/AgentMarkdown.vue
@@ -0,0 +1,17 @@
+<script setup lang="ts">
+import { computed } from 'vue'
+import { Marked } from 'marked'
+import DOMPurify from 'dompurify'
+
+const props = defineProps<{ content: string }>()
+const marked = new Marked({ gfm: true, breaks: true })
+const html = computed(() =>
+  DOMPurify.sanitize(marked.parse(props.content || '') as string),
+)
+</script>
+
+<template>
+  <!-- sanitized with DOMPurify -->
+  <!-- eslint-disable-next-line vue/no-v-html -->
+  <div class="agent-md space-y-2 text-sm [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs [&_ul]:list-disc [&_ul]:pl-5" v-html="html" />
+</template>
diff --git a/src/components/agent/AgentMessage.vue b/src/components/agent/AgentMessage.vue
new file mode 100644
index 0000000..9e38e83
--- /dev/null
+++ b/src/components/agent/AgentMessage.vue
@@ -0,0 +1,93 @@
+<script setup lang="ts">
+import { useI18n } from 'vue-i18n'
+import type { ChatMessage } from '@/agent'
+import AgentMarkdown from '@/components/agent/AgentMarkdown.vue'
+
+defineProps<{ message: ChatMessage }>()
+
+const { t } = useI18n()
+
+function roleLabel(role: ChatMessage['role']): string {
+  if (role === 'user') return t('agent.roleUser')
+  if (role === 'assistant') return t('agent.roleAssistant')
+  if (role === 'tool') return t('agent.roleTool')
+  return role
+}
+
+function prettyJson(raw: string): string {
+  try {
+    return JSON.stringify(JSON.parse(raw), null, 2)
+  } catch {
+    return raw
+  }
+}
+
+function formatToolContent(content: string): string {
+  try {
+    return JSON.stringify(JSON.parse(content), null, 2)
+  } catch {
+    return content
+  }
+}
+</script>
+
+<template>
+  <article
+    class="flex flex-col gap-1.5"
+    :data-role="message.role"
+    :data-testid="`agent-message-${message.role}`"
+  >
+    <div class="text-muted-foreground text-xs font-medium tracking-wide">
+      {{ roleLabel(message.role) }}
+      <span v-if="message.status === 'streaming'" class="ml-2 font-normal">
+        {{ $t('agent.streaming') }}
+      </span>
+    </div>
+
+    <div
+      v-if="message.role === 'assistant'"
+      class="bg-muted/40 rounded-lg border px-3 py-2"
+    >
+      <AgentMarkdown :content="message.content" />
+      <div
+        v-if="message.toolCalls?.length"
+        class="mt-2 space-y-2 border-t pt-2"
+      >
+        <div
+          v-for="tc in message.toolCalls"
+          :key="tc.id"
+          class="bg-background rounded-md border p-2 text-xs"
+        >
+          <div class="mb-1 font-medium">{{ $t('agent.toolCall') }}: {{ tc.name }}</div>
+          <pre class="overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed">{{
+            prettyJson(tc.arguments)
+          }}</pre>
+        </div>
+      </div>
+    </div>
+
+    <div
+      v-else-if="message.role === 'user'"
+      class="bg-background rounded-lg border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
+    >
+      {{ message.content }}
+    </div>
+
+    <div
+      v-else-if="message.role === 'tool'"
+      class="bg-muted/30 text-muted-foreground rounded-lg border px-3 py-2"
+    >
+      <div class="mb-1 text-xs font-medium">{{ $t('agent.toolResult') }}</div>
+      <pre class="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">{{
+        formatToolContent(message.content)
+      }}</pre>
+    </div>
+
+    <div
+      v-else
+      class="text-muted-foreground rounded-lg border px-3 py-2 text-xs whitespace-pre-wrap"
+    >
+      {{ message.content }}
+    </div>
+  </article>
+</template>
diff --git a/src/components/agent/AgentMessageList.vue b/src/components/agent/AgentMessageList.vue
new file mode 100644
index 0000000..e0890a3
--- /dev/null
+++ b/src/components/agent/AgentMessageList.vue
@@ -0,0 +1,45 @@
+<script setup lang="ts">
+import { nextTick, ref, watch } from 'vue'
+import { useAgentStore } from '@/stores/agent'
+import AgentMessage from '@/components/agent/AgentMessage.vue'
+
+const agent = useAgentStore()
+const scroller = ref<HTMLElement | null>(null)
+
+async function scrollToBottom() {
+  await nextTick()
+  const el = scroller.value
+  if (!el) return
+  el.scrollTop = el.scrollHeight
+}
+
+watch(
+  () => [agent.messages.length, agent.messages.at(-1)?.content, agent.streaming] as const,
+  () => {
+    void scrollToBottom()
+  },
+  { flush: 'post' },
+)
+</script>
+
+<template>
+  <div
+    ref="scroller"
+    class="min-h-0 flex-1 overflow-y-auto px-3 py-4"
+    data-testid="agent-message-list"
+  >
+    <p
+      v-if="!agent.messages.length"
+      class="text-muted-foreground py-12 text-center text-sm"
+    >
+      {{ $t('agent.empty') }}
+    </p>
+    <div v-else class="mx-auto flex max-w-3xl flex-col gap-4">
+      <AgentMessage
+        v-for="m in agent.messages"
+        :key="m.id"
+        :message="m"
+      />
+    </div>
+  </div>
+</template>
diff --git a/src/components/agent/AgentSettingsDialog.vue b/src/components/agent/AgentSettingsDialog.vue
new file mode 100644
index 0000000..154397a
--- /dev/null
+++ b/src/components/agent/AgentSettingsDialog.vue
@@ -0,0 +1,102 @@
+<script setup lang="ts">
+import { watch } from 'vue'
+import { storeToRefs } from 'pinia'
+import { Button } from '@/components/ui/button'
+import {
+  Dialog,
+  DialogContent,
+  DialogDescription,
+  DialogFooter,
+  DialogHeader,
+  DialogTitle,
+} from '@/components/ui/dialog'
+import { Input } from '@/components/ui/input'
+import { Label } from '@/components/ui/label'
+import { Switch } from '@/components/ui/switch'
+import { Textarea } from '@/components/ui/textarea'
+import { useAgentStore } from '@/stores/agent'
+
+const agent = useAgentStore()
+const { settingsOpen, draftSettings } = storeToRefs(agent)
+
+watch(settingsOpen, (isOpen) => {
+  if (isOpen) agent.loadSettingsIntoDraft()
+})
+
+function onCancel() {
+  agent.loadSettingsIntoDraft()
+  settingsOpen.value = false
+}
+
+function onSave() {
+  agent.saveSettings()
+}
+</script>
+
+<template>
+  <Dialog v-model:open="settingsOpen">
+    <DialogContent class="sm:max-w-lg">
+      <DialogHeader data-testid="agent-settings-dialog">
+        <DialogTitle>{{ $t('agent.settingsTitle') }}</DialogTitle>
+        <DialogDescription>{{ $t('agent.settingsDesc') }}</DialogDescription>
+      </DialogHeader>
+
+      <div class="grid gap-3">
+        <div class="grid gap-1.5">
+          <Label for="agent-api-base">{{ $t('agent.apiBaseUrl') }}</Label>
+          <Input
+            id="agent-api-base"
+            v-model="draftSettings.apiBaseUrl"
+            data-testid="agent-settings-base-url"
+            placeholder="https://api.openai.com/v1"
+          />
+        </div>
+        <div class="grid gap-1.5">
+          <Label for="agent-api-key">{{ $t('agent.apiKey') }}</Label>
+          <Input
+            id="agent-api-key"
+            v-model="draftSettings.apiKey"
+            type="password"
+            autocomplete="off"
+            data-testid="agent-settings-api-key"
+          />
+        </div>
+        <div class="grid gap-1.5">
+          <Label for="agent-model">{{ $t('agent.model') }}</Label>
+          <Input
+            id="agent-model"
+            v-model="draftSettings.model"
+            data-testid="agent-settings-model"
+            placeholder="gpt-4o-mini"
+          />
+        </div>
+        <div class="grid gap-1.5">
+          <Label for="agent-system-prompt">{{ $t('agent.systemPrompt') }}</Label>
+          <Textarea
+            id="agent-system-prompt"
+            v-model="draftSettings.systemPrompt"
+            class="min-h-[96px] h-24 font-sans"
+            data-testid="agent-settings-system-prompt"
+          />
+        </div>
+        <div class="flex items-center gap-2">
+          <Switch
+            id="agent-remember-key"
+            v-model="draftSettings.rememberKey"
+            data-testid="agent-settings-remember-key"
+          />
+          <Label for="agent-remember-key">{{ $t('agent.rememberKey') }}</Label>
+        </div>
+      </div>
+
+      <DialogFooter>
+        <Button variant="outline" data-testid="agent-settings-cancel" @click="onCancel">
+          {{ $t('agent.cancel') }}
+        </Button>
+        <Button data-testid="agent-settings-save" @click="onSave">
+          {{ $t('agent.save') }}
+        </Button>
+      </DialogFooter>
+    </DialogContent>
+  </Dialog>
+</template>
diff --git a/src/components/agent/AgentThreadList.vue b/src/components/agent/AgentThreadList.vue
new file mode 100644
index 0000000..444e40a
--- /dev/null
+++ b/src/components/agent/AgentThreadList.vue
@@ -0,0 +1,43 @@
+<script setup lang="ts">
+import { Plus, Trash2 } from 'lucide-vue-next'
+import { Button } from '@/components/ui/button'
+import { useAgentStore } from '@/stores/agent'
+import { cn } from '@/lib/utils'
+
+const agent = useAgentStore()
+</script>
+
+<template>
+  <aside class="flex h-full w-56 shrink-0 flex-col border-r sm:w-64" data-testid="agent-thread-list">
+    <div class="flex items-center gap-2 border-b p-2">
+      <Button size="sm" class="w-full" data-testid="agent-new-thread" @click="agent.newThread()">
+        <Plus /> {{ $t('agent.newChat') }}
+      </Button>
+    </div>
+    <ul class="min-h-0 flex-1 overflow-y-auto p-2">
+      <li v-for="th in agent.threads" :key="th.id" class="group mb-1 flex items-center gap-1">
+        <button
+          type="button"
+          :class="
+            cn(
+              'hover:bg-accent flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm',
+              th.id === agent.currentThreadId && 'bg-accent font-medium',
+            )
+          "
+          @click="agent.selectThread(th.id)"
+        >
+          {{ th.title || $t('agent.newChat') }}
+        </button>
+        <Button
+          variant="ghost"
+          size="icon"
+          class="size-7 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
+          :aria-label="$t('agent.deleteThread')"
+          @click="agent.deleteThread(th.id)"
+        >
+          <Trash2 class="size-3.5" />
+        </Button>
+      </li>
+    </ul>
+  </aside>
+</template>
diff --git a/src/components/layout/AppHeader.vue b/src/components/layout/AppHeader.vue
index b9b2743..b47cd76 100644
--- a/src/components/layout/AppHeader.vue
+++ b/src/components/layout/AppHeader.vue
@@ -1,15 +1,18 @@
 <script setup lang="ts">
-import { ref } from 'vue'
+import { computed, ref } from 'vue'
+import { useRoute } from 'vue-router'
 import { Bot, Code2, Github, Languages, Moon, Puzzle, Sun, Wrench } from 'lucide-vue-next'
 import { Button } from '@/components/ui/button'
 import InstallExtensionModal, { type ExtensionKind } from '@/components/layout/InstallExtensionModal.vue'
 import { LOCALE_META, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'
 import { useSettingsStore } from '@/stores/settings'
 
 const settings = useSettingsStore()
+const route = useRoute()
+const isAgent = computed(() => route.name === 'agent')
 
 function onLocaleChange(event: Event) {
   settings.setLocale((event.target as HTMLSelectElement).value as AppLocale)
 }
 
 const GITHUB_URL = 'https://github.com/SimpleAI2026/SimpleTools'
@@ -26,13 +29,13 @@ function openInstall(kind: ExtensionKind) {
   modalOpen.value = true
 }
 </script>
 
 <template>
   <header class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
-    <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
+    <div class="mx-auto flex h-14 items-center gap-3 px-4" :class="isAgent ? 'max-w-7xl' : 'max-w-6xl'">
       <RouterLink to="/" class="flex items-center gap-2 font-semibold">
         <Wrench class="size-5" />
         {{ $t('app.name') }}
       </RouterLink>
       <div class="ml-auto flex items-center gap-1">
         <template v-if="showExtensionDownloads">
diff --git a/src/i18n/locales/de.ts b/src/i18n/locales/de.ts
index a03b96a..bfa8ace 100644
--- a/src/i18n/locales/de.ts
+++ b/src/i18n/locales/de.ts
@@ -233,12 +233,15 @@ const de: MessageSchema = {
     save: 'Save',
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default de
diff --git a/src/i18n/locales/en.ts b/src/i18n/locales/en.ts
index 1c8582c..cf7e09c 100644
--- a/src/i18n/locales/en.ts
+++ b/src/i18n/locales/en.ts
@@ -233,12 +233,15 @@ const en: MessageSchema = {
     save: 'Save',
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default en
diff --git a/src/i18n/locales/es.ts b/src/i18n/locales/es.ts
index f9c618d..40d67e0 100644
--- a/src/i18n/locales/es.ts
+++ b/src/i18n/locales/es.ts
@@ -233,12 +233,15 @@ const es: MessageSchema = {
     save: 'Save',
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default es
diff --git a/src/i18n/locales/fr.ts b/src/i18n/locales/fr.ts
index 336ace4..1d1062b 100644
--- a/src/i18n/locales/fr.ts
+++ b/src/i18n/locales/fr.ts
@@ -233,12 +233,15 @@ const fr: MessageSchema = {
     save: 'Save',
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default fr
diff --git a/src/i18n/locales/ja.ts b/src/i18n/locales/ja.ts
index aa90415..18b37be 100644
--- a/src/i18n/locales/ja.ts
+++ b/src/i18n/locales/ja.ts
@@ -233,12 +233,15 @@ const ja: MessageSchema = {
     save: 'Save',
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default ja
diff --git a/src/i18n/locales/ko.ts b/src/i18n/locales/ko.ts
index 95a8ebc..065fb26 100644
--- a/src/i18n/locales/ko.ts
+++ b/src/i18n/locales/ko.ts
@@ -233,12 +233,15 @@ const ko: MessageSchema = {
     save: 'Save',
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default ko
diff --git a/src/i18n/locales/pt-BR.ts b/src/i18n/locales/pt-BR.ts
index 2973fc7..ed38136 100644
--- a/src/i18n/locales/pt-BR.ts
+++ b/src/i18n/locales/pt-BR.ts
@@ -233,12 +233,15 @@ const ptBR: MessageSchema = {
     save: 'Save',
     cancel: 'Cancel',
     empty: 'Send a message to start chatting. HostTools: list_tools / open_tool / run_offline_tool.',
     missingSettings: 'Configure Base URL, API Key, and model first.',
     toolCall: 'Tool call',
     toolResult: 'Tool result',
+    roleUser: 'You',
+    roleAssistant: 'Assistant',
+    roleTool: 'Tool',
     streaming: 'Generating…',
     error: 'Something went wrong',
   },
 }
 
 export default ptBR
diff --git a/src/i18n/locales/zh-CN.ts b/src/i18n/locales/zh-CN.ts
index 7dfa0f3..fd73215 100644
--- a/src/i18n/locales/zh-CN.ts
+++ b/src/i18n/locales/zh-CN.ts
@@ -231,12 +231,15 @@ const zhCN = {
     save: '保存',
     cancel: '取消',
     empty: '发送一条消息开始对话。HostTools：list_tools / open_tool / run_offline_tool。',
     missingSettings: '请先配置 Base URL、API Key 与模型。',
     toolCall: '调用工具',
     toolResult: '工具结果',
+    roleUser: '你',
+    roleAssistant: '助手',
+    roleTool: '工具',
     streaming: '生成中…',
     error: '出错了',
   },
 }
 
 export default zhCN
diff --git a/src/pages/AgentPage.vue b/src/pages/AgentPage.vue
index 6f0775c..b991dd6 100644
--- a/src/pages/AgentPage.vue
+++ b/src/pages/AgentPage.vue
@@ -1,15 +1,51 @@
 <script setup lang="ts">
 import { onMounted } from 'vue'
+import { Settings } from 'lucide-vue-next'
+import { Button } from '@/components/ui/button'
 import { useAgentStore } from '@/stores/agent'
+import AgentThreadList from '@/components/agent/AgentThreadList.vue'
+import AgentMessageList from '@/components/agent/AgentMessageList.vue'
+import AgentComposer from '@/components/agent/AgentComposer.vue'
+import AgentSettingsDialog from '@/components/agent/AgentSettingsDialog.vue'
 
 const agent = useAgentStore()
+function openSettings() {
+  agent.settingsOpen = true
+}
 onMounted(() => {
   void agent.init()
 })
 </script>
 
 <template>
-  <div class="text-muted-foreground flex min-h-0 flex-1 items-center justify-center p-8 text-sm" data-testid="agent-page">
-    {{ $t('agent.empty') }}
+  <div
+    class="bg-background flex min-h-0 flex-1 overflow-hidden rounded-none border-t sm:rounded-lg sm:border"
+    data-testid="agent-page"
+  >
+    <AgentThreadList />
+    <section class="flex min-w-0 flex-1 flex-col">
+      <header class="flex h-12 items-center gap-2 border-b px-3">
+        <h1 class="truncate text-sm font-semibold">
+          {{ agent.currentTitle || $t('agent.newChat') }}
+        </h1>
+        <Button
+          class="ml-auto"
+          variant="ghost"
+          size="icon"
+          data-testid="agent-settings"
+          :aria-label="$t('agent.settings')"
+          @click="openSettings"
+        >
+          <Settings />
+        </Button>
+      </header>
+      <AgentMessageList />
+      <p v-if="agent.error === 'missing-settings'" class="text-destructive px-3 text-xs">
+        {{ $t('agent.missingSettings') }}
+      </p>
+      <p v-else-if="agent.error" class="text-destructive px-3 text-xs">{{ agent.error }}</p>
+      <AgentComposer />
+    </section>
+    <AgentSettingsDialog />
   </div>
 </template>
diff --git a/src/stores/agent.ts b/src/stores/agent.ts
index 542f61e..20bb6c5 100644
--- a/src/stores/agent.ts
+++ b/src/stores/agent.ts
@@ -122,19 +122,19 @@ export const useAgentStore = defineStore('agent', () => {
     else {
       await eng.selectThread(threads.value[0]!.id)
       await refreshMessages()
     }
   }
 
-  async function send(text: string): Promise<void> {
+  async function send(text: string): Promise<boolean> {
     const eng = ensureEngine()
     const cfg = resolveAgentConfig()
     if (!cfg.apiBaseUrl || !cfg.apiKey || !cfg.model) {
       error.value = 'missing-settings'
       settingsOpen.value = true
-      return
+      return false
     }
     eng.updateConfig(cfg)
     streaming.value = true
     error.value = null
     try {
       for await (const ev of eng.send(text)) {
@@ -156,12 +156,13 @@ export const useAgentStore = defineStore('agent', () => {
       }
     } finally {
       streaming.value = false
       await refreshThreads()
       await refreshMessages()
     }
+    return true
   }
 
   function applyTextDelta(messageId: string, delta: string): void {
     const idx = messages.value.findIndex((m) => m.id === messageId)
     if (idx < 0) return
     const cur = messages.value[idx]!
