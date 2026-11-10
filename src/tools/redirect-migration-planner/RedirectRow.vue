<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface RedirectRow { from: string; to: string; status: string }
defineProps<{ row: RedirectRow }>()
const emit = defineEmits<{ update: [patch: Partial<RedirectRow>]; remove: [] }>()
function updateStatus(event: Event) {
  emit('update', { status: (event.target as HTMLSelectElement).value })
}
</script>

<template>
  <div class="grid gap-2 rounded-md border p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6rem_2rem]">
    <Input :model-value="row.from" class="font-mono text-xs" placeholder="https://example.com/old" :aria-label="$t('tools.redirect-migration-planner.from')" @update:model-value="emit('update', { from: String($event ?? '') })" />
    <Input :model-value="row.to" class="font-mono text-xs" placeholder="https://example.com/new" :aria-label="$t('tools.redirect-migration-planner.to')" @update:model-value="emit('update', { to: String($event ?? '') })" />
    <select :value="row.status" class="border-input bg-background h-9 rounded-md border px-2" :aria-label="$t('common.status')" @change="updateStatus"><option v-for="status in ['301', '302', '307', '308']" :key="status">{{ status }}</option></select>
    <Button variant="ghost" size="sm" class="justify-self-end" :aria-label="$t('common.remove')" @click="emit('remove')">×</Button>
  </div>
</template>
