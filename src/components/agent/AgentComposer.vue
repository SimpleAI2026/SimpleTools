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
  <div class="border-t p-3 sm:p-4" data-testid="agent-composer">
    <div class="mx-auto max-w-3xl">
      <div
        class="bg-background focus-within:border-ring focus-within:ring-ring/50 flex items-end gap-2 rounded-xl border p-2 shadow-xs focus-within:ring-[3px]"
      >
        <Textarea
          v-model="draft"
          class="min-h-[44px] h-auto max-h-40 flex-1 resize-none border-0 bg-transparent px-2 py-1.5 font-sans shadow-none focus-visible:border-transparent focus-visible:ring-0"
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
          class="mb-0.5 size-8 shrink-0"
          data-testid="agent-stop"
          :aria-label="$t('agent.stop')"
          @click="agent.stop()"
        >
          <Square class="size-3.5 fill-current" />
        </Button>
        <Button
          v-else
          size="icon"
          class="mb-0.5 size-8 shrink-0"
          data-testid="agent-send"
          :disabled="!canSend"
          :aria-label="$t('agent.send')"
          @click="submit"
        >
          <Send class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
