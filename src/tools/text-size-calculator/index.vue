<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
import { Textarea } from '@/components/ui/textarea'
import { formatBytes } from '@/lib/format'
import { measureText, smsSegments, type SizeReport } from './logic'

const SAMPLE = 'Hello, 世界 😀'
const text = ref(SAMPLE)
const r = computed(() => measureText(text.value))
const sms = computed(() => smsSegments(text.value))
const keys: (keyof SizeReport)[] = ['chars', 'utf8', 'utf16', 'utf32', 'latin1', 'base64', 'urlEncoded', 'lines']
const bytesKeys = new Set(['utf8', 'utf16', 'utf32', 'latin1'])

function loadSample() {
  text.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="k in keys" :key="k" class="rounded-lg border p-3">
        <div class="text-xl font-semibold tabular-nums">{{ r[k] ?? $t('tools.text-size-calculator.na') }}</div>
        <div class="text-muted-foreground text-xs">
          {{ $t(`tools.text-size-calculator.${k}`) }}<span v-if="bytesKeys.has(k) && r[k] !== null && (r[k] as number) >= 1024"> · {{ formatBytes(r[k] as number) }}</span>
        </div>
      </div>
    </div>
    <p class="text-muted-foreground text-sm">{{ $t('tools.text-size-calculator.sms', { enc: sms.encoding, n: sms.segments }) }}</p>
    <Textarea v-model="text" class="min-h-[500px] font-sans min-h-[500px] h-[500px]" :placeholder="$t('tools.text-size-calculator.placeholder')" />
  </div>
</template>
