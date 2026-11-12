<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { estimateEta, formatDuration } from './logic'

const { t, locale } = useI18n()
const done = ref(25)
const total = ref(100)
const elapsed = ref(50)
const result = computed(() => estimateEta(done.value, total.value, elapsed.value))
const text = computed(() => {
  if (!result.value) return ''
  const when = new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(result.value.finishAt)
  return `${t('tools.eta-calculator.remaining')}: ${formatDuration(result.value.remainingSeconds)}\n${t('tools.eta-calculator.finish')}: ${when}`
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.eta-calculator.done') }}<Input v-model.number="done" type="number" min="0" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.eta-calculator.total') }}<Input v-model.number="total" type="number" min="0" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.eta-calculator.elapsed') }}<Input v-model.number="elapsed" type="number" min="0" /></Label>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 whitespace-pre-wrap" data-testid="tool-output">{{ text || $t('tools.eta-calculator.invalid') }}</pre>
    </section>
  </div>
</template>
