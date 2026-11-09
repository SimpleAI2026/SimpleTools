<script setup lang="ts">
import { reactive, ref, shallowRef } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { loadSamplePdf } from '@/lib/samplePdf'
import { overlayPdf, type OverlayOptions } from './logic'

const base = shallowRef<File | null>(null)
const over = shallowRef<File | null>(null)
const o = reactive<OverlayOptions>({ mapping: 'first', layer: 'foreground', opacity: 1, fit: 'stretch', pages: '' })
const error = ref('')
async function loadSample() {
  const f = await loadSamplePdf()
  base.value = f
  over.value = f
}
async function run() {
  if (!base.value || !over.value) return
  error.value = ''
  try {
    const out = await overlayPdf(new Uint8Array(await base.value.arrayBuffer()), new Uint8Array(await over.value.arrayBuffer()), o)
    downloadBlob(pdfBlob(out), base.value.name.replace(/\.pdf$/i, '') + '-overlay.pdf')
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.pdf-overlay.base') }}</Label>
        <FileDropzone accept="application/pdf,.pdf" :label="base?.name ?? $t('common.choosePdf')" @file="(f) => (base = f)" />
      </div>
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.pdf-overlay.overlay') }}</Label>
        <FileDropzone accept="application/pdf,.pdf" :label="over?.name ?? $t('common.choosePdf')" @file="(f) => (over = f)" />
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.pdf-overlay.mapping') }}</span>
      <ModeToggle v-model="o.mapping" :options="[['first', $t('tools.pdf-overlay.first')], ['cycle', $t('tools.pdf-overlay.cycle')]]" />
      <span class="text-sm">{{ $t('tools.pdf-overlay.layer') }}</span>
      <ModeToggle v-model="o.layer" :options="[['foreground', $t('tools.pdf-overlay.foreground')], ['background', $t('tools.pdf-overlay.background')]]" />
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.pdf-overlay.fit') }}</span>
      <ModeToggle v-model="o.fit" :options="[['stretch', $t('tools.pdf-overlay.stretch')], ['contain', $t('tools.pdf-overlay.contain')], ['none', $t('tools.pdf-overlay.none')]]" />
      <Label>{{ $t('common.pageRange') }} <Input v-model="o.pages" class="w-40" /></Label>
    </div>
    <RangeField v-model="o.opacity" class="max-w-md" :label="$t('tools.pdf-overlay.opacity')" :max="1" :step="0.05" />
    <ErrorAlert v-if="error" :message="error" />
    <div><Button :disabled="!base || !over" @click="run"><Download /> {{ $t('tools.pdf-overlay.run') }}</Button></div>
  </div>
</template>
