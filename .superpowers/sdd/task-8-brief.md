### Task 8: Route, AppHeader entry, App layout, i18n

**Files:**
- Modify: `src/router/index.ts`
- Modify: `src/components/layout/AppHeader.vue`
- Modify: `src/App.vue`
- Modify: `src/i18n/locales/zh-CN.ts`
- Modify: `src/i18n/locales/en.ts`
- Create: `src/pages/AgentPage.vue` (shell placeholder OK; full UI in Task 9)

**Interfaces:**
- Consumes: router patterns from existing `src/router/index.ts`
- Produces: named route `agent` at `/agent`; header link; i18n keys under `app.agent` and `agent.*`

- [ ] **Step 1: Add i18n keys (zh-CN)**

Insert into `zh-CN.ts` `app` object:

```ts
agent: 'Agent',
agentTitle: 'SimpleTools Agent',
```

Add sibling top-level key `agent:` (alongside `app`, `categories`, `common`, `tools`):

```ts
agent: {
  newChat: '新会话',
  threads: '会话',
  deleteThread: '删除会话',
  placeholder: '输入消息…（可让模型调用本机工具）',
  send: '发送',
  stop: '停止',
  settings: '模型设置',
  settingsTitle: 'BYOK 设置',
  settingsDesc: '密钥仅保存在本机 localStorage，不会上传到 SimpleTools 服务器。',
  apiBaseUrl: 'API Base URL',
  apiKey: 'API Key',
  model: '模型',
  systemPrompt: '系统提示',
  rememberKey: '在本机记住 API Key',
  save: '保存',
  cancel: '取消',
  empty: '发送一条消息开始对话。HostTools：list_tools / open_tool / run_offline_tool。',
  missingSettings: '请先配置 Base URL、API Key 与模型。',
  toolCall: '调用工具',
  toolResult: '工具结果',
  streaming: '生成中…',
  error: '出错了',
},
```

Mirror English in `en.ts`.

- [ ] **Step 2: Add route**

```ts
// in routes array of src/router/index.ts
{
  path: '/agent',
  name: 'agent',
  component: () => import('@/pages/AgentPage.vue'),
},
```

Update `router.afterEach`:

```ts
router.afterEach((to) => {
  const t = i18n.global.t
  if (to.name === 'tool') {
    const slug = String(to.params.slug)
    useUserStore().addRecent(slug)
    document.title = `${t(`tools.${slug}.name`)} · SimpleTools`
  } else if (to.name === 'agent') {
    document.title = `${t('app.agentTitle')} · SimpleTools`
  } else {
    document.title = 'SimpleTools'
  }
})
```

- [ ] **Step 3: AppHeader entry**

Import `Bot` from `lucide-vue-next`. Add before GitHub button:

```vue
<Button
  variant="ghost"
  size="sm"
  class="hidden sm:inline-flex"
  as-child
  data-testid="agent-entry"
>
  <RouterLink to="/agent" :aria-label="$t('app.agent')">
    <Bot />
    <span>{{ $t('app.agent') }}</span>
  </RouterLink>
</Button>
<Button
  variant="ghost"
  size="icon"
  class="sm:hidden"
  as-child
  data-testid="agent-entry-icon"
>
  <RouterLink to="/agent" :aria-label="$t('app.agent')">
    <Bot />
  </RouterLink>
</Button>
```

- [ ] **Step 4: App.vue full-bleed for agent**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useSettingsStore } from '@/stores/settings'

useSettingsStore()
const route = useRoute()
const isAgent = computed(() => route.name === 'agent')
</script>

<template>
  <div class="min-h-screen" :class="isAgent ? 'flex h-dvh flex-col overflow-hidden' : ''">
    <AppHeader />
    <main
      :class="
        isAgent
          ? 'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-0 sm:px-4'
          : 'mx-auto w-full max-w-6xl px-4 py-6'
      "
    >
      <RouterView />
    </main>
    <footer
      v-if="!isAgent"
      class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs"
    >
      {{ $t('app.privacy') }}
    </footer>
  </div>
</template>
```

- [ ] **Step 5: Minimal AgentPage shell**

```vue
<!-- src/pages/AgentPage.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agent = useAgentStore()
onMounted(() => {
  void agent.init()
})
</script>

<template>
  <div class="text-muted-foreground flex min-h-0 flex-1 items-center justify-center p-8 text-sm" data-testid="agent-page">
    {{ $t('agent.empty') }}
  </div>
</template>
```

- [ ] **Step 6: Commit**

```bash
git add src/router/index.ts src/components/layout/AppHeader.vue src/App.vue src/pages/AgentPage.vue src/i18n/locales/zh-CN.ts src/i18n/locales/en.ts
git commit -m "feat(agent): add /agent route, header entry, and i18n"
```

---

