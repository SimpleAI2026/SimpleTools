<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { downloadText } from '@/lib/download'
import { present, type AbTestResult, type Alternative } from './logic'

const form = reactive({ trialsA: 1000, successA: 100, trialsB: 1000, successB: 130, alternative: 'two-sided' as Alternative, alpha: 0.05 })
const result = computed(() => {
  const presented = present(JSON.stringify(form))
  if (presented.error || !presented.jsonText) return { error: presented.error || 'bad-input', data: null, json: '', csv: '' }
  return { error: '', data: (JSON.parse(presented.jsonText) as { result: AbTestResult }).result, json: presented.jsonText, csv: presented.csv }
})
const percent = (value: number) => `${(value * 100).toFixed(2)}%`
function sample() {
  Object.assign(form, { trialsA: 1000, successA: 100, trialsB: 1000, successB: 130, alternative: 'two-sided', alpha: 0.05 })
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <p class="text-muted-foreground text-sm">{{ $t('tools.ab-test-analyzer.disclaimer') }}</p>
    <div class="grid gap-4 md:grid-cols-2">
      <fieldset v-for="group in ['A', 'B'] as const" :key="group" class="flex flex-col gap-3 rounded-lg border p-4">
        <legend class="px-1 text-sm font-semibold">{{ $t(`tools.ab-test-analyzer.group${group}`) }}</legend>
        <Label class="flex flex-col items-start gap-2 text-sm">{{ $t('tools.ab-test-analyzer.trials') }}
          <Input v-model.number="form[`trials${group}`]" type="number" min="1" step="1" :data-testid="`trials${group}`" />
        </Label>
        <Label class="flex flex-col items-start gap-2 text-sm">{{ $t('tools.ab-test-analyzer.conversions') }}
          <Input v-model.number="form[`success${group}`]" type="number" min="0" step="1" :data-testid="`success${group}`" />
        </Label>
      </fieldset>
    </div>
    <div class="grid gap-3 sm:grid-cols-2">
      <Label class="flex flex-col items-start gap-2 text-sm">{{ $t('tools.ab-test-analyzer.direction') }}
        <select v-model="form.alternative" class="border-input bg-background h-10 rounded-md border px-3" data-testid="alternative">
          <option value="two-sided">{{ $t('tools.ab-test-analyzer.twoSided') }}</option>
          <option value="greater">{{ $t('tools.ab-test-analyzer.greater') }}</option>
          <option value="less">{{ $t('tools.ab-test-analyzer.less') }}</option>
        </select>
      </Label>
      <Label class="flex flex-col items-start gap-2 text-sm">α
        <Input v-model.number="form.alpha" type="number" min="0.001" max="0.2" step="0.01" />
      </Label>
    </div>
    <div class="flex gap-2"><Button variant="outline" @click="sample">{{ $t('common.reset') }}</Button></div>
    <ErrorAlert v-if="result.error || result.data?.status === 'invalid'" :message="$t('common.badInput')" />
    <section v-else-if="result.data" class="flex flex-col gap-4" aria-live="polite" data-testid="ab-result">
      <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-md border p-3"><div class="text-muted-foreground text-xs">{{ $t('tools.ab-test-analyzer.rateA') }}</div><div class="mt-1 text-xl font-semibold">{{ percent(result.data.rateA) }}</div></div>
        <div class="rounded-md border p-3"><div class="text-muted-foreground text-xs">{{ $t('tools.ab-test-analyzer.rateB') }}</div><div class="mt-1 text-xl font-semibold">{{ percent(result.data.rateB) }}</div></div>
        <div class="rounded-md border p-3"><div class="text-muted-foreground text-xs">{{ $t('tools.ab-test-analyzer.difference') }}</div><div class="mt-1 text-xl font-semibold">{{ percent(result.data.difference) }}</div></div>
        <div class="rounded-md border p-3"><div class="text-muted-foreground text-xs">z / p</div><div class="mt-1 font-mono text-sm">{{ result.data.z }} / {{ result.data.p }}</div></div>
      </div>
      <p v-if="!result.data.applicable" class="rounded-md border border-amber-600/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">{{ $t('tools.ab-test-analyzer.notApplicable') }}</p>
      <p v-else :class="result.data.significant ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'" class="text-sm font-medium">
        {{ result.data.significant ? $t('tools.ab-test-analyzer.significant') : $t('tools.ab-test-analyzer.notSignificant') }}
      </p>
      <div class="flex flex-wrap gap-2">
        <Button variant="secondary" @click="downloadText(result.json, 'ab-test-analysis.json', 'application/json')">{{ $t('common.downloadJson') }}</Button>
        <Button variant="secondary" @click="downloadText(result.csv, 'ab-test-analysis.csv', 'text/csv;charset=utf-8')">{{ $t('common.downloadCsv') }}</Button>
      </div>
    </section>
  </div>
</template>
