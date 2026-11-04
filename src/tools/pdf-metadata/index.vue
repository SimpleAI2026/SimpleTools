<script setup lang="ts">
import { reactive, watch } from 'vue'
import { Download, Eraser } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadPdf } from '@/lib/download'
import { usePdfFile } from '@/lib/usePdfFile'
import { readMeta, writeMeta, type PdfMeta } from './logic'
import { catchError } from '@/lib/runBusy'

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
  const data = bytes.value
  if (!data) return
  await catchError(error, async () => {
    downloadPdf(await writeMeta(data, meta, strip), `${baseName()}${strip ? '-clean' : ''}.pdf`)
  })
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
