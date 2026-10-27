<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { watchDebounced } from '@vueuse/core'
import { Download, FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { canvasToBlob, fillIfOpaque, loadBitmap, makeCanvas, RASTER_EXT, withExt, type RasterFormat } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { applyColorFilters, IDENTITY_FILTERS } from '@/tools/image-filters/logic'
import { aspectCrop, clampCrop, drawEdited, outputSize, rotate, type EditState } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

const { t } = useI18n()
const name = ref('')
const bmp = shallowRef<ImageBitmap | null>(null)
const s = reactive<EditState>({ crop: { x: 0, y: 0, w: 1, h: 1 }, rotation: 0, flipH: false, flipV: false })
const adj = reactive({ brightness: 1, contrast: 1, saturate: 1 })
const ratio = ref('free')
const ratios: Record<string, number | null> = { free: null, '1:1': 1, '4:3': 4 / 3, '3:2': 3 / 2, '16:9': 16 / 9, '9:16': 9 / 16 }
const format = ref<RasterFormat>('image/png')
const canvas = ref<HTMLCanvasElement | null>(null)
const error = ref('')
const out = computed(() => outputSize(s))

async function loadSample() {
  await onFile(await loadSampleImage())
}

async function onFile(f: File) {
  try {
    const b = await loadBitmap(f)
    bmp.value?.close()
    bmp.value = b
    name.value = f.name
    Object.assign(s, { crop: { x: 0, y: 0, w: b.width, h: b.height }, rotation: 0, flipH: false, flipV: false })
    Object.assign(adj, { brightness: 1, contrast: 1, saturate: 1 })
    ratio.value = 'free'
    error.value = ''
  } catch {
    error.value = t('tools.image-editor.failed')
  }
}
onBeforeUnmount(() => bmp.value?.close())
watch(ratio, (r) => bmp.value && (s.crop = aspectCrop(bmp.value.width, bmp.value.height, ratios[r] ?? null)))
function setCrop(k: 'x' | 'y' | 'w' | 'h', v: string | number) {
  if (!bmp.value) return
  s.crop = clampCrop({ ...s.crop, [k]: Number(v) || 0 }, bmp.value.width, bmp.value.height)
}

/** Render the full-resolution result into `target` (scaled down for preview). */
function render(target: HTMLCanvasElement, maxDim = Infinity) {
  if (!bmp.value) return
  const { width, height } = out.value
  const k = Math.min(1, maxDim / Math.max(width, height))
  const [full, fctx] = makeCanvas(width, height)
  drawEdited(fctx, bmp.value, s)
  target.width = Math.max(1, Math.round(width * k))
  target.height = Math.max(1, Math.round(height * k))
  const ctx = target.getContext('2d')!
  fillIfOpaque(ctx, format.value)
  ctx.drawImage(full, 0, 0, target.width, target.height)
  if (adj.brightness !== 1 || adj.contrast !== 1 || adj.saturate !== 1) {
    const img = ctx.getImageData(0, 0, target.width, target.height)
    applyColorFilters(img.data, { ...IDENTITY_FILTERS, ...adj })
    ctx.putImageData(img, 0, 0)
  }
}
watchDebounced([bmp, s, adj, canvas], () => canvas.value && render(canvas.value, 800), { debounce: 60, deep: true })

async function exportImage() {
  try {
    const c = document.createElement('canvas')
    render(c)
    downloadBlob(await canvasToBlob(c, format.value, 0.92), withExt(name.value, RASTER_EXT[format.value], '-edited'))
  } catch {
    error.value = t('tools.image-editor.failed')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="image/*" :label="$t('tools.image-editor.drop')" @file="onFile" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <div v-if="bmp" class="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <div class="bg-muted/30 flex items-center justify-center rounded-md border p-2">
        <canvas ref="canvas" class="max-h-[32rem] max-w-full" />
      </div>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" @click="s.rotation = rotate(s.rotation, -1)"><RotateCcw /> {{ $t('tools.image-editor.rotateLeft') }}</Button>
          <Button size="sm" variant="outline" @click="s.rotation = rotate(s.rotation, 1)"><RotateCw /> {{ $t('tools.image-editor.rotateRight') }}</Button>
          <Button size="sm" :variant="s.flipH ? 'default' : 'outline'" @click="s.flipH = !s.flipH"><FlipHorizontal /> {{ $t('tools.image-editor.flipH') }}</Button>
          <Button size="sm" :variant="s.flipV ? 'default' : 'outline'" @click="s.flipV = !s.flipV"><FlipVertical /> {{ $t('tools.image-editor.flipV') }}</Button>
        </div>
        <h3 class="text-sm font-medium">{{ $t('tools.image-editor.crop') }}</h3>
        <ModeToggle v-model="ratio" :options="Object.keys(ratios).map((k) => [k, k === 'free' ? $t('tools.image-editor.free') : k] as const)" />
        <div class="grid grid-cols-4 gap-2">
          <label v-for="k in ['x', 'y', 'w', 'h'] as const" :key="k" class="flex flex-col gap-1 text-xs uppercase">
            {{ k }}
            <Input :model-value="s.crop[k]" type="number" class="h-8 font-mono" @change="setCrop(k, ($event.target as HTMLInputElement).value)" />
          </label>
        </div>
        <h3 class="text-sm font-medium">{{ $t('tools.image-editor.adjust') }}</h3>
        <RangeField v-model="adj.brightness" :label="$t('tools.image-editor.brightness')" :max="2" :step="0.01" />
        <RangeField v-model="adj.contrast" :label="$t('tools.image-editor.contrast')" :max="2" :step="0.01" />
        <RangeField v-model="adj.saturate" :label="$t('tools.image-editor.saturate')" :max="3" :step="0.01" />
        <ModeToggle v-model="format" :options="[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']]" />
        <span class="text-muted-foreground text-xs">{{ $t('tools.image-editor.output', { w: out.width, h: out.height }) }}</span>
        <Button @click="exportImage"><Download /> {{ $t('tools.image-editor.export') }}</Button>
      </div>
    </div>
  </div>
</template>
