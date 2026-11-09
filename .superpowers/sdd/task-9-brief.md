### Task 9: Agent UI — thread list, messages, composer, settings

**Files:**
- Create: `src/components/agent/AgentThreadList.vue`
- Create: `src/components/agent/AgentMessageList.vue`
- Create: `src/components/agent/AgentMessage.vue`
- Create: `src/components/agent/AgentComposer.vue`
- Create: `src/components/agent/AgentSettingsDialog.vue`
- Create: `src/components/agent/AgentMarkdown.vue`
- Modify: `src/pages/AgentPage.vue` — compose full layout

**Interfaces:**
- Consumes: `useAgentStore`, shadcn `Button` `Dialog*` `Input` `Textarea` `Label` `Switch`, `marked`, `DOMPurify`
- Produces: Working chat chrome (left/right), settings dialog, markdown bubbles, tool call cards

- [ ] **Step 1: AgentMarkdown**

```vue
<!-- src/components/agent/AgentMarkdown.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{ content: string }>()
const marked = new Marked({ gfm: true, breaks: true })
const html = computed(() =>
  DOMPurify.sanitize(marked.parse(props.content || '') as string),
)
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- sanitized with DOMPurify -->
  <div class="agent-md prose prose-neutral dark:prose-invert max-w-none text-sm" v-html="html" />
</template>
```

(If `prose` classes are unavailable without `@tailwindcss/typography`, use plain stacked styles: `space-y-2 [&_pre]:overflow-x-auto [&_code]:text-xs` — do **not** add a new dependency unless already present.)

- [ ] **Step 2: Thread list / message / composer / settings components**

`AgentThreadList.vue` sketch:

```vue
<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/stores/agent'
import { cn } from '@/lib/utils'

const agent = useAgentStore()
</script>

<template>
  <aside class="flex h-full w-56 shrink-0 flex-col border-r sm:w-64">
    <div class="flex items-center gap-2 border-b p-2">
      <Button size="sm" class="w-full" data-testid="agent-new-thread" @click="agent.newThread()">
        <Plus /> {{ $t('agent.newChat') }}
      </Button>
    </div>
    <ul class="min-h-0 flex-1 overflow-y-auto p-2">
      <li v-for="th in agent.threads" :key="th.id" class="group mb-1 flex items-center gap-1">
        <button
          type="button"
          :class="
            cn(
              'hover:bg-accent flex-1 truncate rounded-md px-2 py-1.5 text-left text-sm',
              th.id === agent.currentThreadId && 'bg-accent font-medium',
            )
          "
          @click="agent.selectThread(th.id)"
        >
          {{ th.title || $t('agent.newChat') }}
        </button>
        <Button
          variant="ghost"
          size="icon"
          class="size-7 opacity-0 group-hover:opacity-100"
          :aria-label="$t('agent.deleteThread')"
          @click="agent.deleteThread(th.id)"
        >
          <Trash2 class="size-3.5" />
        </Button>
      </li>
    </ul>
  </aside>
</template>
```

`AgentMessage.vue` — render role label; for assistant use `AgentMarkdown`; for `tool` role show muted JSON card; if `message.toolCalls` show each call name + arguments.

`AgentComposer.vue` — `Textarea` + Send/Stop; Enter-to-send (Shift+Enter newline); disable send when `streaming` or empty.

`AgentSettingsDialog.vue` — bind `agent.settingsOpen` with shadcn Dialog; fields: apiBaseUrl, apiKey (password input), model, systemPrompt, rememberKey Switch; Save calls `agent.saveSettings()`.

- [ ] **Step 3: Wire AgentPage layout**

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { Settings } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/stores/agent'
import AgentThreadList from '@/components/agent/AgentThreadList.vue'
import AgentMessageList from '@/components/agent/AgentMessageList.vue'
import AgentComposer from '@/components/agent/AgentComposer.vue'
import AgentSettingsDialog from '@/components/agent/AgentSettingsDialog.vue'

const agent = useAgentStore()
onMounted(() => {
  void agent.init()
})
</script>

<template>
  <div class="bg-background flex min-h-0 flex-1 overflow-hidden rounded-none border-t sm:rounded-lg sm:border" data-testid="agent-page">
    <AgentThreadList />
    <section class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-12 items-center gap-2 border-b px-3">
        <h1 class="truncate text-sm font-semibold">{{ agent.currentTitle || $t('agent.newChat') }}</h1>
        <Button
          class="ml-auto"
          variant="ghost"
          size="icon"
          data-testid="agent-settings"
          :aria-label="$t('agent.settings')"
          @click="agent.settingsOpen = true"
        >
          <Settings />
        </Button>
      </header>
      <AgentMessageList />
      <p v-if="agent.error === 'missing-settings'" class="text-destructive px-3 text-xs">
        {{ $t('agent.missingSettings') }}
      </p>
      <p v-else-if="agent.error" class="text-destructive px-3 text-xs">{{ agent.error }}</p>
      <AgentComposer />
    </section>
    <AgentSettingsDialog />
  </div>
</template>
```

- [ ] **Step 4: Manual UI check**

Run: `yarn dev` → open `#/agent` (or `/agent` on web history) → new thread, open settings, save dummy values, confirm localStorage key `simpletools-agent:settings`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/AgentPage.vue src/components/agent
git commit -m "feat(agent): add chat UI threads messages composer settings"
```

---

