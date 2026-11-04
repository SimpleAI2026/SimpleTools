<script setup lang="ts">
import { reactive, ref, shallowRef } from 'vue'
import DOMPurify from 'dompurify'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadPdf } from '@/lib/download'
import { renderHtmlToPdf, type HtmlPdfOptions } from '@/lib/htmlPdf'
import { loadSampleDocx } from '@/lib/sampleDocx'
import { DOCX_ACCEPT, docxToHtml } from '@/lib/word'
import { wordHtmlDocument } from './logic'
import { runBusy } from '@/lib/runBusy'

const file = shallowRef<File | null>(null)
const o = reactive<HtmlPdfOptions>({ page: 'a4', landscape: false, margin: 54, ratio: 2 })
const error = ref('')
const busy = ref(false)
async function loadSample() {
  file.value = await loadSampleDocx()
}
async function run() {
  const f = file.value
  if (!f) return
  await runBusy({ busy, error }, async () => {
    const { html } = await docxToHtml(await f.arrayBuffer())
    const safe = DOMPurify.sanitize(wordHtmlDocument(html), { FORCE_BODY: true, ADD_TAGS: ['style'] }) as string
    downloadPdf(await renderHtmlToPdf(safe, o, f.name), f.name.replace(/\.docx$/i, '') + '.pdf')
  }, { clearError: true })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="DOCX_ACCEPT" :label="file?.name ?? $t('tools.word-to-pdf.choose')" @file="(f) => (file = f)" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.word-to-pdf.page') }}</span>
      <ModeToggle v-model="o.page" :options="[['a4', 'A4'], ['letter', 'Letter'], ['a5', 'A5']]" />
    </div>
    <RangeField v-model="o.margin" class="max-w-md" :label="$t('tools.word-to-pdf.margin')" :max="96" unit="pt" />
    <p class="text-muted-foreground text-xs">{{ $t('tools.word-to-pdf.note') }}</p>
    <ErrorAlert v-if="error" :message="error" />
    <div><Button :disabled="!file || busy" @click="run"><Download /> {{ busy ? $t('common.processing') : $t('tools.word-to-pdf.run') }}</Button></div>
  </div>
</template>
