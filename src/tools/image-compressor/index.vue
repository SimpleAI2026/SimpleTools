<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { Download, Package, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { RASTER_EXT, withExt, type RasterFormat } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { zipBlobs } from '@/lib/zip'
import { savings, type CompressFormat, type CompressResponse } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

interface Item {
  file: File
  out?: Blob
  name?: string
  status: 'pending' | 'done' | 'larger' | 'error'
}
const items = ref<Item[]>([])
const o = reactive({ quality: 75, maxWidth: 1920, maxHeight: 0, format: 'image/webp' as CompressFormat })
const busy = ref(false)
let worker: Worker | null = null
let seq = 0
const pending = new Map<number, (r: CompressResponse) => void>()
function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./compress.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<CompressResponse>) => {
      pending.get(e.data.id)?.(e.data)
      pending.delete(e.data.id)
    }
  }
  return worker
}
onBeforeUnmount(() => worker?.terminate())

async function loadSample() {
  busy.value = true
  try {
    onFiles([await loadSampleImage()])
  } finally {
    busy.value = false
  }
}

function onFiles(fs: File[]) {
  items.value.push(...fs.filter((f) => f.type.startsWith('image/')).map((file) => ({ file, status: 'pending' as const })))
}
async function run() {
  busy.value = true
  for (const it of items.value) {
    const id = ++seq
    const res = await new Promise<CompressResponse>((resolve) => {
      pending.set(id, resolve)
      getWorker().postMessage({ id, file: it.file, quality: o.quality / 100, maxWidth: Number(o.maxWidth) || 0, maxHeight: Number(o.maxHeight) || 0, format: o.format })
    })
    if (!res.ok) {
      it.status = 'error'
      continue
    }
    const larger = res.blob.size >= it.file.size && o.format === 'keep'
    it.out = larger ? it.file : res.blob
    it.name = larger ? it.file.name : withExt(it.file.name, RASTER_EXT[res.blob.type as RasterFormat] ?? 'img', '-min')
    it.status = larger ? 'larger' : 'done'
  }
  busy.value = false
}
const totals = computed(() => {
  const done = items.value.filter((i) => i.out)
  const a = done.reduce((s, i) => s + i.file.size, 0)
  const b = done.reduce((s, i) => s + i.out!.size, 0)
  return done.length ? { from: formatBytes(a), to: formatBytes(b), pct: savings(a, b) } : null
})
async function downloadZip() {
  downloadBlob(await zipBlobs(items.value.filter((i) => i.out).map((i) => ({ name: i.name!, blob: i.out! }))), 'compressed-images.zip')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="image/*" multiple :label="$t('tools.image-compressor.drop')" @files="onFiles" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      <RangeField v-model="o.quality" :label="$t('tools.image-compressor.quality')" :min="1" :max="100" />
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.image-compressor.format') }}</span>
        <ModeToggle v-model="o.format" :options="[['keep', $t('tools.image-compressor.keep')], ['image/webp', 'WebP'], ['image/jpeg', 'JPG'], ['image/png', 'PNG']]" />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <Label>{{ $t('tools.image-compressor.maxWidth') }} <Input v-model.number="o.maxWidth" type="number" min="0" class="w-24" /></Label>
        <Label>{{ $t('tools.image-compressor.maxHeight') }} <Input v-model.number="o.maxHeight" type="number" min="0" class="w-24" /></Label>
        <span class="text-muted-foreground text-xs">{{ $t('tools.image-compressor.unlimited') }}</span>
      </div>
    </div>
    <div v-if="items.length" class="flex flex-col divide-y rounded-md border">
      <div v-for="(it, i) in items" :key="i" class="flex items-center gap-3 p-2 text-sm">
        <span class="flex-1 truncate">{{ it.file.name }}</span>
        <span class="text-muted-foreground">{{ formatBytes(it.file.size) }}</span>
        <template v-if="it.out">
          <span>→ {{ formatBytes(it.out.size) }}</span>
          <span v-if="it.status === 'larger'" class="text-amber-600">{{ $t('tools.image-compressor.larger') }}</span>
          <span v-else class="text-green-600">-{{ savings(it.file.size, it.out.size) }}%</span>
          <Button size="icon" variant="ghost" :aria-label="$t('common.download')" @click="downloadBlob(it.out, it.name!)"><Download /></Button>
        </template>
        <span v-else-if="it.status === 'error'" class="text-destructive">{{ $t('tools.image-compressor.failed') }}</span>
        <Button size="icon" variant="ghost" :aria-label="$t('common.remove')" @click="items.splice(i, 1)"><Trash2 /></Button>
      </div>
    </div>
    <div v-if="items.length" class="flex flex-wrap items-center gap-2">
      <Button :disabled="busy" @click="run">{{ busy ? $t('common.processing') : $t('tools.image-compressor.compress') }}</Button>
      <Button v-if="totals" variant="outline" @click="downloadZip"><Package /> {{ $t('common.download_all') }}</Button>
      <span v-if="totals" class="text-sm">{{ $t('tools.image-compressor.total', totals) }}</span>
    </div>
  </div>
</template>
