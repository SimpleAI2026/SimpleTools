<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { compress, decompress, GZ_EXT, gzipName, looksLikeText, ratio, type GzFormat } from './logic'

const { t } = useI18n()
const mode = ref<'compress' | 'decompress'>('compress')
const source = ref<'text' | 'file'>('text')
const SAMPLE_TEXT = 'SimpleTools sample — offline-first developer toolbox. '.repeat(12)
const text = ref(SAMPLE_TEXT)
const file = shallowRef<File | null>(null)
const fmt = ref<GzFormat>('gzip')
const inFmt = ref<GzFormat | 'auto'>('auto')
const level = ref(6)
const out = shallowRef<Uint8Array | null>(null)
const outName = ref('')
const inSize = ref(0)
const detected = ref('')
const error = ref('')
const busy = ref(false)

const toB64 = (d: Uint8Array) => {
  let s = ''
  for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode(...d.subarray(i, i + 0x8000))
  return btoa(s)
}
const preview = computed(() => {
  if (!out.value) return ''
  if (mode.value === 'compress') return out.value.length <= 512 * 1024 ? toB64(out.value) : ''
  return looksLikeText(out.value) ? new TextDecoder().decode(out.value.subarray(0, 1024 * 1024)) : ''
})

async function run() {
  error.value = ''
  out.value = null
  busy.value = true
  try {
    let input: Uint8Array
    if (source.value === 'text' && mode.value === 'compress') input = new TextEncoder().encode(text.value)
    else if (source.value === 'text') input = Uint8Array.from(atob(text.value.replace(/\s+/g, '')), (c) => c.charCodeAt(0))
    else if (file.value) input = new Uint8Array(await file.value.arrayBuffer())
    else return
    inSize.value = input.length
    const base = file.value && source.value === 'file' ? file.value.name : 'text.txt'
    if (mode.value === 'compress') {
      out.value = await compress(input, fmt.value, level.value)
      outName.value = base + GZ_EXT[fmt.value]
    } else {
      const r = await decompress(input, inFmt.value)
      out.value = r.data
      detected.value = r.format
      outName.value = gzipName(input) ?? base.replace(/\.(gz|zz|deflate|z)$/i, '') ?? 'output.bin'
      if (outName.value === base) outName.value = `${base}.out`
    }
  } catch {
    error.value = t('tools.gzip-tool.failed')
  } finally {
    busy.value = false
  }
}
function saveOut() {
  if (out.value) downloadBlob(new Blob([out.value as BlobPart]), outName.value)
}
function loadSample() {
  source.value = 'text'
  mode.value = 'compress'
  text.value = SAMPLE_TEXT
  out.value = null
  error.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <ModeToggle v-model="mode" :options="[['compress', $t('tools.gzip-tool.compress')], ['decompress', $t('tools.gzip-tool.decompress')]]" />
      <span class="text-sm">{{ $t('tools.gzip-tool.source') }}</span>
      <ModeToggle v-model="source" :options="[['text', mode === 'compress' ? $t('tools.gzip-tool.text') : 'Base64'], ['file', $t('tools.gzip-tool.file')]]" />
      <span class="text-sm">{{ $t('tools.gzip-tool.format') }}</span>
      <ModeToggle v-if="mode === 'compress'" v-model="fmt" :options="[['gzip', 'gzip'], ['zlib', 'zlib'], ['deflate-raw', 'deflate']]" />
      <ModeToggle v-else v-model="inFmt" :options="[['auto', $t('tools.gzip-tool.auto')], ['gzip', 'gzip'], ['zlib', 'zlib'], ['deflate-raw', 'deflate']]" />
    </div>
    <RangeField v-if="mode === 'compress'" v-model="level" class="max-w-md" :label="$t('tools.gzip-tool.level')" :min="0" :max="9" />
    <Textarea v-if="source === 'text'" v-model="text" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" data-testid="tool-input" />
    <template v-else>
      <FileDropzone :label="$t('tools.gzip-tool.drop')" @file="(f) => (file = f)" />
      <span v-if="file" class="text-sm">{{ file.name }} · {{ formatBytes(file.size) }}</span>
    </template>
    <div><Button :disabled="busy" @click="run">{{ busy ? $t('common.processing') : $t('tools.gzip-tool.run') }}</Button></div>
    <ErrorAlert v-if="error" :message="error" />
    <div v-if="out" class="flex flex-col gap-2 rounded-md border p-3">
      <div class="flex flex-wrap items-center gap-3 text-sm">
        <span>{{ $t('tools.gzip-tool.result', { from: formatBytes(inSize), to: formatBytes(out.length), ratio: ratio(inSize, out.length) }) }}</span>
        <span v-if="mode === 'decompress'" class="text-muted-foreground">{{ $t('tools.gzip-tool.detected', { format: detected }) }}</span>
        <Button size="sm" variant="outline" @click="saveOut"><Download /> {{ outName }}</Button>
      </div>
      <template v-if="preview">
        <div class="flex items-center justify-between">
          <Label>{{ mode === 'compress' ? $t('tools.gzip-tool.base64') : $t('tools.gzip-tool.textPreview') }}</Label>
          <CopyButton :text="preview" />
        </div>
        <Textarea :model-value="preview" readonly class="bg-muted/40 min-h-[500px] font-mono break-all min-h-[500px] h-[500px]" data-testid="tool-output" />
      </template>
      <span v-else-if="mode === 'decompress'" class="text-muted-foreground text-sm">{{ $t('tools.gzip-tool.binary') }}</span>
    </div>
  </div>
</template>
