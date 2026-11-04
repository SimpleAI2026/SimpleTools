<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'
import AgentMessage from '@/components/agent/AgentMessage.vue'

const agent = useAgentStore()
const scroller = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  const el = scroller.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

watch(
  () => [agent.messages.length, agent.messages.at(-1)?.content, agent.streaming] as const,
  () => {
    void scrollToBottom()
  },
  { flush: 'post' },
)
</script>

<template>
  <div
    ref="scroller"
    class="min-h-0 flex-1 overflow-y-auto px-3 py-4"
    data-testid="agent-message-list"
  >
    <p
      v-if="!agent.messages.length"
      class="text-muted-foreground py-12 text-center text-sm"
    >
      {{ $t('agent.empty') }}
    </p>
    <div v-else class="mx-auto flex max-w-3xl flex-col gap-4">
      <AgentMessage
        v-for="m in agent.messages"
        :key="m.id"
        :message="m"
      />
    </div>
  </div>
</template>
