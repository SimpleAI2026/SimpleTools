<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight, Download, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import PdfPageCanvas from '@/components/shared/PdfPageCanvas.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { canvasTextRasterizer } from '@/lib/pdfDraw'
import { usePdfFile } from '@/lib/usePdfFile'
import { applyEdits, type Edit } from './logic'

type Tool = 'select' | 'text' | 'rect' | 'whiteout' | 'image'
const { t } = useI18n()
const { file, bytes, doc, numPages, error, busy, needsPassword, load: loadPdf, baseName } = usePdfFile()
const page = ref(1)
const tool = ref<Tool>('text')
const edits = ref<Edit[]>([])
const sel = ref<number | null>(null)
const img = shallowRef<{ bytes: Uint8Array; type: 'png' | 'jpg'; url: string; ratio: number } | null>(null)
const start = ref<{ x: number; y: number } | null>(null)
const draft = ref<{ x: number; y: number; w: number; h: number } | null>(null)
const current = computed(() => (sel.value === null ? null : edits.value[sel.value] ?? null))
const urls = new WeakMap<Uint8Array, string>()
const imgUrl = (b: Uint8Array) => urls.get(b) ?? (urls.set(b, URL.createObjectURL(new Blob([b as BlobPart]))), urls.get(b)!)

async function load(f: File, pw?: string) {
  edits.value = []
  page.value = 1
  await loadPdf(f, pw)
}
async function pickImage(f: File) {
  const bmp = await createImageBitmap(f)
  img.value = { bytes: new Uint8Array(await f.arrayBuffer()), type: f.type === 'image/png' ? 'png' : 'jpg', url: URL.createObjectURL(f), ratio: bmp.height / bmp.width }
  bmp.close()
}
function down(p: { x: number; y: number }) {
  if (tool.value === 'text') {
    edits.value.push({ type: 'text', page: page.value, x: p.x, y: p.y, text: t('tools.pdf-editor.text'), size: 14, color: '#000000' })
    sel.value = edits.value.length - 1
  } else if (tool.value === 'image' && img.value) {
    edits.value.push({ type: 'image', page: page.value, x: p.x, y: p.y, w: 120, h: 120 * img.value.ratio, bytes: img.value.bytes, imgType: img.value.type })
    sel.value = edits.value.length - 1
  } else if (tool.value === 'rect' || tool.value === 'whiteout') start.value = p
}
function move(p: { x: number; y: number }) {
  if (start.value) draft.value = { x: Math.min(p.x, start.value.x), y: Math.min(p.y, start.value.y), w: Math.abs(p.x - start.value.x), h: Math.abs(p.y - start.value.y) }
}
function up() {
  if (start.value && draft.value && draft.value.w > 2 && draft.value.h > 2) {
    const white = tool.value === 'whiteout'
    edits.value.push({ type: 'rect', page: page.value, ...draft.value, color: white ? '#ffffff' : '#e11d48', fill: white, opacity: 1, stroke: 1.5 })
    sel.value = edits.value.length - 1
  }
  start.value = draft.value = null
}
function remove() {
  if (sel.value !== null) edits.value.splice(sel.value, 1)
  sel.value = null
}
async function save() {
  if (!bytes.value) return
  busy.value = true
  try {
    downloadBlob(pdfBlob(await applyEdits(bytes.value, edits.value, canvasTextRasterizer)), `${baseName()}-edited.pdf`)
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
      <div class="flex flex-wrap items-center gap-2">
        <ModeToggle v-model="tool" :options="[['select', $t('tools.pdf-editor.select')], ['text', $t('tools.pdf-editor.text')], ['rect', $t('tools.pdf-editor.rect')], ['whiteout', $t('tools.pdf-editor.whiteout')], ['image', $t('tools.pdf-editor.image')]]" />
        <Button size="sm" variant="outline" :disabled="page <= 1" :aria-label="$t('tools.pdf-editor.prev')" @click="page--"><ChevronLeft /></Button>
        <span class="text-sm">{{ $t('tools.pdf-editor.page', { n: page, total: numPages }) }}</span>
        <Button size="sm" variant="outline" :disabled="page >= numPages" :aria-label="$t('tools.pdf-editor.next')" @click="page++"><ChevronRight /></Button>
        <Button size="sm" :disabled="!edits.length || busy" @click="save"><Download /> {{ $t('tools.pdf-editor.save') }}</Button>
      </div>
      <FileDropzone v-if="tool === 'image'" accept="image/png,image/jpeg" :label="$t('tools.pdf-editor.chooseImage')" @file="pickImage" />
      <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-editor.hint') }} {{ $t('tools.pdf-editor.note') }}</p>
      <div class="flex flex-col gap-4 lg:flex-row">
        <div class="overflow-auto">
          <PdfPageCanvas v-slot="{ scale }" :doc="doc" :page="page" :rotation="0" :width="680" :class="tool === 'select' ? '' : 'cursor-crosshair'" @down="down" @move="move" @up="up">
            <template v-for="(e, i) in edits" :key="i">
              <div
                v-if="e.page === page"
                class="absolute"
                :class="[sel === i ? 'ring-2 ring-blue-500' : '', tool === 'select' ? 'cursor-pointer' : 'pointer-events-none']"
                :style="{ left: `${e.x * scale}px`, top: `${e.y * scale}px`, ...(e.type === 'text' ? { color: e.color, fontSize: `${e.size * scale}px`, lineHeight: 1.25, whiteSpace: 'pre', fontWeight: e.bold ? 700 : 400, fontFamily: 'Helvetica, Arial, sans-serif' } : { width: `${e.w * scale}px`, height: `${e.h * scale}px` }), ...(e.type === 'rect' ? (e.fill ? { background: e.color, opacity: e.opacity } : { border: `${e.stroke * scale}px solid ${e.color}`, opacity: e.opacity }) : {}) }"
                @pointerdown.stop="sel = i"
              >
                <template v-if="e.type === 'text'">{{ e.text }}</template>
                <img v-else-if="e.type === 'image'" :src="imgUrl(e.bytes)" class="h-full w-full" alt="" />
              </div>
            </template>
            <div v-if="draft" class="absolute border border-dashed border-blue-500" :style="{ left: `${draft.x * scale}px`, top: `${draft.y * scale}px`, width: `${draft.w * scale}px`, height: `${draft.h * scale}px` }" />
          </PdfPageCanvas>
        </div>
        <div class="flex min-w-64 flex-col gap-3">
          <h3 class="text-sm font-medium">{{ $t('tools.pdf-editor.items', { n: edits.length }) }}</h3>
          <template v-if="current">
            <template v-if="current.type === 'text'">
              <Textarea class="h-auto" v-model="current.text" rows="3" :aria-label="$t('tools.pdf-editor.content')" />
              <RangeField v-model="current.size" :label="$t('tools.pdf-editor.size')" :min="6" :max="96" unit="pt" />
              <Label><Switch v-model="current.bold" /> {{ $t('tools.pdf-editor.bold') }}</Label>
            </template>
            <template v-if="current.type !== 'text'">
              <Label>{{ $t('tools.pdf-editor.width') }} <Input v-model.number="current.w" type="number" class="w-24" /></Label>
              <Label>{{ $t('tools.pdf-editor.height') }} <Input v-model.number="current.h" type="number" class="w-24" /></Label>
            </template>
            <template v-if="current.type === 'rect'">
              <Label><Switch v-model="current.fill" /> {{ $t('tools.pdf-editor.fill') }}</Label>
              <RangeField v-model="current.opacity" :label="$t('tools.pdf-editor.opacity')" :max="1" :step="0.05" />
            </template>
            <label v-if="current.type !== 'image'" class="flex items-center gap-2 text-sm">{{ $t('tools.pdf-editor.color') }} <input v-model="current.color" type="color" class="h-8 w-10 rounded border" /></label>
            <div class="flex gap-2">
              <Label>X <Input v-model.number="current.x" type="number" class="w-20" /></Label>
              <Label>Y <Input v-model.number="current.y" type="number" class="w-20" /></Label>
            </div>
            <Button variant="destructive" size="sm" @click="remove"><Trash2 /> {{ $t('tools.pdf-editor.delete') }}</Button>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
