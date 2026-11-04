<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/stores/agent'
import { cn } from '@/lib/utils'

const agent = useAgentStore()
</script>

<template>
  <aside class="flex h-full w-56 shrink-0 flex-col border-r sm:w-64" data-testid="agent-thread-list">
    <div class="border-b p-2">
      <Button size="sm" class="w-full" data-testid="agent-new-thread" @click="agent.newThread()">
        <Plus /> {{ $t('agent.newChat') }}
      </Button>
    </div>
    <ul class="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
      <li v-for="th in agent.threads" :key="th.id" class="group relative">
        <button
          type="button"
          :class="
            cn(
              'hover:bg-accent w-full truncate rounded-md px-2 py-1.5 pr-8 text-left text-sm',
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
          class="absolute top-1/2 right-0.5 size-7 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          :aria-label="$t('agent.deleteThread')"
          @click="agent.deleteThread(th.id)"
        >
          <Trash2 class="size-3.5" />
        </Button>
      </li>
    </ul>
  </aside>
</template>
