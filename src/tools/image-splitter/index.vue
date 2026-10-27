<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Package } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { canvasToBlob, fillIfOpaque, loadBitmap, makeCanvas, RASTER_EXT, type RasterFormat } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { zipBlobs } from '@/lib/zip'
import { gridTiles, sizeTiles, tileName } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

const { t } = useI18n()
const bmp = shallowRef<ImageBitmap | null>(null)
const url = ref('')
const base = ref('image')
const mode = ref<'grid' | 'size'>('grid')
const rows = ref(3)
const cols = ref(3)
const tw = ref(256)
const th = ref(256)
const format = ref<RasterFormat>('image/png')
const busy = ref(false)
const error = ref('')
const tiles = computed(() => {
  if (!bmp.value) return []
  const { width: w, height: h } = bmp.value
  return mode.value === 'grid' ? gridTiles(w, h, Number(rows.value) || 1, Number(cols.value) || 1) : sizeTiles(w, h, Number(tw.value) || 1, Number(th.value) || 1)
})
async function loadSample() {
  busy.value = true
  try {
    await onFile(await loadSampleImage())
  } finally {
    busy.value = false
  }
}

async function onFile(f: File) {
  try {
    const b = await loadBitmap(f)
    bmp.value?.close()
    bmp.value = b
    if (url.value) URL.revokeObjectURL(url.value)
    url.value = URL.createObjectURL(f)
    base.value = f.name.replace(/\.[^.]+$/, '') || 'image'
    error.value = ''
  } catch {
    error.value = t('tools.image-splitter.failed')
  }
}
onBeforeUnmount(() => {
  bmp.value?.close()
  if (url.value) URL.revokeObjectURL(url.value)
})
async function run() {
  if (!bmp.value) return
  busy.value = true
  try {
    const entries = []
    for (const tile of tiles.value) {
      const [c, ctx] = makeCanvas(tile.w, tile.h)
      fillIfOpaque(ctx, format.value)
      ctx.drawImage(bmp.value, tile.x, tile.y, tile.w, tile.h, 0, 0, tile.w, tile.h)
      entries.push({ name: tileName(base.value, tile, RASTER_EXT[format.value]), blob: await canvasToBlob(c, format.value, 0.92) })
    }
    downloadBlob(await zipBlobs(entries), `${base.value}_tiles.zip`)
  } catch {
    error.value = t('tools.image-splitter.failed')
  } finally {
    busy.value = false
  }
}
const pct = (v: number, total: number) => `${(v / total) * 100}%`
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="image/*" :label="$t('tools.image-splitter.drop')" @file="onFile" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="bmp">
      <div class="flex flex-wrap items-center gap-3">
        <ModeToggle v-model="mode" :options="[['grid', $t('tools.image-splitter.byGrid')], ['size', $t('tools.image-splitter.bySize')]]" />
        <template v-if="mode === 'grid'">
          <Label>{{ $t('tools.image-splitter.rows') }} <Input v-model.number="rows" type="number" min="1" max="50" class="w-20" /></Label>
          <Label>{{ $t('tools.image-splitter.cols') }} <Input v-model.number="cols" type="number" min="1" max="50" class="w-20" /></Label>
        </template>
        <template v-else>
          <Label>{{ $t('tools.image-splitter.tileW') }} <Input v-model.number="tw" type="number" min="1" class="w-24" /></Label>
          <Label>{{ $t('tools.image-splitter.tileH') }} <Input v-model.number="th" type="number" min="1" class="w-24" /></Label>
        </template>
        <ModeToggle v-model="format" :options="[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']]" />
        <span class="text-muted-foreground text-sm">{{ $t('tools.image-splitter.tiles', { n: tiles.length }) }}</span>
        <Button :disabled="busy || tiles.length > 2500" @click="run"><Package /> {{ busy ? $t('common.processing') : $t('common.download_all') }}</Button>
      </div>
      <div class="relative mx-auto inline-block max-w-full">
        <img :src="url" :alt="$t('common.preview')" class="block max-h-[32rem] max-w-full" />
        <template v-if="tiles.length <= 400">
          <div
            v-for="(tile, i) in tiles"
            :key="i"
            class="absolute border border-dashed border-white/90 outline outline-1 outline-black/40"
            :style="{ left: pct(tile.x, bmp.width), top: pct(tile.y, bmp.height), width: pct(tile.w, bmp.width), height: pct(tile.h, bmp.height) }"
          />
        </template>
      </div>
    </template>
  </div>
</template>
