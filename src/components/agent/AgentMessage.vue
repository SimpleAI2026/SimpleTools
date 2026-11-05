<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatContentPart, ChatMessage } from '@/agent'
import { useAgentStore } from '@/stores/agent'
import AgentMarkdown from '@/components/agent/AgentMarkdown.vue'
import AgentTypingBubble from '@/components/agent/AgentTypingBubble.vue'

const props = defineProps<{ message: ChatMessage }>()

const { t } = useI18n()
const agent = useAgentStore()

function roleLabel(role: ChatMessage['role']): string {
  if (role === 'user') return t('agent.roleUser')
  if (role === 'assistant') return t('agent.roleAssistant')
  if (role === 'tool') return t('agent.roleTool')
  return role
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

function formatToolContent(content: string): string {
  try {
    return JSON.stringify(JSON.parse(content), null, 2)
  } catch {
    return content
  }
}

type ImagePart = Extract<ChatContentPart, { type: 'image_url' }>

const imageParts = computed((): ImagePart[] =>
  (props.message.parts || []).filter((p): p is ImagePart => p.type === 'image_url'),
)

const userText = computed(() => {
  const m = props.message
  if (m.content && m.content !== '[image]') return m.content
  if (imageParts.value.length && (!m.content || m.content === '[image]')) return ''
  return m.content
})

/** Match SimpleChat: dots while streaming with empty prose and no tool calls. */
const showTyping = computed(() => {
  const m = props.message
  if (m.role !== 'assistant') return false
  if (!agent.streaming || m.status !== 'streaming') return false
  if (m.content?.trim()) return false
  if (m.toolCalls?.length) return false
  return true
})
</script>

<template>
  <article
    class="flex flex-col gap-1.5"
    :data-role="message.role"
    :data-testid="`agent-message-${message.role}`"
  >
    <div class="text-muted-foreground text-xs font-medium tracking-wide">
      {{ roleLabel(message.role) }}
    </div>

    <template v-if="message.role === 'assistant'">
      <AgentTypingBubble v-if="showTyping" />
      <div
        v-else-if="message.content?.trim() || message.toolCalls?.length"
        class="bg-muted/40 rounded-lg border px-3 py-2"
      >
        <AgentMarkdown
          v-if="message.content?.trim()"
          :content="message.content"
        />
        <div
          v-if="message.toolCalls?.length"
          class="mt-2 space-y-2 border-t pt-2"
          :class="message.content?.trim() ? '' : 'mt-0 border-t-0 pt-0'"
        >
          <div
            v-for="tc in message.toolCalls"
            :key="tc.id"
            class="bg-background rounded-md border p-2 text-xs"
          >
            <div class="mb-1 font-medium">{{ $t('agent.toolCall') }}: {{ tc.name }}</div>
            <pre class="overflow-x-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed">{{
              prettyJson(tc.arguments)
            }}</pre>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else-if="message.role === 'user'"
      class="bg-background flex flex-col gap-2 rounded-lg border px-3 py-2 text-sm leading-relaxed"
    >
      <div
        v-if="imageParts.length"
        class="flex flex-wrap gap-2"
        data-testid="agent-message-images"
      >
        <img
          v-for="(p, i) in imageParts"
          :key="`${p.image_url.url}-${i}`"
          :src="p.image_url.url"
          :alt="p.name || 'image'"
          class="max-h-48 max-w-full rounded-md border object-contain"
        >
      </div>
      <div
        v-if="userText"
        class="whitespace-pre-wrap"
      >
        {{ userText }}
      </div>
      <div
        v-else-if="!imageParts.length"
        class="whitespace-pre-wrap"
      >
        {{ message.content || '[image]' }}
      </div>
    </div>

    <div
      v-else-if="message.role === 'tool'"
      class="bg-muted/30 text-muted-foreground rounded-lg border px-3 py-2"
    >
      <div class="mb-1 text-xs font-medium">{{ $t('agent.toolResult') }}</div>
      <pre class="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">{{
        formatToolContent(message.content)
      }}</pre>
    </div>

    <div
      v-else
      class="text-muted-foreground rounded-lg border px-3 py-2 text-xs whitespace-pre-wrap"
    >
      {{ message.content }}
    </div>
  </article>
</template>
