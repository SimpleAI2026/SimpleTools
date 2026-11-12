<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { formatPercentResult, percentage, type PercentMode } from './logic'

const { t } = useI18n()
const mode = ref<PercentMode>('of')
const a = ref(20)
const b = ref(150)
const modes: PercentMode[] = ['of', 'ratio', 'change', 'add', 'sub']
const value = computed(() => percentage(mode.value, a.value, b.value))
const text = computed(() => (value.value === null ? '' : formatPercentResult(value.value)))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <Button v-for="item in modes" :key="item" size="sm" :variant="mode === item ? 'default' : 'outline'" @click="mode = item">{{ $t(`tools.percentage-calculator.modes.${item}`) }}</Button>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <Label class="flex flex-col items-start gap-2">{{ $t(`tools.percentage-calculator.a.${mode}`) }}<Input v-model.number="a" type="number" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t(`tools.percentage-calculator.b.${mode}`) }}<Input v-model.number="b" type="number" /></Label>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono text-2xl" data-testid="tool-output">{{ text || t('tools.percentage-calculator.invalid') }}</pre>
    </section>
  </div>
</template>
