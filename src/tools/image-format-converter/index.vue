<script setup lang="ts">
import { ref } from 'vue'
import { Download, Package, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { canvasToBlob, fillIfOpaque, loadBitmap, makeCanvas, RASTER_EXT, withExt, type RasterFormat } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { zipBlobs } from '@/lib/zip'
import { INPUT_ACCEPT, isLossy, rasterSize, sizeChange } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

interface Item {
  file: File
  out?: Blob
  name?: string
  error?: boolean
}
const items = ref<Item[]>([])
const target = ref<RasterFormat>('image/webp')
const quality = ref(85)
const bg = ref('#ffffff')
const busy = ref(false)

async function loadSample() {
  busy.value = true
  try {
    onFiles([await loadSampleImage()])
  } finally {
    busy.value = false
  }
}

function onFiles(fs: File[]) {
  items.value.push(...fs.filter((f) => f.type.startsWith('image/')).map((file) => ({ file })))
}

async function convertOne(it: Item) {
  try {
    const bmp = await loadBitmap(it.file)
    const { width, height } = rasterSize(bmp.width, bmp.height)
    const [c, ctx] = makeCanvas(width, height)
    fillIfOpaque(ctx, target.value, bg.value)
    ctx.drawImage(bmp, 0, 0, width, height)
    bmp.close()
    it.out = await canvasToBlob(c, target.value, quality.value / 100)
    it.name = withExt(it.file.name, RASTER_EXT[target.value])
    it.error = false
  } catch {
    it.error = true
  }
}
async function convertAll() {
  busy.value = true
  for (const it of items.value) await convertOne(it)
  busy.value = false
}
async function downloadZip() {
  const done = items.value.filter((i) => i.out)
  downloadBlob(await zipBlobs(done.map((i) => ({ name: i.name!, blob: i.out! }))), 'images.zip')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="INPUT_ACCEPT" multiple :label="$t('tools.image-format-converter.drop')" @files="onFiles" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.image-format-converter.target') }}</span>
      <ModeToggle v-model="target" :options="[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']]" />
      <label v-if="target === 'image/jpeg'" class="flex items-center gap-2 text-sm">
        {{ $t('tools.image-format-converter.background') }} <input v-model="bg" type="color" class="h-8 w-10 rounded border" />
      </label>
    </div>
    <RangeField v-if="isLossy(target)" v-model="quality" class="max-w-lg" :label="$t('tools.image-format-converter.quality')" :min="1" :max="100" />
    <div v-if="items.length" class="flex flex-col divide-y rounded-md border">
      <div v-for="(it, i) in items" :key="i" class="flex items-center gap-3 p-2 text-sm">
        <span class="flex-1 truncate">{{ it.file.name }}</span>
        <span class="text-muted-foreground">{{ formatBytes(it.file.size) }}</span>
        <template v-if="it.out">
          <span>→ {{ formatBytes(it.out.size) }}</span>
          <span :class="it.out.size <= it.file.size ? 'text-green-600' : 'text-amber-600'">{{ $t('tools.image-format-converter.change', { pct: sizeChange(it.file.size, it.out.size) }) }}</span>
          <Button size="icon" variant="ghost" :aria-label="$t('common.download')" @click="downloadBlob(it.out, it.name!)"><Download /></Button>
        </template>
        <span v-else-if="it.error" class="text-destructive">{{ $t('tools.image-format-converter.failed') }}</span>
        <Button size="icon" variant="ghost" :aria-label="$t('common.remove')" @click="items.splice(i, 1)"><Trash2 /></Button>
      </div>
    </div>
    <div v-if="items.length" class="flex gap-2">
      <Button :disabled="busy" @click="convertAll">{{ busy ? $t('common.processing') : $t('tools.image-format-converter.convert') }}</Button>
      <Button v-if="items.some((i) => i.out)" variant="outline" @click="downloadZip"><Package /> {{ $t('common.download_all') }}</Button>
    </div>
  </div>
</template>
