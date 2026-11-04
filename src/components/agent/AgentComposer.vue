<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUp, Square } from 'lucide-vue-next'
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
        class="bg-background focus-within:border-ring focus-within:ring-ring/50 flex min-h-[108px] items-end gap-2 rounded-2xl border p-3 shadow-xs focus-within:ring-[3px]"
      >
        <Textarea
          v-model="draft"
          class="min-h-[84px] h-auto max-h-48 flex-1 resize-none border-0 bg-transparent px-1 py-1 font-sans shadow-none focus-visible:border-transparent focus-visible:ring-0"
          :placeholder="$t('agent.placeholder')"
          :disabled="agent.streaming"
          rows="3"
          data-testid="agent-composer-input"
          @keydown="onKeydown"
        />
        <Button
          v-if="agent.streaming"
          variant="outline"
          size="icon"
          class="mb-0.5 size-8 shrink-0 rounded-full"
          data-testid="agent-stop"
          :aria-label="$t('agent.stop')"
          @click="agent.stop()"
        >
          <Square class="size-3 fill-current" />
        </Button>
        <Button
          v-else
          size="icon"
          class="mb-0.5 size-8 shrink-0 rounded-full"
          data-testid="agent-send"
          :disabled="!canSend"
          :aria-label="$t('agent.send')"
          @click="submit"
        >
          <ArrowUp class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
