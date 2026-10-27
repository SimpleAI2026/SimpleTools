<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Download, Eraser } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { readMeta, writeMeta, type PdfMeta } from './logic'

const { file, bytes, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const meta = reactive<PdfMeta>({ title: '', author: '', subject: '', keywords: '', creator: '', producer: '', creationDate: '', modDate: '' })
watch(bytes, async (b) => {
  if (!b) return
  try {
    Object.assign(meta, await readMeta(b))
  } catch (e) {
    error.value = (e as Error).message
  }
})
const keys = Object.keys(meta) as (keyof PdfMeta)[]
async function save(strip: boolean) {
  if (!bytes.value) return
  try {
    downloadBlob(pdfBlob(await writeMeta(bytes.value, meta, strip)), `${baseName()}${strip ? '-clean' : ''}.pdf`)
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
        <Label v-for="k in keys" :key="k" class="flex flex-col items-start gap-1.5">
          {{ $t(`tools.pdf-metadata.fields.${k}`) }}
          <Input v-model="meta[k]" :type="k.endsWith('Date') ? 'datetime-local' : 'text'" />
        </Label>
      </div>
      <div class="flex gap-2">
        <Button @click="save(false)"><Download /> {{ $t('tools.pdf-metadata.save') }}</Button>
        <Button variant="outline" @click="save(true)"><Eraser /> {{ $t('tools.pdf-metadata.strip') }}</Button>
      </div>
    </template>
  </div>
</template>
