<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import PdfInput from '@/components/shared/PdfInput.vue'
import PdfPageCanvas from '@/components/shared/PdfPageCanvas.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { canvasRedactor, rectFromDrag, redactPdf, type RedactRect } from './logic'

const { file, bytes, doc, numPages, error, busy, needsPassword, load: loadPdf, baseName } = usePdfFile()
const page = ref(1)
const rects = ref<RedactRect[]>([])
const dpi = ref(200)
const color = ref('#000000')
const start = ref<{ x: number; y: number } | null>(null)
const draft = ref<RedactRect | null>(null)
const pageRects = computed(() => rects.value.filter((r) => r.page === page.value))
async function load(f: File, pw?: string) {
  rects.value = []
  page.value = 1
  await loadPdf(f, pw)
}
function move(p: { x: number; y: number }) {
  if (start.value) draft.value = rectFromDrag(page.value, start.value, p, 0)
}
function up(p: { x: number; y: number }) {
  if (!start.value) return
  const r = rectFromDrag(page.value, start.value, p)
  if (r) rects.value.push(r)
  start.value = draft.value = null
}
async function run() {
  if (!bytes.value || !doc.value) return
  busy.value = true
  try {
    const out = await redactPdf(bytes.value, rects.value, canvasRedactor(doc.value, dpi.value, color.value))
    downloadBlob(pdfBlob(out), `${baseName()}-redacted.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="doc">
      <p class="text-muted-foreground text-sm">{{ $t('tools.pdf-redact.hint') }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" :disabled="page <= 1" :aria-label="$t('tools.pdf-redact.prev')" @click="page--"><ChevronLeft /></Button>
        <span class="text-sm">{{ $t('tools.pdf-redact.page', { n: page, total: numPages }) }}</span>
        <Button size="sm" variant="outline" :disabled="page >= numPages" :aria-label="$t('tools.pdf-redact.next')" @click="page++"><ChevronRight /></Button>
        <Button size="sm" variant="ghost" @click="rects = rects.filter((r) => r.page !== page)">{{ $t('tools.pdf-redact.clear') }}</Button>
      </div>
      <div class="flex flex-col gap-4 lg:flex-row">
        <div class="overflow-auto">
          <PdfPageCanvas v-slot="{ scale }" :doc="doc" :page="page" :width="680" class="cursor-crosshair" @down="(p) => (start = p)" @move="move" @up="up">
            <div v-for="(r, i) in [...pageRects, ...(draft ? [draft] : [])]" :key="i" class="absolute opacity-80" :style="{ left: `${r.x * scale}px`, top: `${r.y * scale}px`, width: `${r.w * scale}px`, height: `${r.h * scale}px`, background: color }" />
          </PdfPageCanvas>
        </div>
        <div class="flex min-w-60 flex-col gap-3">
          <h3 class="text-sm font-medium">{{ $t('tools.pdf-redact.boxes', { n: rects.length }) }}</h3>
          <ul class="max-h-64 overflow-auto text-xs">
            <li v-for="(r, i) in rects" :key="i" class="flex items-center justify-between gap-2">
              <button class="underline" @click="page = r.page">p{{ r.page }} · {{ Math.round(r.x) }},{{ Math.round(r.y) }} {{ Math.round(r.w) }}×{{ Math.round(r.h) }}</button>
              <button :aria-label="$t('common.remove')" @click="rects.splice(i, 1)"><X class="size-3" /></button>
            </li>
          </ul>
          <RangeField v-model="dpi" :label="$t('tools.pdf-redact.dpi')" :min="72" :max="400" :step="4" unit="dpi" />
          <label class="flex items-center gap-2 text-sm">{{ $t('tools.pdf-redact.color') }} <input v-model="color" type="color" class="h-8 w-10 rounded border" /></label>
          <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-redact.warn') }}</p>
          <Button :disabled="!rects.length || busy" @click="run"><Download /> {{ busy ? $t('common.processing') : $t('tools.pdf-redact.run') }}</Button>
        </div>
      </div>
    </template>
  </div>
</template>
