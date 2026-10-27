<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { flattenForms, flattenRaster } from './logic'

const { file, bytes, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const mode = ref<'forms' | 'raster'>('forms')
const dpi = ref(150)
const fields = ref<number | null>(null)
const working = ref(false)
const progress = ref({ done: 0, total: 0 })
async function run() {
  if (!bytes.value) return
  working.value = true
  try {
    let out: Uint8Array
    if (mode.value === 'forms') {
      const r = await flattenForms(bytes.value)
      fields.value = r.fields
      out = r.bytes
    } else out = await flattenRaster(bytes.value, dpi.value, (done, total) => (progress.value = { done, total }))
    downloadBlob(pdfBlob(out), `${baseName()}-flattened.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    working.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="bytes">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.pdf-flatten.mode') }}</span>
        <ModeToggle v-model="mode" :options="[['forms', $t('tools.pdf-flatten.forms')], ['raster', $t('tools.pdf-flatten.raster')]]" />
      </div>
      <RangeField v-if="mode === 'raster'" v-model="dpi" class="max-w-md" :label="$t('tools.pdf-flatten.dpi')" :min="72" :max="300" />
      <div class="flex items-center gap-3">
        <Button :disabled="working" @click="run"><Download /> {{ $t('tools.pdf-flatten.run') }}</Button>
        <span v-if="working && progress.total" class="text-sm">{{ $t('tools.pdf-flatten.progress', progress) }}</span>
        <span v-if="fields !== null && mode === 'forms'" class="text-sm">{{ $t('tools.pdf-flatten.fields', { n: fields }) }}</span>
      </div>
    </template>
  </div>
</template>
