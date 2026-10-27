<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { removeAnnotations } from './logic'

const { file, bytes, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const o = reactive({ keepLinks: true, removeForms: false })
const removed = ref<number | null>(null)
async function run() {
  if (!bytes.value) return
  try {
    const r = await removeAnnotations(bytes.value, o)
    removed.value = r.removed
    downloadBlob(pdfBlob(r.bytes), `${baseName()}-clean.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <div v-if="bytes" class="flex flex-wrap items-center gap-4">
      <Label><Switch v-model="o.keepLinks" /> {{ $t('tools.pdf-remove-annotations.keepLinks') }}</Label>
      <Label><Switch v-model="o.removeForms" /> {{ $t('tools.pdf-remove-annotations.removeForms') }}</Label>
      <Button @click="run"><Download /> {{ $t('tools.pdf-remove-annotations.run') }}</Button>
      <span v-if="removed !== null" class="text-sm">{{ $t('tools.pdf-remove-annotations.removed', { n: removed }) }}</span>
    </div>
  </div>
</template>
