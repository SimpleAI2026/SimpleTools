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
    <AgentThreadList />
    <section class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-12 items-center gap-2 border-b px-3">
        <h1 class="truncate text-sm font-semibold">
          {{ agent.currentTitle || $t('agent.newChat') }}
        </h1>
        <Button
          class="ml-auto"
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
      <p v-if="agent.error === 'missing-settings'" class="text-destructive px-3 text-xs">
        {{ $t('agent.missingSettings') }}
      </p>
      <p v-else-if="agent.error" class="text-destructive px-3 text-xs">{{ agent.error }}</p>
      <AgentComposer />
    </section>
    <AgentSettingsDialog />
  </div>
</template>
