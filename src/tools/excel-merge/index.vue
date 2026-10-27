<script setup lang="ts">
import { ref } from 'vue'
import { Download, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadBlob } from '@/lib/download'
import { buildWorkbook, readSpreadsheet, SPREADSHEET_ACCEPT, XLSX_MIME } from '@/lib/excel'
import { loadSampleExcel } from '@/lib/sampleExcel'
import { mergeSheets, type MergeMode, type MergeSource } from './logic'

const sources = ref<MergeSource[]>([])
const mode = ref<MergeMode>('sheets')
const header = ref(true)
const sourceCol = ref(false)
const error = ref('')
const busy = ref(false)
async function onFiles(fs: File[]) {
  error.value = ''
  for (const f of fs) {
    try {
      sources.value.push({ file: f.name.replace(/\.[^.]+$/, ''), sheets: await readSpreadsheet(await f.arrayBuffer(), f.name) })
    } catch (e) {
      error.value = `${f.name}: ${(e as Error).message}`
    }
  }
}
async function loadSample() {
  const a = await loadSampleExcel()
  const b = await loadSampleExcel()
  await onFiles([a, b])
}
async function merge() {
  busy.value = true
  try {
    const bytes = await buildWorkbook(mergeSheets(sources.value, mode.value, header.value, sourceCol.value))
    downloadBlob(new Blob([bytes as BlobPart], { type: XLSX_MIME }), 'merged.xlsx')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="SPREADSHEET_ACCEPT" multiple :label="$t('tools.excel-merge.drop')" @files="onFiles" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <div v-if="sources.length" class="flex flex-col divide-y rounded-md border">
      <div v-for="(s, i) in sources" :key="i" class="flex items-center gap-3 p-2 text-sm">
        <span class="flex-1">{{ s.file }}</span>
        <span class="text-muted-foreground">{{ $t('tools.excel-merge.sheetCount', { n: s.sheets.length }) }}</span>
        <Button size="icon" variant="ghost" :aria-label="$t('common.remove')" @click="sources.splice(i, 1)"><Trash2 /></Button>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.excel-merge.mode') }}</span>
      <ModeToggle v-model="mode" :options="[['sheets', $t('tools.excel-merge.sheets')], ['stack', $t('tools.excel-merge.stack')]]" />
      <Label><Switch v-model="header" /> {{ $t('tools.excel-merge.header') }}</Label>
      <Label v-if="mode === 'stack'"><Switch v-model="sourceCol" /> {{ $t('tools.excel-merge.sourceColumn') }}</Label>
      <Button :disabled="sources.length < 1 || busy" @click="merge"><Download /> {{ $t('tools.excel-merge.merge') }}</Button>
    </div>
  </div>
</template>
