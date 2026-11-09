<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'
import AgentMessage from '@/components/agent/AgentMessage.vue'
import AgentTypingBubble from '@/components/agent/AgentTypingBubble.vue'

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

const hasStreamingAssistant = computed(() =>
  agent.messages.some((m) => m.role === 'assistant' && m.status === 'streaming'),
)

/** Optimistic dots during upload wait / before assistant row exists (SimpleChat). */
const showOptimisticTyping = computed(
  () => agent.streaming && !hasStreamingAssistant.value,
)
</script>

<template>
  <div
    ref="scroller"
    class="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-4 md:py-6"
    data-testid="agent-message-list"
  >
    <p
      v-if="!agent.messages.length && !showOptimisticTyping"
      class="text-muted-foreground py-12 text-center text-sm md:py-16"
    >
      {{ $t('agent.empty') }}
    </p>
    <div
      v-else
      class="mx-auto flex w-full max-w-5xl flex-col gap-4 md:gap-5"
    >
      <AgentMessage
        v-for="m in agent.messages"
        :key="m.id"
        :message="m"
      />
      <article
        v-if="showOptimisticTyping"
        class="flex flex-col gap-1.5"
        data-role="assistant"
        data-testid="agent-message-assistant-typing"
      >
        <div class="text-muted-foreground text-xs font-medium tracking-wide">
          {{ $t('agent.roleAssistant') }}
        </div>
        <AgentTypingBubble />
      </article>
    </div>
  </div>
</template>
