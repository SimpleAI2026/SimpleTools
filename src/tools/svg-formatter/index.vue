<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { formatBytes } from '@/lib/format'
import { processSvg } from './logic'

const SAMPLE = '<?xml version="1.0"?>\n<!-- icon -->\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><metadata>generated</metadata><circle cx="12.000001" cy="12" r="10.4999" fill="#6366f1"/><path d="M7.5 12.25l3 3 6-6.5" stroke="#fff" stroke-width="2" fill="none"/></svg>'
const input = ref(SAMPLE)
const mode = ref<'format' | 'minify'>('format')
const o = reactive({ removeMetadata: true, removeEditorData: true })
const precision = ref<'keep' | '1' | '2' | '3'>('3')
const result = computed(() => {
  try {
    return { out: processSvg(input.value, mode.value, { ...o, precision: precision.value === 'keep' ? null : Number(precision.value) }), err: '' }
  } catch (e) {
    return { out: '', err: (e as Error).message }
  }
})
// rendered through <img>, so any script inside the SVG cannot execute
const preview = computed(() => (result.value.out ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.value.out)}` : ''))
const sizes = computed(() => ({ from: formatBytes(new Blob([input.value]).size), to: formatBytes(new Blob([result.value.out]).size) }))
</script>

<template>
  <div class="flex flex-col gap-4">
    <TextIO v-model="input" :output="result.out" :error="result.err" :sample="SAMPLE">
      <ModeToggle v-model="mode" :options="[['format', $t('tools.svg-formatter.format')], ['minify', $t('tools.svg-formatter.minify')]]" />
      <Label><Switch v-model="o.removeMetadata" /> {{ $t('tools.svg-formatter.removeMetadata') }}</Label>
      <Label><Switch v-model="o.removeEditorData" /> {{ $t('tools.svg-formatter.removeEditorData') }}</Label>
      <span class="text-sm">{{ $t('tools.svg-formatter.precision') }}</span>
      <ModeToggle v-model="precision" :options="[['keep', $t('tools.svg-formatter.keep')], ['1', '1'], ['2', '2'], ['3', '3']]" />
      <span class="text-muted-foreground text-xs">{{ $t('tools.svg-formatter.size', sizes) }}</span>
    </TextIO>
    <div v-if="preview" class="flex justify-center rounded-md border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px] p-4">
      <img :src="preview" :alt="$t('common.preview')" class="max-h-64 max-w-full" />
    </div>
  </div>
</template>
