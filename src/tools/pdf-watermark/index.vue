<script setup lang="ts">
import { reactive, shallowRef } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { canvasTextRasterizer } from '@/lib/pdfDraw'
import { usePdfFile } from '@/lib/usePdfFile'
import { watermarkPdf, type WatermarkOptions } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

const { file, bytes, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const o = reactive<WatermarkOptions>({ kind: 'text', text: 'CONFIDENTIAL', fontSize: 48, color: '#ef4444', opacity: 0.25, rotation: 45, layout: 'center', gap: 80, imageScale: 0.4, layer: 'foreground', pages: '' })
const img = shallowRef<File | null>(null)
async function loadSampleImg() {
  img.value = await loadSampleImage()
  o.kind = 'image'
}
async function run() {
  if (!bytes.value) return
  try {
    if (o.kind === 'image' && img.value) o.image = { bytes: new Uint8Array(await img.value.arrayBuffer()), type: img.value.type === 'image/png' ? 'png' : 'jpg' }
    downloadBlob(pdfBlob(await watermarkPdf(bytes.value, o, canvasTextRasterizer)), `${baseName()}-watermarked.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="bytes">
      <div class="flex flex-wrap items-center gap-3">
        <ModeToggle v-model="o.kind" :options="[['text', $t('tools.pdf-watermark.text')], ['image', $t('tools.pdf-watermark.image')]]" />
        <ModeToggle v-model="o.layout" :options="[['center', $t('tools.pdf-watermark.center')], ['tile', $t('tools.pdf-watermark.tile')]]" />
        <ModeToggle v-model="o.layer" :options="[['foreground', $t('tools.pdf-watermark.foreground')], ['background', $t('tools.pdf-watermark.background')]]" />
        <Label>{{ $t('common.pageRange') }} <Input v-model="o.pages" class="w-36" /></Label>
      </div>
      <div v-if="o.kind === 'text'" class="flex flex-wrap items-center gap-3">
        <Input v-model="o.text" class="w-72" :placeholder="$t('tools.pdf-watermark.content')" />
        <input v-model="o.color" type="color" class="h-9 w-12 rounded border" :aria-label="$t('tools.pdf-watermark.color')" />
        <span class="text-muted-foreground text-xs">{{ $t('tools.pdf-watermark.cjkNote') }}</span>
      </div>
      <div v-else class="flex flex-col gap-2">
        <FileDropzone accept="image/png,image/jpeg" :label="img?.name ?? $t('tools.pdf-watermark.chooseImage')" @file="(f) => (img = f)" />
        <div class="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" @click="loadSampleImg">{{ $t('common.sample') }}</Button>
        </div>
      </div>
      <div class="grid max-w-3xl gap-2 md:grid-cols-2">
        <RangeField v-if="o.kind === 'text'" v-model="o.fontSize" :label="$t('tools.pdf-watermark.fontSize')" :min="8" :max="160" unit="pt" />
        <RangeField v-else v-model="o.imageScale" :label="$t('tools.pdf-watermark.imageScale')" :min="0.05" :max="1" :step="0.05" />
        <RangeField v-model="o.opacity" :label="$t('tools.pdf-watermark.opacity')" :max="1" :step="0.05" />
        <RangeField v-model="o.rotation" :label="$t('tools.pdf-watermark.rotation')" :min="-180" :max="180" unit="°" />
        <RangeField v-if="o.layout === 'tile'" v-model="o.gap" :label="$t('tools.pdf-watermark.gap')" :max="300" unit="pt" />
      </div>
      <div><Button :disabled="o.kind === 'image' && !img" @click="run"><Download /> {{ $t('tools.pdf-watermark.run') }}</Button></div>
    </template>
  </div>
</template>
