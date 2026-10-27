<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import SheetTable from '@/components/shared/SheetTable.vue'
import { downloadBlob } from '@/lib/download'
import { buildWorkbook, cellText, XLSX_MIME, type SheetInput } from '@/lib/excel'
import { parsePageRanges } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { pdfToSheets } from './logic'

const { file, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const range = ref('')
const mode = ref<'per-page' | 'single'>('per-page')
const numbers = ref(true)
const sheets = shallowRef<SheetInput[]>([])
const active = ref(0)
const preview = computed(() => (sheets.value[active.value]?.rows ?? []).map((r) => r.map((c) => cellText(c as never))))
async function run() {
  if (!doc.value) return
  busy.value = true
  try {
    sheets.value = await pdfToSheets(doc.value, parsePageRanges(range.value, numPages.value), mode.value, numbers.value)
    active.value = 0
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
async function download() {
  downloadBlob(new Blob([(await buildWorkbook(sheets.value)) as BlobPart], { type: XLSX_MIME }), `${baseName()}.xlsx`)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="doc">
      <div class="flex flex-wrap items-center gap-3">
        <Label>{{ $t('common.pageRange') }} <Input v-model="range" class="w-40" :placeholder="$t('common.allPages')" /></Label>
        <ModeToggle v-model="mode" :options="[['per-page', $t('tools.pdf-to-excel.perPage')], ['single', $t('tools.pdf-to-excel.single')]]" />
        <Label><Switch v-model="numbers" /> {{ $t('tools.pdf-to-excel.numbers') }}</Label>
        <Button :disabled="busy" @click="run">{{ $t('tools.pdf-to-excel.run') }}</Button>
      </div>
      <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-to-excel.note') }}</p>
    </template>
    <template v-if="sheets.length">
      <div class="flex flex-wrap gap-2">
        <Button v-for="(s, i) in sheets" :key="s.name" size="sm" :variant="i === active ? 'default' : 'outline'" @click="active = i">{{ s.name }}</Button>
        <Button size="sm" @click="download"><Download /> {{ $t('tools.pdf-to-excel.download') }}</Button>
      </div>
      <SheetTable :rows="preview" :limit="200" />
    </template>
  </div>
</template>
