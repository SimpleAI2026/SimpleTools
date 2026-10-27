<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import PdfPageGrid from '@/components/shared/PdfPageGrid.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { canvasToBlob, RASTER_EXT, type RasterFormat } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { parsePageRanges, renderPage } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { zipBlobs } from '@/lib/zip'
import { clampScale, dpiScale, imageFileName } from './logic'

const { file, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const range = ref('')
const format = ref<RasterFormat>('image/png')
const dpi = ref(150)
const quality = ref(0.9)
const progress = ref('')
async function run() {
  if (!doc.value) return
  busy.value = true
  try {
    const pages = parsePageRanges(range.value, numPages.value)
    const out: { name: string; blob: Blob }[] = []
    for (const [i, n] of pages.entries()) {
      progress.value = `${i + 1}/${pages.length}`
      const vp = (await doc.value.getPage(n)).getViewport({ scale: 1 })
      const c = await renderPage(doc.value, n, clampScale(vp.width, vp.height, dpiScale(dpi.value)))
      out.push({ name: imageFileName(baseName(), n, numPages.value, RASTER_EXT[format.value]), blob: await canvasToBlob(c, format.value, quality.value) })
      c.width = c.height = 0
    }
    if (out.length === 1) downloadBlob(out[0]!.blob, out[0]!.name)
    else downloadBlob(await zipBlobs(out), `${baseName()}-images.zip`)
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
        <span class="text-sm">{{ $t('tools.pdf-to-image.format') }}</span>
        <ModeToggle v-model="format" :options="[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']]" />
        <Label>{{ $t('common.pageRange') }} <Input v-model="range" class="w-40" :placeholder="$t('common.allPages')" /></Label>
      </div>
      <div class="grid max-w-2xl gap-2 md:grid-cols-2">
        <RangeField v-model="dpi" :label="$t('tools.pdf-to-image.dpi')" :min="36" :max="600" :step="6" unit="dpi" />
        <RangeField v-if="format !== 'image/png'" v-model="quality" :label="$t('tools.pdf-to-image.quality')" :min="0.3" :max="1" :step="0.05" />
      </div>
      <div class="flex items-center gap-3">
        <Button :disabled="busy" @click="run"><Download /> {{ $t('tools.pdf-to-image.run') }}</Button>
        <span v-if="progress" class="text-sm">{{ progress }}</span>
      </div>
      <PdfPageGrid :doc="doc" :max="24" />
    </template>
  </div>
</template>
