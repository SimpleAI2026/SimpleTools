<script setup lang="ts">
import { reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { markdownToBlocks } from './logic'

const { t } = useI18n()
const SAMPLE = () => t('tools.pdf-creator.placeholder')
const md = ref(SAMPLE())
const font = shallowRef<File | null>(null)
const o = reactive({ title: 'Document', family: 'Helvetica' as StdFamily, size: 11, margin: 56, page: 'a4' as PageSizeName })
const error = ref('')
const busy = ref(false)
function loadSample() {
  md.value = SAMPLE()
  o.title = 'SimpleTools Sample'
}
async function run() {
  busy.value = true
  error.value = ''
  try {
    const customFont = font.value ? new Uint8Array(await font.value.arrayBuffer()) : undefined
    const out = await layoutPdf(markdownToBlocks(md.value, o.size), { pageSize: pageSize(o.page, false), margin: o.margin, lineHeight: 1.45, family: o.family, customFont, title: o.title }, canvasTextRasterizer)
    downloadBlob(pdfBlob(out), `${o.title || 'document'}.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <Input v-model="o.title" class="max-w-md" :placeholder="$t('tools.pdf-creator.title')" />
    <Textarea v-model="md" rows="16" class="font-mono" />
    <div class="flex flex-wrap items-center gap-3">
      <ModeToggle v-model="o.family" :options="[['Helvetica', 'Helvetica'], ['TimesRoman', 'Times'], ['Courier', 'Courier']]" />
      <ModeToggle v-model="o.page" :options="[['a4', 'A4'], ['letter', 'Letter'], ['a5', 'A5']]" />
    </div>
    <div class="grid max-w-2xl gap-2 md:grid-cols-2">
      <RangeField v-model="o.size" :label="$t('tools.pdf-creator.fontSize')" :min="8" :max="20" unit="pt" />
      <RangeField v-model="o.margin" :label="$t('tools.pdf-creator.margin')" :max="120" unit="pt" />
    </div>
    <FileDropzone accept=".ttf,.otf" :label="font?.name ?? $t('tools.pdf-creator.customFont')" @file="(f) => (font = f)" />
    <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-creator.fontNote') }}</p>
    <ErrorAlert v-if="error" :message="error" />
    <div><Button :disabled="!md.trim() || busy" @click="run"><Download /> {{ busy ? $t('common.processing') : $t('tools.pdf-creator.run') }}</Button></div>
  </div>
</template>
