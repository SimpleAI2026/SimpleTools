<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { downloadText } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { runFfmpeg, terminateFfmpeg } from '@/tools/ffmpeg/engine'
import { present, SAMPLE, type ProbeFields } from './logic'

const file = ref<File | null>(null)
const probe = ref('')
const contract = reactive({ width: 1280, height: 720, fps: 30, channels: 2 })
const busy = ref(false)
const error = ref(false)
let runId = 0

const report = computed(() => {
  if (!probe.value.trim()) return null
  const presented = present(JSON.stringify({ probe: probe.value, contract }))
  if (presented.error || !presented.jsonText) return null
  const data = (JSON.parse(presented.jsonText) as { result: { overall: 'pass' | 'fail' | 'incomplete'; fields: ProbeFields } }).result
  return { data, json: presented.jsonText, csv: presented.csv }
})
const rows = computed(() => (['width', 'height', 'fps', 'channels'] as const).map((field) => {
  const actual = report.value?.data.fields[field] ?? null
  const expected = contract[field]
  const status = actual == null ? 'unknown' : Math.abs(actual - expected) <= 0.001 ? 'pass' : 'fail'
  return { field, actual, expected, status }
}))

function resetProbe() {
  runId++
  if (busy.value) void terminateFfmpeg()
  busy.value = false
  probe.value = ''
  error.value = false
}
function setFile(value: File) {
  resetProbe()
  file.value = value
}
function clearFile() {
  resetProbe()
  file.value = null
}
async function runProbe() {
  if (!file.value || busy.value) return
  const current = ++runId
  busy.value = true
  error.value = false
  try {
    const result = await runFfmpeg({ file: file.value, format: 'mp4', quality: 'low', mode: 'probe' })
    if (current === runId) probe.value = result.log ?? ''
  } catch {
    if (current === runId) error.value = true
  } finally {
    if (current === runId) busy.value = false
  }
}
function cancel() {
  resetProbe()
}
function useSample() {
  resetProbe()
  file.value = null
  probe.value = (JSON.parse(SAMPLE) as { probe: string }).probe
}
onBeforeUnmount(() => {
  runId++
  void terminateFfmpeg()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.video-delivery-preflight.disclaimer') }}</p>
    <FileDropzone accept="video/*,audio/*" :label="$t('tools.video-delivery-preflight.drop')" @file="setFile" />
    <div v-if="file" class="flex items-center justify-between gap-3 text-sm"><span class="min-w-0 truncate">{{ file.name }} · {{ formatBytes(file.size) }}</span><Button variant="ghost" size="sm" @click="clearFile">{{ $t('common.remove') }}</Button></div>
    <fieldset class="grid grid-cols-2 gap-3 rounded-lg border p-4 lg:grid-cols-4">
      <legend class="px-1 text-sm font-medium">{{ $t('tools.video-delivery-preflight.contract') }}</legend>
      <Label v-for="field in ['width', 'height', 'fps', 'channels'] as const" :key="field" class="flex flex-col items-start gap-2 text-xs">{{ $t(`tools.video-delivery-preflight.${field}`) }}<Input v-model.number="contract[field]" type="number" min="0" :step="field === 'fps' ? 0.01 : 1" :data-testid="`contract-${field}`" /></Label>
    </fieldset>
    <div class="flex flex-wrap gap-2">
      <Button :disabled="!file || busy" data-testid="run-probe" @click="runProbe">{{ busy ? $t('common.processing') : $t('tools.video-delivery-preflight.runProbe') }}</Button>
      <Button v-if="busy" variant="outline" @click="cancel">{{ $t('tools.video-delivery-preflight.cancel') }}</Button>
      <Button variant="outline" @click="useSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="$t('tools.video-delivery-preflight.probeError')" />
    <section v-if="report" class="flex flex-col gap-4" aria-live="polite" data-testid="preflight-result">
      <p class="text-sm font-medium">{{ $t('common.status') }}: <span :class="report.data.overall === 'pass' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'">{{ $t(`common.${report.data.overall}`) }}</span></p>
      <div class="overflow-x-auto rounded-md border"><table class="w-full min-w-[30rem] text-sm"><thead class="bg-muted/60 text-left"><tr><th class="px-3 py-2">{{ $t('common.field') }}</th><th class="px-3 py-2">{{ $t('common.expected') }}</th><th class="px-3 py-2">{{ $t('common.actual') }}</th><th class="px-3 py-2">{{ $t('common.status') }}</th></tr></thead><tbody><tr v-for="row in rows" :key="row.field" class="border-t"><td class="px-3 py-2">{{ $t(`tools.video-delivery-preflight.${row.field}`) }}</td><td class="px-3 py-2">{{ row.expected }}</td><td class="px-3 py-2">{{ row.actual ?? $t('common.unknown') }}</td><td class="px-3 py-2">{{ $t(`common.${row.status}`) }}</td></tr></tbody></table></div>
      <div class="flex flex-wrap gap-2"><Button variant="secondary" @click="downloadText(report.json, 'video-preflight.json', 'application/json')">{{ $t('common.downloadJson') }}</Button><Button variant="secondary" @click="downloadText(report.csv, 'video-preflight.csv', 'text/csv;charset=utf-8')">{{ $t('common.downloadCsv') }}</Button></div>
      <details class="text-xs"><summary>FFmpeg log</summary><Textarea :model-value="probe" readonly class="mt-2 min-h-32 font-mono text-xs" /></details>
    </section>
  </div>
</template>
