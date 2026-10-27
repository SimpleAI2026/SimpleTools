<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ErrorAlert from './ErrorAlert.vue'
import FileDropzone from './FileDropzone.vue'
import { formatBytes } from '@/lib/format'
import { loadSamplePdf } from '@/lib/samplePdf'

/** Dropzone + password prompt + status line for tools built on usePdfFile(). */
const props = defineProps<{
  file: File | null
  numPages: number
  busy: boolean
  error: string
  needsPassword: boolean
  label?: string
  /** When false, hide the Sample PDF button (e.g. dual-PDF tools). Default true. */
  sample?: boolean
}>()
const emit = defineEmits<{ load: [file: File, password?: string] }>()
const password = ref('')
const sampleBusy = ref(false)

async function loadSample() {
  if (sampleBusy.value || props.busy) return
  sampleBusy.value = true
  try {
    emit('load', await loadSamplePdf())
  } finally {
    sampleBusy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <FileDropzone accept="application/pdf,.pdf" :label="label ?? $t('common.choosePdf')" @file="(f) => emit('load', f)" />
    <div v-if="props.sample !== false" class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="props.busy || sampleBusy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div v-if="props.needsPassword && props.file" class="flex flex-wrap items-center gap-2">
      <span class="text-sm">{{ $t('common.pdfPassword') }}</span>
      <Input v-model="password" type="password" class="w-48" @keyup.enter="emit('load', props.file!, password)" />
      <Button size="sm" @click="emit('load', props.file!, password)">{{ $t('common.open') }}</Button>
    </div>
    <span v-else-if="props.file && props.numPages" class="text-sm">{{ props.file.name }} · {{ formatBytes(props.file.size) }} · {{ $t('common.pageCount', { n: props.numPages }) }}</span>
    <span v-if="props.busy" class="text-sm">{{ $t('common.processing') }}</span>
    <ErrorAlert v-if="props.error" :message="props.error" />
  </div>
</template>
