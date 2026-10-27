<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import PdfInput from '@/components/shared/PdfInput.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { pageText, parsePageRanges, renderPage } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { buildPdfPptx, type SlidePage } from './logic'

const { file, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const range = ref('')
const dpi = ref(144)
const notes = ref(true)
const progress = ref('')
async function run() {
  if (!doc.value) return
  busy.value = true
  try {
    const pages = parsePageRanges(range.value, numPages.value)
    const slides: SlidePage[] = []
    for (const [i, n] of pages.entries()) {
      progress.value = `${i + 1}/${pages.length}`
      const vp = (await doc.value.getPage(n)).getViewport({ scale: 1 })
      const c = await renderPage(doc.value, n, dpi.value / 72)
      slides.push({ image: c.toDataURL('image/jpeg', 0.9), widthPt: vp.width, heightPt: vp.height, notes: notes.value ? await pageText(doc.value, n) : undefined })
      c.width = c.height = 0
    }
    const out = await buildPdfPptx(slides, baseName())
    downloadBlob(new Blob([out as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }), `${baseName()}.pptx`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
    progress.value = ''
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="doc">
      <div class="flex flex-wrap items-center gap-3">
        <Label>{{ $t('common.pageRange') }} <Input v-model="range" class="w-40" :placeholder="$t('common.allPages')" /></Label>
        <Label><Switch v-model="notes" /> {{ $t('tools.pdf-to-ppt.notes') }}</Label>
      </div>
      <RangeField v-model="dpi" class="max-w-md" :label="$t('tools.pdf-to-ppt.dpi')" :min="72" :max="300" :step="12" unit="dpi" />
      <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-to-ppt.note') }}</p>
      <div class="flex items-center gap-3">
        <Button :disabled="busy" @click="run"><Download /> {{ $t('tools.pdf-to-ppt.run') }}</Button>
        <span v-if="progress" class="text-sm">{{ progress }}</span>
      </div>
    </template>
  </div>
</template>
