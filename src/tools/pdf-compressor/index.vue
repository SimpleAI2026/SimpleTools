<script setup lang="ts">
import { reactive, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { withExt } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { loadSamplePdf } from '@/lib/samplePdf'
import { compressPdf, PRESETS, type PdfCompressOptions } from './logic'

const { t } = useI18n()
const file = shallowRef<File | null>(null)
const o = reactive<PdfCompressOptions & { quality100: number }>({ mode: 'lossless', dpi: 110, quality: 0.65, quality100: 65, grayscale: false, stripMetadata: true })
const preset = ref<keyof typeof PRESETS>('balanced')
const busy = ref(false)
const progress = ref({ done: 0, total: 0 })
const result = ref<{ from: string; to: string; pct: number } | null>(null)
const error = ref('')
async function loadSample() {
  file.value = await loadSamplePdf()
  result.value = null
}
function applyPreset(p: keyof typeof PRESETS) {
  preset.value = p
  o.dpi = PRESETS[p].dpi
  o.quality100 = Math.round(PRESETS[p].quality * 100)
}
async function run() {
  if (!file.value) return
  busy.value = true
  error.value = ''
  result.value = null
  try {
    const out = await compressPdf(file.value, { ...o, quality: o.quality100 / 100 }, (done, total) => (progress.value = { done, total }))
    result.value = { from: formatBytes(file.value.size), to: formatBytes(out.size), pct: Math.round((out.size / file.value.size - 1) * 100) }
    downloadBlob(out, withExt(file.value.name, 'pdf', '-compressed'))
  } catch {
    error.value = t('tools.pdf-compressor.failed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="application/pdf,.pdf" :label="$t('tools.pdf-compressor.drop')" @file="(f) => ((file = f), (result = null))" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <span v-if="file" class="text-sm">{{ file.name }} · {{ formatBytes(file.size) }}</span>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.pdf-compressor.mode') }}</span>
      <ModeToggle v-model="o.mode" :options="[['lossless', $t('tools.pdf-compressor.lossless')], ['raster', $t('tools.pdf-compressor.raster')]]" />
      <Label v-if="o.mode === 'lossless'"><Switch v-model="o.stripMetadata" /> {{ $t('tools.pdf-compressor.stripMetadata') }}</Label>
    </div>
    <div v-if="o.mode === 'raster'" class="flex max-w-xl flex-col gap-3">
      <ModeToggle
        :model-value="preset"
        :options="[['light', $t('tools.pdf-compressor.light')], ['balanced', $t('tools.pdf-compressor.balanced')], ['strong', $t('tools.pdf-compressor.strong')]]"
        @update:model-value="applyPreset"
      />
      <RangeField v-model="o.dpi" :label="$t('tools.pdf-compressor.dpi')" :min="50" :max="300" />
      <RangeField v-model="o.quality100" :label="$t('tools.pdf-compressor.quality')" :min="10" :max="95" />
      <Label><Switch v-model="o.grayscale" /> {{ $t('tools.pdf-compressor.grayscale') }}</Label>
      <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-compressor.rasterNote') }}</p>
    </div>
    <div class="flex items-center gap-3">
      <Button :disabled="!file || busy" @click="run"><Download /> {{ $t('tools.pdf-compressor.compress') }}</Button>
      <span v-if="busy && progress.total" class="text-sm">{{ $t('tools.pdf-compressor.progress', progress) }}</span>
      <span v-if="result" class="text-sm">{{ $t('tools.pdf-compressor.result', result) }}</span>
    </div>
    <ErrorAlert v-if="error" :message="error" />
  </div>
</template>
