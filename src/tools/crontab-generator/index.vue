<script setup lang="ts">
import { computed, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { buildCron, CRON_PRESETS, everyField, FIELD_ORDER, parseCron, previewCron, type FieldKind, type FieldMode, type FieldSpec } from './logic'

const { t, locale } = useI18n()
const fields = reactive<Record<FieldKind, FieldSpec>>({
  minute: { mode: 'list', values: [0], from: 0, to: 0, step: 1 },
  hour: { mode: 'range', values: [], from: 9, to: 17, step: 1 },
  dom: everyField(),
  month: everyField(),
  dow: { mode: 'range', values: [], from: 1, to: 5, step: 1 },
})
const listText = reactive<Record<FieldKind, string>>({ minute: '0', hour: '', dom: '', month: '', dow: '' })

function currentFields(): Record<FieldKind, FieldSpec> {
  const out = {} as Record<FieldKind, FieldSpec>
  for (const kind of FIELD_ORDER) {
    const spec = { ...fields[kind] }
    if (spec.mode === 'list') spec.values = listText[kind].split(/[,\s]+/).map(Number).filter((n) => Number.isInteger(n))
    out[kind] = spec
  }
  return out
}

function applyPreset(expression: string) {
  const parsed = parseCron(expression)
  if (!parsed) return
  for (const kind of FIELD_ORDER) {
    fields[kind] = parsed[kind]
    listText[kind] = parsed[kind].values.join(',')
  }
}

const expr = computed(() => buildCron(currentFields()))
const preview = computed(() => {
  try {
    const fmt = new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' })
    return { error: '', runs: previewCron(expr.value, 5).map((date) => fmt.format(date)) }
  } catch (error) {
    return { error: error instanceof Error ? error.message : t('common.badInput'), runs: [] }
  }
})
const modes: FieldMode[] = ['every', 'list', 'range', 'step']
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <Button v-for="preset in CRON_PRESETS" :key="preset.id" size="sm" variant="outline" @click="applyPreset(preset.expr)">
        {{ $t(`tools.crontab-generator.presets.${preset.id}`) }}
      </Button>
    </div>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div v-for="kind in FIELD_ORDER" :key="kind" class="flex flex-col gap-2 rounded-md border p-3">
        <Label>{{ $t(`tools.crontab-generator.fields.${kind}`) }}</Label>
        <select v-model="fields[kind].mode" class="border-input bg-background h-10 rounded-md border px-2 text-sm">
          <option v-for="mode in modes" :key="mode" :value="mode">{{ $t(`tools.crontab-generator.modes.${mode}`) }}</option>
        </select>
        <Input v-if="fields[kind].mode === 'list'" v-model="listText[kind]" class="font-mono" :placeholder="$t('tools.crontab-generator.listHint')" />
        <div v-else-if="fields[kind].mode === 'range'" class="flex gap-2">
          <Input v-model.number="fields[kind].from" type="number" />
          <Input v-model.number="fields[kind].to" type="number" />
        </div>
        <Input v-else-if="fields[kind].mode === 'step'" v-model.number="fields[kind].step" type="number" min="1" />
      </div>
    </div>
    <ErrorAlert v-if="preview.error" :message="preview.error" />
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }}</Label>
        <CopyButton :text="expr" />
      </div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono text-lg" data-testid="tool-output">{{ expr }}</pre>
      <ol v-if="preview.runs.length" class="text-muted-foreground list-decimal space-y-1 pl-5 text-sm">
        <li v-for="run in preview.runs" :key="run">{{ run }}</li>
      </ol>
    </section>
    <RouterLink to="/tools/cron-parser" class="text-primary text-sm underline">{{ $t('tools.crontab-generator.openParser') }}</RouterLink>
  </div>
</template>
