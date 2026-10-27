<script setup lang="ts">
import { reactive, ref, shallowRef } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { canvasTextRasterizer } from '@/lib/pdfDraw'
import { layoutPdf, type StdFamily } from '@/lib/pdfText'
import { pageSize, type PageSizeName } from '@/lib/rasterPdf'
import { textToBlocks } from './logic'

const SAMPLE = 'SimpleTools Sample\n\nOffline-first local toolkit.\n本地优先 · 无需上传。\n\nhttps://github.com/linkxzhou/SimpleTools\n'
const text = ref(SAMPLE)
const font = shallowRef<File | null>(null)
const o = reactive({ family: 'Helvetica' as StdFamily, size: 11, margin: 54, lineHeight: 1.4, page: 'a4' as PageSizeName })
const error = ref('')
const busy = ref(false)
function loadSample() {
  text.value = SAMPLE
}
async function openTxt(f: File) {
  text.value = await f.text()
}
async function run() {
  busy.value = true
  error.value = ''
  try {
    const customFont = font.value ? new Uint8Array(await font.value.arrayBuffer()) : undefined
    const out = await layoutPdf(textToBlocks(text.value, o.size), { pageSize: pageSize(o.page, false), margin: o.margin, lineHeight: o.lineHeight, family: o.family, customFont }, canvasTextRasterizer)
    downloadBlob(pdfBlob(out), 'text.pdf')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept=".txt,text/plain" :label="$t('tools.text-to-pdf.openTxt')" @file="openTxt" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <Textarea v-model="text" rows="14" class="font-mono" :placeholder="$t('tools.text-to-pdf.placeholder')" />
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.text-to-pdf.family') }}</span>
      <ModeToggle v-model="o.family" :options="[['Helvetica', 'Helvetica'], ['TimesRoman', 'Times'], ['Courier', 'Courier']]" />
      <span class="text-sm">{{ $t('tools.text-to-pdf.page') }}</span>
      <ModeToggle v-model="o.page" :options="[['a4', 'A4'], ['letter', 'Letter'], ['a5', 'A5']]" />
    </div>
    <div class="grid max-w-3xl gap-2 md:grid-cols-3">
      <RangeField v-model="o.size" :label="$t('tools.text-to-pdf.fontSize')" :min="6" :max="36" unit="pt" />
      <RangeField v-model="o.margin" :label="$t('tools.text-to-pdf.margin')" :max="120" unit="pt" />
      <RangeField v-model="o.lineHeight" :label="$t('tools.text-to-pdf.lineHeight')" :min="1" :max="2.5" :step="0.05" />
    </div>
    <FileDropzone accept=".ttf,.otf" :label="font?.name ?? $t('tools.text-to-pdf.customFont')" @file="(f) => (font = f)" />
    <p class="text-muted-foreground text-xs">{{ $t('tools.text-to-pdf.fontNote') }}</p>
    <ErrorAlert v-if="error" :message="error" />
    <div><Button :disabled="!text.trim() || busy" @click="run"><Download /> {{ busy ? $t('common.processing') : $t('tools.text-to-pdf.run') }}</Button></div>
  </div>
</template>
