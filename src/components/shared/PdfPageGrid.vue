<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { renderPage } from '@/lib/pdf'

/**
 * Lazy thumbnail grid for a pdf.js document. Clicking a page emits `toggle`;
 * `selected` highlights pages and `rotations` previews extra rotation (degrees).
 */
const props = withDefaults(defineProps<{ doc: PDFDocumentProxy; selected?: number[]; rotations?: Record<number, number>; max?: number; scale?: number }>(), {
  selected: () => [],
  rotations: () => ({}),
  max: 300,
  scale: 0.3,
})
const emit = defineEmits<{ toggle: [page: number] }>()
const thumbs = shallowRef<string[]>([])
const token = ref(0)
watch(
  () => props.doc,
  async (doc) => {
    const id = ++token.value
    thumbs.value = []
    const n = Math.min(doc.numPages, props.max)
    for (let i = 1; i <= n; i++) {
      const c = await renderPage(doc, i, props.scale)
      if (id !== token.value) return
      thumbs.value = [...thumbs.value, c.toDataURL('image/jpeg', 0.7)]
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => token.value++)
</script>

<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
    <button
      v-for="(src, i) in thumbs"
      :key="i"
      type="button"
      class="flex flex-col items-center gap-1 rounded-md border p-2 transition-colors"
      :class="selected.includes(i + 1) ? 'border-primary bg-primary/10 ring-primary ring-2' : 'hover:bg-accent'"
      @click="emit('toggle', i + 1)"
    >
      <div class="flex h-36 items-center justify-center">
        <img :src="src" :alt="`#${i + 1}`" class="max-h-36 max-w-full shadow transition-transform" :style="{ transform: `rotate(${rotations[i + 1] ?? 0}deg)` }" />
      </div>
      <span class="text-xs">{{ i + 1 }}</span>
    </button>
    <div v-if="doc.numPages > thumbs.length" class="text-muted-foreground flex items-center justify-center text-xs">…</div>
  </div>
</template>
