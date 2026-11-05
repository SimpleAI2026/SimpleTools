<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { renderPage } from '@/lib/pdf'
import { fitWidth } from './fitWidth'

/** Renders one PDF page and reports pointer positions in page viewport units (pt, top-left origin). */
const props = withDefaults(defineProps<{ doc: PDFDocumentProxy; page: number; width?: number; rotation?: number }>(), { width: 720, rotation: undefined })
const emit = defineEmits<{ down: [p: { x: number; y: number }]; move: [p: { x: number; y: number }]; up: [p: { x: number; y: number }] }>()
const src = ref('')
const scale = ref(1)
const size = ref({ w: 0, h: 0 })
const box = ref<HTMLDivElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const containerW = ref(0)
useResizeObserver(container, (entries) => {
  containerW.value = entries[0]?.contentRect.width ?? 0
})
const renderWidth = computed(() => fitWidth(props.width, containerW.value || props.width))
let token = 0

watch(
  () => [props.doc, props.page, renderWidth.value, props.rotation] as const,
  async ([doc, n, width, rotation]) => {
    const my = ++token
    const pg = await doc.getPage(n)
    const vp = pg.getViewport({ scale: 1, rotation: rotation ?? pg.rotate })
    const s = width / vp.width
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const c = rotation === undefined ? await renderPage(doc, n, s * dpr) : await renderRotated(doc, n, s * dpr, rotation)
    if (my !== token) return
    const url = await new Promise<string>((res) => c.toBlob((b) => res(b ? URL.createObjectURL(b) : ''), 'image/png'))
    if (src.value) URL.revokeObjectURL(src.value)
    src.value = url
    scale.value = s
    size.value = { w: vp.width, h: vp.height }
  },
  { immediate: true },
)
async function renderRotated(doc: PDFDocumentProxy, n: number, s: number, rotation: number) {
  const page = await doc.getPage(n)
  const vp = page.getViewport({ scale: s, rotation })
  const c = document.createElement('canvas')
  c.width = Math.floor(vp.width)
  c.height = Math.floor(vp.height)
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, c.width, c.height)
  await page.render({ canvas: c, canvasContext: ctx, viewport: vp }).promise
  return c
}
onBeforeUnmount(() => src.value && URL.revokeObjectURL(src.value))
function pos(e: PointerEvent) {
  const r = box.value!.getBoundingClientRect()
  return { x: Math.max(0, Math.min(size.value.w, (e.clientX - r.left) / scale.value)), y: Math.max(0, Math.min(size.value.h, (e.clientY - r.top) / scale.value)) }
}
function onDown(e: PointerEvent) {
  ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  emit('down', pos(e))
}
defineExpose({ scale })
</script>

<template>
  <div ref="container" class="w-full max-w-full overflow-auto overscroll-contain">
    <div
      ref="box"
      class="relative touch-manipulation select-none overflow-hidden border bg-white"
      :style="{ width: `${size.w * scale}px`, height: `${size.h * scale}px` }"
      @pointerdown="onDown"
      @pointermove="(e) => emit('move', pos(e))"
      @pointerup="(e) => emit('up', pos(e))"
    >
      <img v-if="src" :src="src" class="pointer-events-none absolute inset-0 h-full w-full" alt="" draggable="false" />
      <slot :scale="scale" />
    </div>
  </div>
</template>
