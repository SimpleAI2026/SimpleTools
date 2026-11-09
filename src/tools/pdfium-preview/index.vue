<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight, Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob, downloadText } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { loadSamplePdf } from '@/lib/samplePdf'
import { zipBlobs } from '@/lib/zip'
import { parsePageList } from './logic'
import { destroyPdfium, extractEmbeddedImages, openPdfiumDoc, renderPdfiumPage, renderThumb, type PdfiumDoc } from './pdfium'
import { useObjectUrl } from '@/lib/useObjectUrl'

const file = ref<File | null>(null)
const password = ref('')
const doc = ref<PdfiumDoc | null>(null)
const pageCount = ref(0)
const pageIndex = ref(0)
const { url: previewUrl, setObject: setPreviewUrl, revoke: revokePreviewUrl } = useObjectUrl()
const pngBlob = ref<Blob | null>(null)
const text = ref('')
const allText = ref('')
const busy = ref(false)
const status = ref('')
const error = ref('')
const dims = ref('')
const thumbs = ref<{ i: number; url: string }[]>([])
const range = ref('')
const o = reactive({
  scale: 1.5,
  format: 'image/png' as 'image/png' | 'image/jpeg',
  jpegQuality: 0.9,
  gray: false,
  transparent: false,
  forms: true,
})
let documentGeneration = 0
let renderGeneration = 0
let taskGeneration = 0

onBeforeUnmount(async () => {
  await resetDoc()
  await destroyPdfium()
})

async function runTask(fn: () => Promise<void>, clearError = false) {
  const id = ++taskGeneration
  busy.value = true
  if (clearError) error.value = ''
  try {
    await fn()
  } catch (e) {
    if (id === taskGeneration) error.value = String(e)
  } finally {
    if (id === taskGeneration) busy.value = false
  }
}

function revokePreview() {
  revokePreviewUrl()
  pngBlob.value = null
}
function revokeThumbs() {
  for (const t of thumbs.value) URL.revokeObjectURL(t.url)
  thumbs.value = []
}

async function resetDoc(): Promise<number> {
  const generation = ++documentGeneration
  renderGeneration++
  taskGeneration++
  busy.value = false
  revokePreview()
  revokeThumbs()
  text.value = ''
  allText.value = ''
  dims.value = ''
  const previous = doc.value
  doc.value = null
  pageCount.value = 0
  pageIndex.value = 0
  if (previous) await previous.destroy()
  return generation
}

async function setFile(f: File | null) {
  file.value = f
  error.value = ''
  if (!f) {
    await resetDoc()
    return
  }
  await openWithPassword()
}

async function openWithPassword() {
  const f = file.value
  if (!f) return
  const generation = await resetDoc()
  if (generation !== documentGeneration || file.value !== f) return
  status.value = 'loadingWasm'
  await runTask(async () => {
    const bytes = new Uint8Array(await f.arrayBuffer())
    if (generation !== documentGeneration) return
    const opened = await openPdfiumDoc(bytes, password.value || undefined)
    if (generation !== documentGeneration) {
      await opened.doc.destroy()
      return
    }
    doc.value = opened.doc
    pageCount.value = opened.pageCount
    pageIndex.value = 0
    await performRender(generation)
    await loadThumbs(generation)
  }, true)
  if (generation === documentGeneration) status.value = ''
}

async function loadSample() {
  password.value = ''
  await setFile(await loadSamplePdf())
}

function renderOpts() {
  return {
    scale: o.scale,
    colorSpace: (o.gray ? 'Gray' : 'RGBA') as 'Gray' | 'RGBA',
    transparent: o.transparent,
    renderFormFields: o.forms,
    format: o.format,
    jpegQuality: o.jpegQuality,
  }
}

async function performRender(generation: number) {
  const d = doc.value
  if (!d || generation !== documentGeneration) return
  const id = ++renderGeneration
  const index = pageIndex.value
  const options = renderOpts()
  try {
    const res = await renderPdfiumPage(d, index, options)
    if (id !== renderGeneration || generation !== documentGeneration || d !== doc.value) return
    revokePreview()
    pngBlob.value = res.blob
    setPreviewUrl(res.blob)
    text.value = res.text
    dims.value = `${res.width}×${res.height}`
  } catch (e) {
    if (id !== renderGeneration || generation !== documentGeneration || d !== doc.value) return
    throw e
  }
}

async function renderCurrent() {
  const generation = documentGeneration
  await runTask(() => performRender(generation), true)
}

async function loadThumbs(generation: number) {
  const d = doc.value
  if (!d || generation !== documentGeneration) return
  revokeThumbs()
  const max = Math.min(pageCount.value, 48)
  for (let i = 0; i < max; i++) {
    try {
      const url = await renderThumb(d, i)
      if (generation !== documentGeneration || d !== doc.value) {
        URL.revokeObjectURL(url)
        return
      }
      thumbs.value.push({ i, url })
    } catch {
      if (generation !== documentGeneration || d !== doc.value) return
    }
  }
}

watch(
  () => [o.scale, o.gray, o.transparent, o.forms, o.format, o.jpegQuality],
  () => {
    if (doc.value) void renderCurrent()
  },
)

async function prev() {
  if (pageIndex.value <= 0) return
  pageIndex.value -= 1
  await renderCurrent()
}
async function next() {
  if (pageIndex.value >= pageCount.value - 1) return
  pageIndex.value += 1
  await renderCurrent()
}

async function batchExport() {
  const d = doc.value
  const generation = documentGeneration
  if (!d) return
  await runTask(async () => {
    const pages = parsePageList(range.value, pageCount.value)
    const entries: { name: string; blob: Blob }[] = []
    const ext = o.format === 'image/jpeg' ? 'jpg' : 'png'
    for (const [n, idx] of pages.entries()) {
      if (generation !== documentGeneration || d !== doc.value) return
      status.value = `${n + 1}/${pages.length}`
      const res = await renderPdfiumPage(d, idx, renderOpts())
      if (generation !== documentGeneration || d !== doc.value) return
      entries.push({ name: `page-${String(idx + 1).padStart(3, '0')}.${ext}`, blob: res.blob })
    }
    if (entries.length === 1) downloadBlob(entries[0]!.blob, entries[0]!.name)
    else downloadBlob(await zipBlobs(entries), 'pdfium-pages.zip')
  })
  if (generation === documentGeneration) status.value = ''
}

async function exportAllText() {
  const d = doc.value
  const generation = documentGeneration
  if (!d) return
  await runTask(async () => {
    const parts: string[] = []
    for (let i = 0; i < pageCount.value; i++) {
      if (generation !== documentGeneration || d !== doc.value) return
      const page = await d.getPage(i)
      try {
        const value = await page.getText()
        if (generation !== documentGeneration || d !== doc.value) return
        parts.push(`----- page ${i + 1} -----\n${value.trim()}`)
      } finally {
        await page.close()
      }
    }
    allText.value = parts.join('\n\n')
    downloadText(allText.value, 'pdfium-text.txt')
  })
}

async function exportEmbeds() {
  const generation = documentGeneration
  await runTask(async () => {
    const imgs = await extractEmbeddedImages(password.value || undefined)
    if (generation !== documentGeneration) return
    if (!imgs.length) {
      error.value = 'No embedded images found'
      return
    }
    downloadBlob(await zipBlobs(imgs), 'pdfium-embedded.zip')
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.pdfium-preview.note') }}</p>
    <p class="text-amber-700 dark:text-amber-400 text-sm">{{ $t('tools.pdfium-preview.limitWrite') }}</p>
    <FileDropzone accept="application/pdf,.pdf" :label="$t('tools.pdfium-preview.drop')" @file="setFile($event)" />
    <div class="flex flex-wrap items-center gap-2">
      <Label>
        {{ $t('tools.pdfium-preview.password') }}
        <Input v-model="password" type="password" class="w-48" autocomplete="off" />
      </Label>
      <Button size="sm" variant="outline" :disabled="!file || busy" data-testid="open-pdf" @click="openWithPassword">{{ $t('common.open') }}</Button>
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
      <span v-if="file" class="text-muted-foreground text-sm">{{ file.name }} · {{ formatBytes(file.size) }}</span>
      <span v-if="status === 'loadingWasm'" class="text-sm">{{ $t('tools.pdfium-preview.loadingWasm') }}</span>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="doc">
      <div class="flex flex-wrap items-center gap-3">
        <Button size="icon" variant="outline" :disabled="busy || pageIndex <= 0" @click="prev"><ChevronLeft /></Button>
        <span class="text-sm">{{ $t('tools.pdfium-preview.page', { n: pageIndex + 1, total: pageCount }) }}</span>
        <Button size="icon" variant="outline" :disabled="busy || pageIndex >= pageCount - 1" data-testid="next-page" @click="next"><ChevronRight /></Button>
        <RangeField v-model="o.scale" :label="$t('tools.pdfium-preview.scale')" :min="0.5" :max="6" :step="0.25" class="min-w-48 flex-1" />
        <ModeToggle v-model="o.format" :options="[['image/png', 'PNG'], ['image/jpeg', 'JPEG']]" />
        <Label><Switch v-model="o.gray" /> {{ $t('tools.pdfium-preview.gray') }}</Label>
        <Label><Switch v-model="o.transparent" /> {{ $t('tools.pdfium-preview.transparent') }}</Label>
        <Label><Switch v-model="o.forms" /> {{ $t('tools.pdfium-preview.forms') }}</Label>
      </div>
      <RangeField v-if="o.format === 'image/jpeg'" v-model="o.jpegQuality" :label="$t('tools.pdfium-preview.jpegQuality')" :min="0.3" :max="1" :step="0.05" />
      <div class="flex flex-wrap gap-2">
        <Button size="sm" :disabled="busy" @click="renderCurrent">{{ $t('tools.pdfium-preview.render') }}</Button>
        <Button v-if="pngBlob" size="sm" variant="outline" :disabled="busy" @click="downloadBlob(pngBlob, `page-${pageIndex + 1}.${o.format === 'image/jpeg' ? 'jpg' : 'png'}`)">
          <Download /> {{ $t('tools.pdfium-preview.downloadPng') }}
        </Button>
        <Button size="sm" variant="outline" :disabled="busy" @click="exportAllText">{{ $t('tools.pdfium-preview.allText') }}</Button>
        <Button size="sm" variant="outline" :disabled="busy" @click="exportEmbeds">{{ $t('tools.pdfium-preview.embedImages') }}</Button>
        <span v-if="dims" class="text-muted-foreground text-sm">{{ dims }}</span>
        <span v-if="status && status.includes('/')" class="text-sm">{{ status }}</span>
      </div>
      <div class="flex flex-wrap items-end gap-2">
        <Label>
          {{ $t('tools.pdfium-preview.pageRange') }}
          <Input v-model="range" class="w-48" :placeholder="$t('common.allPages')" />
        </Label>
        <Button size="sm" :disabled="busy" @click="batchExport">{{ $t('tools.pdfium-preview.batch') }}</Button>
      </div>
      <div v-if="thumbs.length" class="flex gap-2 overflow-x-auto py-1" data-testid="thumbnail-list">
        <button
          v-for="t in thumbs"
          :key="t.i"
          type="button"
          class="shrink-0 rounded border p-0.5"
          :class="t.i === pageIndex ? 'border-primary' : 'border-transparent'"
          :data-testid="`thumbnail-${t.i}`"
          @click="pageIndex = t.i; renderCurrent()"
        >
          <img :src="t.url" alt="" class="h-20 w-auto" />
        </button>
      </div>
      <div v-if="previewUrl" class="overflow-auto rounded-md border">
        <img :src="previewUrl" alt="" class="mx-auto max-w-full" data-testid="pdfium-preview-image" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ $t('tools.pdfium-preview.extract') }}</span>
          <div class="flex gap-2">
            <CopyButton v-if="text" :text="text" />
            <Button v-if="text" size="sm" variant="outline" @click="downloadText(text, `page-${pageIndex + 1}.txt`)"><Download /> {{ $t('common.download') }}</Button>
          </div>
        </div>
        <p v-if="!text" class="text-muted-foreground text-sm">{{ $t('tools.pdfium-preview.emptyText') }}</p>
        <Textarea v-else :model-value="text" readonly rows="8" />
      </div>
    </template>
  </div>
</template>
