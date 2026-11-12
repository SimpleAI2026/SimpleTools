<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { formatKeyInfo, keyInfoFrom, type KeyInfo } from './logic'

const FIELDS = ['key', 'code', 'keyCode', 'location', 'alt', 'ctrl', 'shift', 'meta', 'repeat'] as const
const info = ref<KeyInfo | null>(null)
const rows = computed(() => (info.value ? FIELDS.map((field) => ({ field, value: String(info.value?.[field]) })) : []))
const text = () => (info.value ? formatKeyInfo(info.value) : '')
function onKey(event: KeyboardEvent) {
  event.preventDefault()
  info.value = keyInfoFrom(event)
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.keycode-info.hint') }}</p>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text()" /></div>
      <dl v-if="rows.length" class="grid gap-2 sm:grid-cols-2" data-testid="tool-output">
        <div v-for="row in rows" :key="row.field" class="rounded-md border px-3 py-2">
          <dt class="text-muted-foreground text-xs">{{ row.field }}</dt>
          <dd class="font-mono">{{ row.value }}</dd>
        </div>
      </dl>
      <p v-else class="text-muted-foreground text-sm">{{ $t('tools.keycode-info.empty') }}</p>
    </section>
  </div>
</template>
