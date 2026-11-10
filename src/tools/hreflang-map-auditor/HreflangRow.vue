<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PageRow { url: string; lang: string; alternates: string }
defineProps<{ row: PageRow; index: number }>()
const emit = defineEmits<{ update: [patch: Partial<PageRow>]; remove: [] }>()
</script>

<template>
  <div class="grid gap-2 rounded-md border p-3 lg:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)_2rem]">
    <Input :model-value="row.url" class="font-mono text-xs" placeholder="https://example.com/en/" :aria-label="`URL ${index + 1}`" @update:model-value="emit('update', { url: String($event ?? '') })" />
    <Input :model-value="row.lang" class="font-mono text-xs" placeholder="en / x-default" :aria-label="$t('tools.hreflang-map-auditor.language')" @update:model-value="emit('update', { lang: String($event ?? '') })" />
    <Input :model-value="row.alternates" class="font-mono text-xs" aria-label="Hreflang" @update:model-value="emit('update', { alternates: String($event ?? '') })" />
    <Button variant="ghost" size="sm" class="justify-self-end" :aria-label="$t('common.remove')" @click="emit('remove')">×</Button>
  </div>
</template>
