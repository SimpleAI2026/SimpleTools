<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<{ accept?: string; label: string; multiple?: boolean }>()
const emit = defineEmits<{ file: [file: File]; files: [files: File[]] }>()
const dragging = ref(false)
const input = ref<HTMLInputElement | null>(null)

/** Emits `file` with the first file, and `files` with all of them (only more than one when `multiple`). */
function emitFiles(list: FileList | null | undefined) {
  const files = Array.from(list ?? [])
  if (!files.length) return
  emit('file', files[0]!)
  emit('files', props.multiple ? files : files.slice(0, 1))
}
function onDrop(e: DragEvent) {
  dragging.value = false
  emitFiles(e.dataTransfer?.files)
}
function onChange(e: Event) {
  emitFiles((e.target as HTMLInputElement).files)
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <button
    type="button"
    :class="
      cn(
        'text-muted-foreground hover:bg-accent/50 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-10 text-sm transition-colors',
        dragging && 'border-primary bg-accent/50',
      )
    "
    @click="input?.click()"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <Upload class="size-6" />
    {{ props.label }}
    <input ref="input" type="file" class="hidden" :accept="props.accept" :multiple="props.multiple" @change="onChange" />
  </button>
</template>
