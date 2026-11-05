<script setup lang="ts">
import { Plus, Trash2, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAgentStore } from '@/stores/agent'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ mobileOpen?: boolean }>(), { mobileOpen: false })
const emit = defineEmits<{ close: [] }>()
const agent = useAgentStore()

function select(id: string) {
  agent.selectThread(id)
  emit('close')
}
</script>

<template>
  <aside
    class="hidden h-full w-56 shrink-0 flex-col border-r md:flex sm:w-64"
    data-testid="agent-thread-list"
  >
    <div class="border-b p-2">
      <Button size="sm" class="h-11 w-full md:h-8" data-testid="agent-new-thread" @click="agent.newThread()">
        <Plus /> {{ $t('agent.newChat') }}
      </Button>
    </div>
    <ul class="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
      <li v-for="th in agent.threads" :key="th.id" class="group relative">
        <button
          type="button"
          :class="
            cn(
              'hover:bg-accent min-h-11 w-full truncate rounded-md px-2 py-1.5 pr-10 text-left text-sm md:min-h-0',
              th.id === agent.currentThreadId && 'bg-accent font-medium',
            )
          "
          @click="select(th.id)"
        >
          {{ th.title || $t('agent.newChat') }}
        </button>
        <Button
          variant="ghost"
          size="icon"
          class="absolute top-1/2 right-0.5 size-9 -translate-y-1/2 opacity-100"
          :aria-label="$t('agent.deleteThread')"
          @click="agent.deleteThread(th.id)"
        >
          <Trash2 class="size-3.5" />
        </Button>
      </li>
    </ul>
  </aside>

  <Teleport to="body">
    <div
      v-if="props.mobileOpen"
      class="fixed inset-0 z-50 md:hidden"
      data-testid="agent-thread-drawer"
    >
      <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
      <aside
        class="bg-background absolute inset-y-0 left-0 flex w-[min(18rem,85vw)] flex-col border-r shadow-lg"
        role="dialog"
        :aria-label="$t('agent.openThreads')"
      >
        <div class="flex items-center gap-2 border-b p-2">
          <Button size="sm" class="h-11 flex-1" data-testid="agent-new-thread-mobile" @click="agent.newThread(); emit('close')">
            <Plus /> {{ $t('agent.newChat') }}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="size-11 shrink-0"
            :aria-label="$t('agent.closeThreads')"
            @click="emit('close')"
          >
            <X />
          </Button>
        </div>
        <ul class="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          <li v-for="th in agent.threads" :key="th.id" class="group relative">
            <button
              type="button"
              :class="
                cn(
                  'hover:bg-accent min-h-11 w-full truncate rounded-md px-2 py-1.5 pr-10 text-left text-sm',
                  th.id === agent.currentThreadId && 'bg-accent font-medium',
                )
              "
              @click="select(th.id)"
            >
              {{ th.title || $t('agent.newChat') }}
            </button>
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-1/2 right-0.5 size-9 -translate-y-1/2 opacity-100"
              :aria-label="$t('agent.deleteThread')"
              @click="agent.deleteThread(th.id)"
            >
              <Trash2 class="size-3.5" />
            </Button>
          </li>
        </ul>
      </aside>
    </div>
  </Teleport>
</template>
