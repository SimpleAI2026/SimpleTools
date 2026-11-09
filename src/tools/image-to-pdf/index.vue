<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { ArrowUp, Download, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { canvasToBlob, loadBitmap, makeCanvas } from '@/lib/canvas'
import { downloadPdf } from '@/lib/download'
import { runBusy, withBusy } from '@/lib/runBusy'
import { imagesToPdf, type ImagePdfOptions, type PdfImage } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

interface Item { file: File; url: string }
const items = ref<Item[]>([])
const o = reactive<ImagePdfOptions>({ page: 'a4', orientation: 'auto', margin: 24 })
const error = ref('')
const busy = ref(false)
async function loadSample() {
  await withBusy(busy, async () => {
    add([await loadSampleImage()])
  })
}

function add(files: File[]) {
  items.value.push(...files.filter((f) => f.type.startsWith('image/')).map((file) => ({ file, url: URL.createObjectURL(file) })))
}
function remove(i: number) {
  URL.revokeObjectURL(items.value[i]!.url)
  items.value.splice(i, 1)
}
function clearItems() {
  for (const item of items.value) URL.revokeObjectURL(item.url)
  items.value = []
}
function up(i: number) {
  if (i > 0) items.value.splice(i - 1, 2, items.value[i]!, items.value[i - 1]!)
}
async function toPdfImage(f: File): Promise<PdfImage> {
  const bmp = await loadBitmap(f)
  const { width, height } = bmp
  if (f.type === 'image/png' || f.type === 'image/jpeg') {
    bmp.close()
    return { bytes: new Uint8Array(await f.arrayBuffer()), type: f.type === 'image/png' ? 'png' : 'jpg', width, height }
  }
  const [c, ctx] = makeCanvas(width, height)
  ctx.drawImage(bmp, 0, 0)
  bmp.close()
  return { bytes: new Uint8Array(await (await canvasToBlob(c, 'image/png')).arrayBuffer()), type: 'png', width, height }
}
async function run() {
  await runBusy({ busy, error }, async () => {
    const imgs: PdfImage[] = []
    for (const it of items.value) imgs.push(await toPdfImage(it.file))
    downloadPdf(await imagesToPdf(imgs, o), 'images.pdf')
  }, { clearError: true })
}
onBeforeUnmount(clearItems)
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="image/*" multiple :label="$t('tools.image-to-pdf.choose')" @files="add" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div v-if="items.length" class="grid grid-cols-3 gap-3 md:grid-cols-6">
      <div v-for="(it, i) in items" :key="it.url" class="relative rounded border p-1">
        <img :src="it.url" class="h-28 w-full object-contain" :alt="it.file.name" />
        <div class="flex justify-between text-xs">
          <span>{{ i + 1 }}</span>
          <span class="flex gap-1">
            <button :aria-label="$t('tools.image-to-pdf.up')" @click="up(i)"><ArrowUp class="size-3" /></button>
            <button :aria-label="$t('common.remove')" @click="remove(i)"><X class="size-3" /></button>
          </span>
        </div>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.image-to-pdf.page') }}</span>
      <ModeToggle v-model="o.page" :options="[['fit', $t('tools.image-to-pdf.fit')], ['a4', 'A4'], ['letter', 'Letter'], ['a3', 'A3']]" />
      <ModeToggle v-if="o.page !== 'fit'" v-model="o.orientation" :options="[['auto', $t('tools.image-to-pdf.auto')], ['portrait', $t('tools.image-to-pdf.portrait')], ['landscape', $t('tools.image-to-pdf.landscape')]]" />
    </div>
    <RangeField v-model="o.margin" class="max-w-md" :label="$t('tools.image-to-pdf.margin')" :max="96" unit="pt" />
    <ErrorAlert v-if="error" :message="error" />
    <div><Button :disabled="!items.length || busy" @click="run"><Download /> {{ busy ? $t('common.processing') : $t('tools.image-to-pdf.run') }}</Button></div>
  </div>
</template>
