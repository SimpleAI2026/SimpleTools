<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import { codePoints, searchEmoji, type EmojiEntry } from './logic'

const query = ref('')
const entries = ref<EmojiEntry[]>([])
const hits = computed(() => searchEmoji(entries.value, query.value))
function copy(value: string) {
  void navigator.clipboard?.writeText(value)
}
const text = computed(() => hits.value.map((entry) => `${entry.emoji}\t${codePoints(entry.emoji)}\t${entry.name}`).join('\n'))
onMounted(() => {
  void import('unicode-emoji-json').then((mod) => {
    const data = mod.default as Record<string, { name: string; group: string }>
    entries.value = Object.entries(data).map(([emoji, row]) => ({ emoji, name: row.name, group: row.group }))
  })
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <Input v-model="query" :placeholder="$t('tools.emoji-picker.search')" />
    <div class="flex h-8 items-center justify-between"><span class="text-sm font-medium">{{ $t('common.output') }}</span><CopyButton :text="text" /></div>
    <p v-if="!entries.length" class="text-muted-foreground text-sm">{{ $t('tools.emoji-picker.loading') }}</p>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3" data-testid="tool-output">
      <button v-for="entry in hits" :key="entry.emoji" type="button" class="hover:bg-accent rounded-md border p-2 text-left" @click="copy(entry.emoji)">
        <span class="text-2xl">{{ entry.emoji }}</span>
        <span class="text-muted-foreground mt-1 block text-xs">{{ entry.name }}</span>
        <span class="text-muted-foreground block font-mono text-[10px]">{{ codePoints(entry.emoji) }}</span>
      </button>
    </div>
  </div>
</template>
