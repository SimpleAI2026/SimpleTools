<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useResizeObserver } from '@vueuse/core'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { renderPage } from '@/lib/pdf'
import { fitWidth } from './fitWidth'

/** Renders one PDF page and reports pointer positions in page viewport units (pt, top-left origin). */
const props = withDefaults(defineProps<{ doc: PDFDocumentProxy; page: number; width?: number; rotation?: number }>(), { width: 720, rotation: undefined })
const emit = defineEmits<{ down: [p: { x: number; y: number }]; move: [p: { x: number; y: number }]; up: [p: { x: number; y: number }] }>()
const { t } = useI18n()
const src = ref('')
const scale = ref(1)
const size = ref({ w: 0, h: 0 })
const renderError = ref('')
const box = ref<HTMLDivElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const containerW = ref(0)
useResizeObserver(container, (entries) => {
  containerW.value = entries[0]?.contentRect.width ?? 0
})
const renderWidth = computed(() => fitWidth(props.width, containerW.value || props.width))
let token = 0

function replaceSource(next: string) {
  const previous = src.value
  src.value = next
  if (previous) URL.revokeObjectURL(previous)
}

watch(
  () => [props.doc, props.page, renderWidth.value, props.rotation] as const,
  async ([doc, n, width, rotation]) => {
    const my = ++token
    renderError.value = ''
    try {
      const pg = await doc.getPage(n)
      if (my !== token) return
      const vp = pg.getViewport({ scale: 1, rotation: rotation ?? pg.rotate })
      const s = width / vp.width
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const c = rotation === undefined ? await renderPage(doc, n, s * dpr) : await renderRotated(doc, n, s * dpr, rotation)
      if (my !== token) return
      const url = await new Promise<string>((resolve, reject) => {
        c.toBlob((blob) => {
          if (!blob) {
            reject(new Error('PDF page image encoding failed'))
            return
          }
          resolve(URL.createObjectURL(blob))
        }, 'image/png')
      })
      if (my !== token) {
        URL.revokeObjectURL(url)
        return
      }
      replaceSource(url)
      scale.value = s
      size.value = { w: vp.width, h: vp.height }
    } catch {
      if (my !== token) return
      replaceSource('')
      renderError.value = t('app.loadError')
    }
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
onBeforeUnmount(() => {
  token++
  replaceSource('')
})
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
    <p v-if="renderError" class="text-destructive mb-2 text-sm" role="alert">{{ renderError }}</p>
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
