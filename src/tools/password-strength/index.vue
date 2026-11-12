<script setup lang="ts">
import { computed, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { analyzePassword, formatDuration } from './logic'

const password = ref('')
const report = computed(() => analyzePassword(password.value))
const text = computed(() => {
  const item = report.value
  return [`length: ${item.length}`, `charset: ${item.charset}`, `entropy: ${item.entropyBits.toFixed(1)} bits`, `rating: ${item.rating}`, `offline: ${formatDuration(item.seconds) || '—'}`].join('\n')
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <Label class="flex flex-col items-start gap-2">{{ $t('tools.password-strength.password') }}<Textarea v-model="password" class="min-h-24 font-mono" autocomplete="off" /></Label>
    <p class="text-muted-foreground text-sm">{{ $t('tools.password-strength.note') }}</p>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 whitespace-pre-wrap" data-testid="tool-output">{{ text }}</pre>
    </section>
  </div>
</template>
