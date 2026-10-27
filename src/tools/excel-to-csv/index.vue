<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadBlob, downloadText } from '@/lib/download'
import { loadSampleExcel } from '@/lib/sampleExcel'
import { useSpreadsheet } from '@/lib/useSpreadsheet'
import { zipBlobs } from '@/lib/zip'
import { csvFileName, sheetToCsv, type CsvExportOptions } from './logic'

const { sheets, active, sheet, baseName, error, load } = useSpreadsheet()
async function loadSample() {
  await load(await loadSampleExcel())
}
const o = reactive<CsvExportOptions>({ delimiter: ',', bom: true })
const all = ref(false)
const preview = computed(() => (sheet.value ? sheetToCsv({ ...sheet.value, rows: sheet.value.rows.slice(0, 200) }, { ...o, bom: false }) : ''))
async function exportCsv() {
  if (all.value && sheets.value.length > 1) {
    const entries = sheets.value.map((s) => ({ name: csvFileName(baseName.value, s.name, o.delimiter, true), blob: new Blob([sheetToCsv(s, o)], { type: 'text/csv' }) }))
    downloadBlob(await zipBlobs(entries), `${baseName.value}-csv.zip`)
  } else if (sheet.value) downloadText(sheetToCsv(sheet.value, o), csvFileName(baseName.value, sheet.value.name, o.delimiter, sheets.value.length > 1), 'text/csv;charset=utf-8')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept=".xlsx" :label="$t('tools.excel-to-csv.drop')" @file="load" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="sheet">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.excel-to-csv.sheet') }}</span>
        <ModeToggle v-model="active" :options="sheets.map((s, i) => [i, s.name] as const)" />
        <Label v-if="sheets.length > 1"><Switch v-model="all" /> {{ $t('tools.excel-to-csv.all') }}</Label>
        <span class="text-sm">{{ $t('tools.excel-to-csv.delimiter') }}</span>
        <ModeToggle v-model="o.delimiter" :options="[[',', ','], [';', ';'], ['\t', 'Tab']]" />
        <Label><Switch v-model="o.bom" /> {{ $t('tools.excel-to-csv.bom') }}</Label>
        <Button @click="exportCsv"><Download /> {{ $t('tools.excel-to-csv.export') }}</Button>
      </div>
      <Textarea :model-value="preview" readonly class="bg-muted/40 min-h-[500px] font-mono min-h-[500px] h-[500px]" data-testid="tool-output" />
    </template>
  </div>
</template>
