<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob, renderPage } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { cropPdf, MM, type Margins } from './logic'

const { file, bytes, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const m = reactive<Margins>({ top: 10, right: 10, bottom: 10, left: 10 })
const pages = ref('')
const media = ref(false)
const preview = ref('')
const size = ref({ w: 1, h: 1 })
watch(doc, async (d) => {
  if (!d) return
  const c = await renderPage(d, 1, 0.8)
  const vp = (await d.getPage(1)).getViewport({ scale: 1 })
  size.value = { w: vp.width, h: vp.height }
  preview.value = c.toDataURL('image/jpeg', 0.8)
})
const pct = (mm: number, total: number) => `${((mm * MM) / total) * 100}%`
async function run() {
  if (!bytes.value) return
  try {
    const pt = { top: m.top * MM, right: m.right * MM, bottom: m.bottom * MM, left: m.left * MM }
    downloadBlob(pdfBlob(await cropPdf(bytes.value, pt, pages.value, media.value)), `${baseName()}-cropped.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  }
}
const sides = ['top', 'right', 'bottom', 'left'] as const
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <div v-if="doc" class="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div class="relative mx-auto w-fit">
        <img :src="preview" :alt="$t('common.preview')" class="block max-h-[34rem] border shadow" />
        <div
          class="border-primary absolute border-2 border-dashed bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]"
          :style="{ top: pct(m.top, size.h), bottom: pct(m.bottom, size.h), left: pct(m.left, size.w), right: pct(m.right, size.w) }"
        />
      </div>
      <div class="flex flex-col gap-3">
        <span class="text-muted-foreground text-xs">{{ $t('tools.pdf-crop.unit') }}</span>
        <Label v-for="s in sides" :key="s" class="flex items-center justify-between gap-2">{{ $t(`tools.pdf-crop.${s}`) }} <Input v-model.number="m[s]" type="number" min="0" step="1" class="w-24" /></Label>
        <Label class="flex flex-col items-start gap-1.5">{{ $t('common.pageRange') }} <Input v-model="pages" /></Label>
        <Label><Switch v-model="media" /> {{ $t('tools.pdf-crop.mediaBox') }}</Label>
        <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-crop.note') }}</p>
        <Button @click="run"><Download /> {{ $t('tools.pdf-crop.run') }}</Button>
      </div>
    </div>
  </div>
</template>
