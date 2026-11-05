<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Menu, Settings } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/stores/agent'
import AgentThreadList from '@/components/agent/AgentThreadList.vue'
import AgentMessageList from '@/components/agent/AgentMessageList.vue'
import AgentComposer from '@/components/agent/AgentComposer.vue'
import AgentSettingsDialog from '@/components/agent/AgentSettingsDialog.vue'

const agent = useAgentStore()
const threadsOpen = ref(false)
function openSettings() {
  agent.settingsOpen = true
}
onMounted(() => {
  void agent.init()
})
</script>

<template>
  <div
    class="bg-background flex min-h-0 flex-1 overflow-hidden rounded-none border-t sm:rounded-lg sm:border"
    data-testid="agent-page"
  >
    <AgentThreadList :mobile-open="threadsOpen" @close="threadsOpen = false" />
    <section class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-12 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          class="size-11 md:hidden"
          data-testid="agent-open-threads"
          :aria-label="$t('agent.openThreads')"
          :aria-expanded="threadsOpen"
          @click="threadsOpen = true"
        >
          <Menu />
        </Button>
        <h1 class="truncate text-sm font-semibold">
          {{ agent.currentTitle || $t('agent.newChat') }}
        </h1>
        <Button
          class="ml-auto size-11 md:size-9"
          variant="ghost"
          size="icon"
          data-testid="agent-settings"
          :aria-label="$t('agent.settings')"
          @click="openSettings"
        >
          <Settings />
        </Button>
      </header>
      <AgentMessageList />
      <p v-if="agent.error === 'missing-settings'" class="text-destructive px-3 pb-1 text-xs sm:px-4">
        {{ $t('agent.missingSettings') }}
      </p>
      <p
        v-else-if="agent.error === 'chrome-ai-downloadable'"
        class="text-destructive px-3 pb-1 text-xs sm:px-4"
      >
        {{ $t('agent.chromeAiNeedDownload') }}
      </p>
      <p
        v-else-if="agent.error === 'chrome-ai-downloading'"
        class="text-destructive px-3 pb-1 text-xs sm:px-4"
      >
        {{ $t('agent.chromeAiWaitDownload') }}
      </p>
      <p
        v-else-if="agent.error === 'chrome-ai-unavailable'"
        class="text-destructive px-3 pb-1 text-xs sm:px-4"
      >
        {{ $t('agent.chromeAiUnavailableSend') }}
      </p>
      <p v-else-if="agent.error" class="text-destructive px-3 pb-1 text-xs sm:px-4">{{ agent.error }}</p>
      <AgentComposer />
    </section>
    <AgentSettingsDialog />
  </div>
</template>
