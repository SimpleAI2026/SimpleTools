<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import { STYLE_NAMES, stylize } from './logic'

const SAMPLE = 'Hello World 2026'
const input = ref(SAMPLE)

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <Input v-model="input" :placeholder="$t('tools.unicode-styles.placeholder')" />
    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="s in STYLE_NAMES" :key="s" class="flex items-center gap-2 rounded-md border p-3">
        <div class="min-w-0 flex-1">
          <div class="text-muted-foreground text-xs">{{ $t(`tools.unicode-styles.styles.${s}`) }}</div>
          <div class="truncate text-lg">{{ stylize(input, s) }}</div>
        </div>
        <CopyButton :text="stylize(input, s)" :label="false" />
      </div>
    </div>
  </div>
</template>
