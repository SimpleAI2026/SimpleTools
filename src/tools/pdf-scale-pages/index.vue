<script setup lang="ts">
import { reactive } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { MM } from '@/tools/pdf-crop/logic'
import { scalePages, type ScaleOptions } from './logic'

const { file, bytes, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const o = reactive({ target: 'a4' as ScaleOptions['target'], wmm: 210, hmm: 297, orientation: 'auto' as ScaleOptions['orientation'], mmargin: 0 })
async function run() {
  if (!bytes.value) return
  try {
    const opts: ScaleOptions = { target: o.target, width: o.wmm * MM, height: o.hmm * MM, orientation: o.orientation, margin: o.mmargin * MM }
    downloadBlob(pdfBlob(await scalePages(bytes.value, opts)), `${baseName()}-${o.target}.pdf`)
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
        <span class="text-sm">{{ $t('tools.pdf-scale-pages.target') }}</span>
        <ModeToggle v-model="o.target" :options="[['a4', 'A4'], ['letter', 'Letter'], ['a3', 'A3'], ['a5', 'A5'], ['custom', $t('tools.pdf-scale-pages.custom')]]" />
        <template v-if="o.target === 'custom'">
          <Label>{{ $t('tools.pdf-scale-pages.width') }} <Input v-model.number="o.wmm" type="number" class="w-20" /></Label>
          <Label>{{ $t('tools.pdf-scale-pages.height') }} <Input v-model.number="o.hmm" type="number" class="w-20" /></Label>
        </template>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.pdf-scale-pages.orientation') }}</span>
        <ModeToggle v-model="o.orientation" :options="[['auto', $t('tools.pdf-scale-pages.auto')], ['portrait', $t('tools.pdf-scale-pages.portrait')], ['landscape', $t('tools.pdf-scale-pages.landscape')]]" />
        <Label>{{ $t('tools.pdf-scale-pages.margin') }} <Input v-model.number="o.mmargin" type="number" min="0" class="w-20" /></Label>
      </div>
      <div><Button @click="run"><Download /> {{ $t('tools.pdf-scale-pages.run') }}</Button></div>
    </template>
  </div>
</template>
