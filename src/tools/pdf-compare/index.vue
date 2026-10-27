<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import { pageText, renderPage } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { pixelDiff, textDiff, type DiffPart } from './logic'

const A = usePdfFile()
const B = usePdfFile()
const { file: fa, doc: da, numPages: na, busy: ba, error: ea, needsPassword: pa } = A
const { file: fb, doc: db, numPages: nb, busy: bb, error: eb, needsPassword: pb } = B
const mode = ref<'text' | 'visual'>('text')
const gran = ref<'words' | 'lines'>('words')
const busy = ref(false)
const diff = shallowRef<{ parts: DiffPart[]; added: number; removed: number; identical: boolean } | null>(null)
const page = ref(1)
const visual = ref<{ a: string; b: string; d: string; pct: string } | null>(null)
const missing = ref(false)

async function allText(d: PDFDocumentProxy) {
  const out: string[] = []
  for (let i = 1; i <= d.numPages; i++) out.push(await pageText(d, i))
  return out.join('\n\n')
}
async function compareText() {
  diff.value = textDiff(await allText(da.value!), await allText(db.value!), gran.value)
}
function pixels(c: HTMLCanvasElement, w: number, h: number) {
  const t = document.createElement('canvas')
  t.width = w
  t.height = h
  const ctx = t.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(c, 0, 0)
  return { canvas: t, data: ctx.getImageData(0, 0, w, h).data }
}
async function compareVisual() {
  missing.value = page.value > da.value!.numPages || page.value > db.value!.numPages
  if (missing.value) return (visual.value = null)
  const [ca, cb] = await Promise.all([renderPage(da.value!, page.value, 1.25), renderPage(db.value!, page.value, 1.25)])
  const w = Math.max(ca.width, cb.width)
  const h = Math.max(ca.height, cb.height)
  const pa2 = pixels(ca, w, h)
  const pb2 = pixels(cb, w, h)
  const r = pixelDiff(pa2.data, pb2.data)
  const out = document.createElement('canvas')
  out.width = w
  out.height = h
  out.getContext('2d')!.putImageData(new ImageData(r.out as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0)
  visual.value = { a: pa2.canvas.toDataURL(), b: pb2.canvas.toDataURL(), d: out.toDataURL(), pct: (r.ratio * 100).toFixed(2) }
}
async function run() {
  if (!da.value || !db.value) return
  busy.value = true
  try {
    await (mode.value === 'text' ? compareText() : compareVisual())
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 md:grid-cols-2">
      <PdfInput :file="fa" :num-pages="na" :busy="ba" :error="ea" :needs-password="pa" :label="$t('tools.pdf-compare.a')" @load="A.load" />
      <PdfInput :file="fb" :num-pages="nb" :busy="bb" :error="eb" :needs-password="pb" :label="$t('tools.pdf-compare.b')" @load="B.load" />
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <ModeToggle v-model="mode" :options="[['text', $t('tools.pdf-compare.text')], ['visual', $t('tools.pdf-compare.visual')]]" />
      <ModeToggle v-if="mode === 'text'" v-model="gran" :options="[['words', $t('tools.pdf-compare.words')], ['lines', $t('tools.pdf-compare.lines')]]" />
      <Label v-else>{{ $t('tools.pdf-compare.page') }} <Input v-model.number="page" type="number" min="1" class="w-20" /></Label>
      <Button :disabled="!da || !db || busy" @click="run">{{ busy ? $t('common.processing') : $t('tools.pdf-compare.compare') }}</Button>
    </div>
    <template v-if="mode === 'text' && diff">
      <p class="text-sm">{{ diff.identical ? $t('tools.pdf-compare.identical') : $t('tools.pdf-compare.summary', { added: diff.added, removed: diff.removed }) }}</p>
      <pre class="max-h-[36rem] overflow-auto rounded border p-3 text-sm whitespace-pre-wrap"><span v-for="(p, i) in diff.parts" :key="i" :class="p.added ? 'bg-green-200 dark:bg-green-900' : p.removed ? 'bg-red-200 line-through dark:bg-red-900' : ''">{{ p.value }}</span></pre>
    </template>
    <p v-if="mode === 'visual' && missing" class="text-sm">{{ $t('tools.pdf-compare.missing') }}</p>
    <template v-if="mode === 'visual' && visual">
      <p class="text-sm">{{ $t('tools.pdf-compare.changed', { p: visual.pct }) }}</p>
      <div class="grid gap-3 md:grid-cols-3">
        <img :src="visual.a" class="w-full border" alt="A" />
        <img :src="visual.d" class="w-full border" alt="diff" />
        <img :src="visual.b" class="w-full border" alt="B" />
      </div>
    </template>
  </div>
</template>
