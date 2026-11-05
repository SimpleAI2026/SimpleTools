<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChatContentPart, ChatMessage } from '@/agent'
import AgentMarkdown from '@/components/agent/AgentMarkdown.vue'

const props = defineProps<{ message: ChatMessage }>()

const { t } = useI18n()

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
</script>

<template>
  <article
    class="flex flex-col gap-1.5"
    :data-role="message.role"
    :data-testid="`agent-message-${message.role}`"
  >
    <div class="text-muted-foreground text-xs font-medium tracking-wide">
      {{ roleLabel(message.role) }}
      <span v-if="message.status === 'streaming'" class="ml-2 font-normal">
        {{ $t('agent.streaming') }}
      </span>
    </div>

    <div
      v-if="message.role === 'assistant'"
      class="bg-muted/40 rounded-lg border px-3 py-2"
    >
      <AgentMarkdown :content="message.content" />
      <div
        v-if="message.toolCalls?.length"
        class="mt-2 space-y-2 border-t pt-2"
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
