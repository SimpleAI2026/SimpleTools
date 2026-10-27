<script setup lang="ts">
import { computed, ref } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { countText, type TextStats } from './logic'

const SAMPLE =
  'SimpleTools 是一套离线优先的本地工具箱。\n\nOffline-first toolkit with 100+ utilities — no upload, no account.\n\nWords · 字数 · CJK 中文'
const text = ref(SAMPLE)
const stats = computed(() => countText(text.value))
const keys: (keyof TextStats)[] = ['words', 'characters', 'charactersNoSpaces', 'cjkCharacters', 'sentences', 'paragraphs', 'lines', 'readingMinutes']

function loadSample() {
  text.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="k in keys" :key="k" class="rounded-lg border p-3">
        <div class="text-2xl font-semibold tabular-nums">{{ stats[k] }}</div>
        <div class="text-muted-foreground text-xs">{{ $t(`tools.word-counter.${k}`) }}</div>
      </div>
    </div>
    <Textarea v-model="text" class="min-h-[500px] font-sans min-h-[500px] h-[500px]" :placeholder="$t('tools.word-counter.placeholder')" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
      <Button size="sm" variant="ghost" @click="text = ''">{{ $t('common.clear') }}</Button>
    </div>
  </div>
</template>
