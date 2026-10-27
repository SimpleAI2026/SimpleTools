<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { ref } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { CASES, convertCase } from './logic'

const SAMPLE = 'hello world XMLHttpRequest user_id'
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
    <Label>{{ $t('common.input') }}</Label>
    <Textarea v-model="input" class="min-h-[500px] min-h-[500px] h-[500px]" spellcheck="false" />
    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="c in CASES" :key="c" class="flex flex-col gap-1 rounded-md border p-3">
        <div class="flex items-center justify-between">
          <span class="text-muted-foreground text-xs">{{ $t(`tools.case-converter.cases.${c}`) }}</span>
          <CopyButton :text="convertCase(input, c)" :label="false" />
        </div>
        <code class="font-mono text-sm break-all whitespace-pre-wrap">{{ convertCase(input, c) || '—' }}</code>
      </div>
    </div>
  </div>
</template>
