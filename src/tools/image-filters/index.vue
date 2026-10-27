<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download, RotateCcw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { canvasToBlob, fillIfOpaque, loadBitmap, makeCanvas, RASTER_EXT, withExt, type RasterFormat } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { applyFilters, cssFilter, FILTER_PRESETS, IDENTITY_FILTERS, type FilterSettings } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

const { t } = useI18n()
const file = ref<File | null>(null)
const url = ref('')
const f = reactive<FilterSettings>({ ...IDENTITY_FILTERS })
const format = ref<RasterFormat>('image/png')
const error = ref('')
const busy = ref(false)
const sliders: [keyof FilterSettings, number, number, number, string][] = [
  ['brightness', 0, 2, 0.01, ''],
  ['contrast', 0, 2, 0.01, ''],
  ['saturate', 0, 3, 0.01, ''],
  ['grayscale', 0, 1, 0.01, ''],
  ['sepia', 0, 1, 0.01, ''],
  ['hueRotate', -180, 180, 1, '°'],
  ['invert', 0, 1, 0.01, ''],
  ['blur', 0, 20, 1, 'px'],
]
const preview = computed(() => cssFilter(f))
const applyPreset = (k: string) => Object.assign(f, IDENTITY_FILTERS, FILTER_PRESETS[k])
async function loadSample() {
  busy.value = true
  try {
    onFile(await loadSampleImage())
  } finally {
    busy.value = false
  }
}

function onFile(nf: File) {
  if (!nf.type.startsWith('image/')) return
  if (url.value) URL.revokeObjectURL(url.value)
  file.value = nf
  url.value = URL.createObjectURL(nf)
  error.value = ''
}
onBeforeUnmount(() => url.value && URL.revokeObjectURL(url.value))

async function exportImage() {
  if (!file.value) return
  busy.value = true
  error.value = ''
  try {
    const bmp = await loadBitmap(file.value)
    const [c, ctx] = makeCanvas(bmp.width, bmp.height)
    fillIfOpaque(ctx, format.value)
    ctx.drawImage(bmp, 0, 0)
    bmp.close()
    // pixel-level processing works in every browser (ctx.filter is not universally supported)
    const img = ctx.getImageData(0, 0, c.width, c.height)
    applyFilters(img, f)
    ctx.putImageData(img, 0, 0)
    downloadBlob(await canvasToBlob(c, format.value, 0.92), withExt(file.value.name, RASTER_EXT[format.value], '-filtered'))
  } catch {
    error.value = t('tools.image-filters.failed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="image/*" :label="$t('tools.image-filters.drop')" @file="onFile" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <div v-if="url" class="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-1">
          <Button v-for="(_, k) in FILTER_PRESETS" :key="k" size="sm" variant="outline" @click="applyPreset(k)">{{ $t(`tools.image-filters.preset.${k}`) }}</Button>
        </div>
        <div class="bg-muted/30 flex justify-center overflow-hidden rounded-md border p-2">
          <img :src="url" :alt="$t('common.preview')" class="max-h-[32rem] max-w-full object-contain" :style="{ filter: preview }" />
        </div>
      </div>
      <div class="flex flex-col gap-3">
        <RangeField v-for="[k, min, max, step, unit] in sliders" :key="k" v-model="f[k]" :label="$t(`tools.image-filters.${k}`)" :min="min" :max="max" :step="step" :unit="unit" />
        <ModeToggle v-model="format" :options="[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']]" />
        <div class="flex gap-2">
          <Button variant="outline" @click="applyPreset('none')"><RotateCcw /> {{ $t('common.reset') }}</Button>
          <Button :disabled="busy" @click="exportImage"><Download /> {{ busy ? $t('common.processing') : $t('tools.image-filters.export') }}</Button>
        </div>
      </div>
    </div>
  </div>
</template>
