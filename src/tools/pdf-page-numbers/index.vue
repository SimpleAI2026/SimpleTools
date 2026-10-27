<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { addPageNumbers, type PageNumberOptions, type Position } from './logic'

const { t } = useI18n()
const { file, bytes, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const o = reactive<PageNumberOptions>({ format: '{n} / {total}', position: 'bottom-center', fontSize: 10, margin: 28, start: 1, pages: '', color: '#333333', skipFirst: false })
const positions: Position[] = ['bottom-center', 'bottom-right', 'bottom-left', 'top-center', 'top-right', 'top-left']
async function run() {
  if (!bytes.value) return
  try {
    downloadBlob(pdfBlob(await addPageNumbers(bytes.value, { ...o, fontSize: Number(o.fontSize) || 10, margin: Number(o.margin) || 0, start: Number(o.start) || 1 })), `${baseName()}-numbered.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="bytes">
      <div class="grid max-w-3xl gap-3 sm:grid-cols-2">
        <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-page-numbers.format') }} <Input v-model="o.format" class="font-mono" /></Label>
        <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-page-numbers.position') }}
          <select v-model="o.position" class="border-input bg-background h-9 w-full rounded-md border px-2">
            <option v-for="p in positions" :key="p" :value="p">{{ t(`tools.pdf-page-numbers.positions.${p}`) }}</option>
          </select>
        </Label>
        <Label class="flex flex-col items-start gap-1.5">{{ $t('common.pageRange') }} <Input v-model="o.pages" /></Label>
        <div class="flex items-end gap-3">
          <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-page-numbers.fontSize') }} <Input v-model.number="o.fontSize" type="number" class="w-20" /></Label>
          <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-page-numbers.margin') }} <Input v-model.number="o.margin" type="number" class="w-20" /></Label>
          <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-page-numbers.start') }} <Input v-model.number="o.start" type="number" class="w-20" /></Label>
          <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-page-numbers.color') }} <input v-model="o.color" type="color" class="h-9 w-12 rounded border" /></Label>
        </div>
      </div>
      <Label><Switch v-model="o.skipFirst" /> {{ $t('tools.pdf-page-numbers.skipFirst') }}</Label>
      <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-page-numbers.note') }}</p>
      <div><Button @click="run"><Download /> {{ $t('tools.pdf-page-numbers.run') }}</Button></div>
    </template>
  </div>
</template>
