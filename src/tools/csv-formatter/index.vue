<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { formatCsv, type CsvFormatOptions } from './logic'

const SAMPLE = 'name, city ,score\nAlice,"New York, NY",92\n张三,北京,88\nBob,London'
const input = ref(SAMPLE)
const o = reactive<CsvFormatOptions>({ inDelimiter: '', outDelimiter: ',', output: 'csv', quoteAll: false, trim: true })
const result = computed(() => {
  if (!input.value.trim()) return { text: '', err: '', rows: 0, cols: 0 }
  try {
    return { ...formatCsv(input.value, o), err: '' }
  } catch (e) {
    return { text: '', err: (e as Error).message, rows: 0, cols: 0 }
  }
})
const delims = [[',', ','], [';', ';'], ['\t', 'Tab'], ['|', '|']] as const
</script>

<template>
  <TextIO v-model="input" :output="result.text" :error="result.err" :sample="SAMPLE">
    <span class="text-sm">{{ $t('tools.csv-formatter.inDelimiter') }}</span>
    <ModeToggle v-model="o.inDelimiter" :options="[['', $t('tools.csv-formatter.auto')], ...delims]" />
    <span class="text-sm">{{ $t('tools.csv-formatter.output') }}</span>
    <ModeToggle v-model="o.output" :options="[['csv', 'CSV'], ['markdown', 'Markdown'], ['aligned', $t('tools.csv-formatter.aligned')]]" />
    <template v-if="o.output === 'csv'">
      <span class="text-sm">{{ $t('tools.csv-formatter.outDelimiter') }}</span>
      <ModeToggle v-model="o.outDelimiter" :options="delims" />
      <Label><Switch v-model="o.quoteAll" /> {{ $t('tools.csv-formatter.quoteAll') }}</Label>
    </template>
    <Label><Switch v-model="o.trim" /> {{ $t('tools.csv-formatter.trim') }}</Label>
    <span class="text-muted-foreground text-xs">{{ $t('tools.csv-formatter.stats', result) }}</span>
  </TextIO>
</template>
