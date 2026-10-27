<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadBlob } from '@/lib/download'
import { parsePageRanges } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { pdfToDocx } from './logic'

const { file, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const range = ref('')
const md = ref('')
async function run() {
  if (!doc.value) return
  busy.value = true
  try {
    const r = await pdfToDocx(doc.value, parsePageRanges(range.value, numPages.value), { font: 'Calibri', fontSize: 11, title: baseName() })
    md.value = r.markdown
    downloadBlob(r.blob, `${baseName()}.docx`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <div v-if="doc" class="flex flex-wrap items-center gap-3">
      <Label>{{ $t('common.pageRange') }} <Input v-model="range" class="w-40" :placeholder="$t('common.allPages')" /></Label>
      <Button :disabled="busy" @click="run"><Download /> {{ $t('tools.pdf-to-word.run') }}</Button>
    </div>
    <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-to-word.note') }}</p>
    <template v-if="md">
      <Label>{{ $t('tools.pdf-to-word.preview') }}</Label>
      <Textarea :model-value="md" readonly rows="12" class="font-mono" />
    </template>
  </div>
</template>
