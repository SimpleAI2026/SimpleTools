<script setup lang="ts">
import { reactive, ref } from 'vue'
import DOMPurify from 'dompurify'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { renderHtmlToPdf, type HtmlPdfOptions } from '@/lib/htmlPdf'
import { pdfBlob } from '@/lib/pdf'
import { SANITIZE_CONFIG } from '@/tools/html-to-image/logic'
import { composeDocument } from './logic'

const SAMPLE_HTML = '<h1>SimpleTools Sample</h1>\n<p>Offline-first developer toolbox. 你好，<b>世界</b>！</p>\n<ul><li>Pure front-end</li><li>Bilingual zh/en</li></ul>\n<table border="1" cellpadding="6"><tr><th>Tool</th><th>Status</th></tr><tr><td>Vue</td><td>OK</td></tr></table>'
const SAMPLE_CSS = 'h1 { color: #6366f1; } table { border-collapse: collapse; margin-top: 1rem; }'
const html = ref(SAMPLE_HTML)
const css = ref(SAMPLE_CSS)
const o = reactive<HtmlPdfOptions>({ page: 'a4', landscape: false, margin: 40, ratio: 2 })
const error = ref('')
const busy = ref(false)
async function open(f: File) {
  html.value = await f.text()
}
function loadSample() {
  html.value = SAMPLE_HTML
  css.value = SAMPLE_CSS
}
async function run() {
  busy.value = true
  error.value = ''
  try {
    const safe = DOMPurify.sanitize(composeDocument(html.value, css.value), SANITIZE_CONFIG) as string
    downloadBlob(pdfBlob(await renderHtmlToPdf(safe, o)), 'document.pdf')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept=".html,.htm,text/html" :label="$t('tools.html-to-pdf.openHtml')" @file="open" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <div class="flex flex-col gap-2"><Label>{{ $t('tools.html-to-pdf.html') }}</Label><Textarea v-model="html" rows="14" class="font-mono" /></div>
      <div class="flex flex-col gap-2"><Label>{{ $t('tools.html-to-pdf.css') }}</Label><Textarea v-model="css" rows="14" class="font-mono" /></div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <ModeToggle v-model="o.page" :options="[['a4', 'A4'], ['letter', 'Letter'], ['a3', 'A3'], ['a5', 'A5']]" />
      <Label><Switch v-model="o.landscape" /> {{ $t('tools.html-to-pdf.landscape') }}</Label>
    </div>
    <RangeField v-model="o.margin" class="max-w-md" :label="$t('tools.html-to-pdf.margin')" :max="96" unit="pt" />
    <p class="text-muted-foreground text-xs">{{ $t('tools.html-to-pdf.note') }}</p>
    <ErrorAlert v-if="error" :message="error" />
    <div><Button :disabled="!html.trim() || busy" @click="run"><Download /> {{ busy ? $t('common.processing') : $t('tools.html-to-pdf.run') }}</Button></div>
  </div>
</template>
