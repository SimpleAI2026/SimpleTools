<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import SheetTable from '@/components/shared/SheetTable.vue'
import { downloadBlob } from '@/lib/download'
import { buildWorkbook, XLSX_MIME } from '@/lib/excel'
import { csvToRows, type CsvToExcelOptions } from './logic'

const SAMPLE_CSV = 'Name,Category,Offline,Notes\nSimpleTools,toolbox,true,Front-end only\nToken Counter,AI Agent,true,gpt-tokenizer\nExcel Viewer,Office,true,exceljs'
const text = ref(SAMPLE_CSV)
const files = ref<File[]>([])
const name = ref('Sheet1')
const o = reactive<CsvToExcelOptions>({ delimiter: '', inferTypes: true, header: true })
const error = ref('')
const preview = computed(() => {
  try {
    return csvToRows(text.value, { ...o, inferTypes: false }).slice(0, 50) as string[][]
  } catch {
    return []
  }
})
function loadSample() {
  files.value = []
  text.value = SAMPLE_CSV
}
async function convert() {
  error.value = ''
  try {
    const sheets = files.value.length
      ? await Promise.all(files.value.map(async (f) => ({ name: f.name.replace(/\.[^.]+$/, ''), rows: csvToRows(await f.text(), o), header: o.header })))
      : [{ name: name.value || 'Sheet1', rows: csvToRows(text.value, o), header: o.header }]
    const bytes = await buildWorkbook(sheets)
    downloadBlob(new Blob([bytes as BlobPart], { type: XLSX_MIME }), `${files.value.length === 1 ? sheets[0]!.name : name.value || 'workbook'}.xlsx`)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept=".csv,.tsv,.txt,text/csv" multiple :label="$t('tools.csv-to-excel.drop')" @files="(fs) => (files = fs)" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <span v-if="files.length" class="text-sm">{{ $t('tools.csv-to-excel.files', { n: files.length }) }} <Button size="sm" variant="ghost" @click="files = []">{{ $t('common.clear') }}</Button></span>
    <Textarea v-else v-model="text" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" data-testid="tool-input" />
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.csv-to-excel.delimiter') }}</span>
      <ModeToggle v-model="o.delimiter" :options="[['', $t('tools.csv-to-excel.auto')], [',', ','], [';', ';'], ['\t', 'Tab']]" />
      <Label><Switch v-model="o.header" /> {{ $t('tools.csv-to-excel.header') }}</Label>
      <Label><Switch v-model="o.inferTypes" /> {{ $t('tools.csv-to-excel.inferTypes') }}</Label>
      <Label v-if="!files.length">{{ $t('tools.csv-to-excel.sheetName') }} <Input v-model="name" class="w-32" /></Label>
      <Button @click="convert"><Download /> {{ $t('tools.csv-to-excel.convert') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <SheetTable v-if="!files.length && preview.length" :rows="preview" :header="o.header" />
  </div>
</template>
