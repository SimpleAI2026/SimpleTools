<script setup lang="ts">
import { computed, ref } from 'vue'
import { Send, Square } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAgentStore } from '@/stores/agent'

const agent = useAgentStore()
const draft = ref('')

const canSend = computed(() => draft.value.trim().length > 0 && !agent.streaming)

async function submit() {
  const text = draft.value.trim()
  if (!text || agent.streaming) return
  draft.value = ''
  const accepted = await agent.send(text)
  // Restore input if send rejected before starting (e.g. missing BYOK settings).
  if (!accepted) draft.value = text
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    void submit()
  }
}
</script>

<template>
  <div class="border-t p-3" data-testid="agent-composer">
    <div class="mx-auto flex max-w-3xl items-end gap-2">
      <Textarea
        v-model="draft"
        class="min-h-[72px] h-auto max-h-40 font-sans"
        :placeholder="$t('agent.placeholder')"
        :disabled="agent.streaming"
        rows="2"
        data-testid="agent-composer-input"
        @keydown="onKeydown"
      />
      <Button
        v-if="agent.streaming"
        variant="outline"
        size="icon"
        class="shrink-0"
        data-testid="agent-stop"
        :aria-label="$t('agent.stop')"
        @click="agent.stop()"
      >
        <Square class="size-3.5 fill-current" />
      </Button>
      <Button
        v-else
        size="icon"
        class="shrink-0"
        data-testid="agent-send"
        :disabled="!canSend"
        :aria-label="$t('agent.send')"
        @click="submit"
      >
        <Send class="size-4" />
      </Button>
    </div>
  </div>
</template>
