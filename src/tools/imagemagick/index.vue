<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { offlineUrl } from '@/lib/offlineAssets'
import { loadSampleImage } from '@/lib/sampleImage'
import { zipBlobs } from '@/lib/zip'
import { buildPipeline, IM_FORMATS, withFormatExt, type ImFormat } from './logic'
import type { MagickResponse } from './magick.worker'

type Tab = 'basic' | 'adjust' | 'crop' | 'watermark' | 'gif' | 'advanced'
type Mode = 'single' | 'splitGif' | 'joinGif' | 'stats'

const file = ref<File | null>(null)
const wmFile = ref<File | null>(null)
const extraFiles = ref<File[]>([])
const previewUrl = ref<string | null>(null)
const outUrl = ref<string | null>(null)
const outBlob = ref<Blob | null>(null)
const outName = ref('')
const outMeta = ref('')
const statsText = ref('')
const supported = ref<string[]>([])
const busy = ref(false)
const status = ref('')
const error = ref('')
const tab = ref<Tab>('basic')
const mode = ref<Mode>('single')

const o = reactive({
  format: 'WEBP' as string,
  quality: 80,
  maxWidth: 1920,
  maxHeight: 0,
  autoOrient: true,
  cropEnabled: false,
  cropX: 0,
  cropY: 0,
  cropW: 0,
  cropH: 0,
  rotate: 0,
  flip: false,
  flop: false,
  blurEnabled: false,
  blurRadius: 0,
  blurSigma: 1,
  sharpenEnabled: false,
  sharpenRadius: 0,
  sharpenSigma: 1,
  modulateEnabled: false,
  brightness: 100,
  saturation: 100,
  hue: 100,
  gravity: 'Southeast',
  wmX: 8,
  wmY: 8,
  frameIndex: -1,
})

let worker: Worker | null = null
let seq = 0
const pending = new Map<number, (r: MagickResponse) => void>()

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./magick.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (e: MessageEvent<MagickResponse>) => {
      pending.get(e.data.id)?.(e.data)
      pending.delete(e.data.id)
    }
  }
  return worker
}

function callWorker(msg: object, transfer: Transferable[] = []) {
  const id = ++seq
  return new Promise<MagickResponse>((resolve) => {
    pending.set(id, resolve)
    getWorker().postMessage({ ...msg, id }, transfer)
  })
}

onBeforeUnmount(() => {
  worker?.terminate()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (outUrl.value) URL.revokeObjectURL(outUrl.value)
})

function setFile(f: File | null) {
  file.value = f
  outBlob.value = null
  outMeta.value = ''
  statsText.value = ''
  error.value = ''
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  if (outUrl.value) URL.revokeObjectURL(outUrl.value)
  previewUrl.value = f ? URL.createObjectURL(f) : null
  outUrl.value = null
}

async function loadSample() {
  busy.value = true
  try {
    setFile(await loadSampleImage())
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
  }
}

async function loadFormats() {
  const res = await callWorker({ kind: 'formats', wasmUrl: offlineUrl('magick', 'magick.wasm') })
  if (res.ok && res.kind === 'formats') supported.value = res.formats
}

const pipeline = computed(() =>
  buildPipeline({
    autoOrient: o.autoOrient,
    maxWidth: Number(o.maxWidth) || 0,
    maxHeight: Number(o.maxHeight) || 0,
    cropEnabled: o.cropEnabled,
    cropX: Number(o.cropX) || 0,
    cropY: Number(o.cropY) || 0,
    cropW: Number(o.cropW) || 0,
    cropH: Number(o.cropH) || 0,
    rotate: Number(o.rotate) || 0,
    flip: o.flip,
    flop: o.flop,
    blurEnabled: o.blurEnabled,
    blurRadius: Number(o.blurRadius) || 0,
    blurSigma: Number(o.blurSigma) || 1,
    sharpenEnabled: o.sharpenEnabled,
    sharpenRadius: Number(o.sharpenRadius) || 0,
    sharpenSigma: Number(o.sharpenSigma) || 1,
    modulateEnabled: o.modulateEnabled,
    brightness: Number(o.brightness) || 100,
    saturation: Number(o.saturation) || 100,
    hue: Number(o.hue) || 100,
    quality: o.quality,
  }),
)

const formatOptions = computed(() => {
  const base = IM_FORMATS.map((f) => [f, f] as [string, string])
  if (!supported.value.length) return base
  const extra = supported.value.filter((f) => !IM_FORMATS.includes(f as ImFormat)).slice(0, 40)
  return [...base, ...extra.map((f) => [f, f] as [string, string])]
})

async function run() {
  if (!file.value && mode.value !== 'joinGif') return
  if (mode.value === 'joinGif' && !file.value && !extraFiles.value.length) return
  busy.value = true
  error.value = ''
  status.value = 'loadingWasm'
  try {
    if (!supported.value.length) await loadFormats()
    status.value = 'processing'
    const bytes = await (file.value ?? extraFiles.value[0]!).arrayBuffer()
    const transfer: Transferable[] = [bytes]
    let watermark: { bytes: ArrayBuffer; gravity: string; x: number; y: number } | null = null
    if (wmFile.value) {
      const wb = await wmFile.value.arrayBuffer()
      transfer.push(wb)
      watermark = { bytes: wb, gravity: o.gravity, x: Number(o.wmX) || 0, y: Number(o.wmY) || 0 }
    }
    const extraFrames: ArrayBuffer[] = []
    if (mode.value === 'joinGif') {
      const rest = file.value ? extraFiles.value : extraFiles.value.slice(1)
      for (const f of rest) {
        const b = await f.arrayBuffer()
        extraFrames.push(b)
        transfer.push(b)
      }
    }
    const res = await callWorker(
      {
        kind: 'process',
        wasmUrl: offlineUrl('magick', 'magick.wasm'),
        bytes,
        format: o.format,
        ops: pipeline.value,
        watermark,
        frameIndex: o.frameIndex >= 0 ? o.frameIndex : null,
        mode: mode.value,
        extraFrames,
      },
      transfer,
    )
    if (!res.ok || res.kind !== 'process') throw new Error(!res.ok ? res.error : 'unexpected')
    if (res.frames?.length) {
      downloadBlob(await zipBlobs(res.frames.map((f) => ({ name: f.name, blob: new Blob([f.buffer], { type: f.mime }) }))), 'gif-frames.zip')
      outMeta.value = `${res.frames.length} frames`
      return
    }
    const blob = new Blob([res.buffer], { type: res.mime })
    outBlob.value = blob
    outName.value = withFormatExt(file.value?.name ?? 'output', o.format)
    outMeta.value = res.width && res.height ? `${res.width}×${res.height} · ${formatBytes(blob.size)}` : formatBytes(blob.size)
    statsText.value = res.stats ?? ''
    if (outUrl.value) URL.revokeObjectURL(outUrl.value)
    outUrl.value = URL.createObjectURL(blob)
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
    status.value = ''
  }
}

const tabs: [Tab, string][] = [
  ['basic', 'tabBasic'],
  ['crop', 'tabCrop'],
  ['adjust', 'tabAdjust'],
  ['watermark', 'tabWatermark'],
  ['gif', 'tabGif'],
  ['advanced', 'tabAdvanced'],
]
const gravities = ['Northwest', 'North', 'Northeast', 'West', 'Center', 'East', 'Southwest', 'South', 'Southeast']
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.imagemagick.note') }}</p>
    <FileDropzone accept="image/*,.psd,.pdf,.svg,.heic,.avif" :label="$t('tools.imagemagick.drop')" @file="setFile($event)" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
      <Button size="sm" variant="outline" :disabled="busy" @click="loadFormats">{{ $t('tools.imagemagick.supported') }}</Button>
      <span v-if="file" class="text-muted-foreground text-sm">{{ file.name }} · {{ formatBytes(file.size) }}</span>
      <span class="text-muted-foreground text-xs">{{ $t('tools.imagemagick.pipeline', { n: pipeline.length }) }}</span>
    </div>
    <ModeToggle v-model="tab" :options="tabs.map(([v, k]) => [v, $t(`tools.imagemagick.${k}`)] as [Tab, string])" />

    <div v-if="tab === 'basic'" class="grid gap-3 md:grid-cols-2">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.imagemagick.format') }}</span>
        <ModeToggle v-model="o.format" :options="formatOptions.slice(0, 12)" />
      </div>
      <RangeField v-model="o.quality" :label="$t('tools.imagemagick.quality')" :min="1" :max="100" />
      <Label>{{ $t('tools.imagemagick.maxWidth') }} <Input v-model.number="o.maxWidth" type="number" min="0" class="w-28" /></Label>
      <Label>
        {{ $t('tools.imagemagick.maxHeight') }}
        <Input v-model.number="o.maxHeight" type="number" min="0" class="w-28" />
        <span class="text-muted-foreground ml-2 text-xs">{{ $t('tools.imagemagick.unlimited') }}</span>
      </Label>
      <Label class="flex items-center gap-2"><Switch v-model="o.autoOrient" /> {{ $t('tools.imagemagick.autoOrient') }}</Label>
    </div>

    <div v-else-if="tab === 'crop'" class="grid gap-3 md:grid-cols-2">
      <Label class="flex items-center gap-2"><Switch v-model="o.cropEnabled" /> {{ $t('tools.imagemagick.crop') }}</Label>
      <Label>{{ $t('tools.imagemagick.rotate') }} <Input v-model.number="o.rotate" type="number" class="w-28" /></Label>
      <Label>{{ $t('tools.imagemagick.cropX') }} <Input v-model.number="o.cropX" type="number" class="w-24" :disabled="!o.cropEnabled" /></Label>
      <Label>{{ $t('tools.imagemagick.cropY') }} <Input v-model.number="o.cropY" type="number" class="w-24" :disabled="!o.cropEnabled" /></Label>
      <Label>{{ $t('tools.imagemagick.cropW') }} <Input v-model.number="o.cropW" type="number" class="w-24" :disabled="!o.cropEnabled" /></Label>
      <Label>{{ $t('tools.imagemagick.cropH') }} <Input v-model.number="o.cropH" type="number" class="w-24" :disabled="!o.cropEnabled" /></Label>
      <Label class="flex items-center gap-2"><Switch v-model="o.flip" /> {{ $t('tools.imagemagick.flip') }}</Label>
      <Label class="flex items-center gap-2"><Switch v-model="o.flop" /> {{ $t('tools.imagemagick.flop') }}</Label>
    </div>

    <div v-else-if="tab === 'adjust'" class="grid gap-3 md:grid-cols-2">
      <Label class="flex items-center gap-2"><Switch v-model="o.blurEnabled" /> {{ $t('tools.imagemagick.blur') }}</Label>
      <Label class="flex items-center gap-2"><Switch v-model="o.sharpenEnabled" /> {{ $t('tools.imagemagick.sharpen') }}</Label>
      <Label>{{ $t('tools.imagemagick.radius') }} <Input v-model.number="o.blurRadius" type="number" min="0" class="w-24" :disabled="!o.blurEnabled" /></Label>
      <Label>{{ $t('tools.imagemagick.sigma') }} <Input v-model.number="o.blurSigma" type="number" min="0" step="0.1" class="w-24" :disabled="!o.blurEnabled" /></Label>
      <Label>{{ $t('tools.imagemagick.radius') }} (sharpen) <Input v-model.number="o.sharpenRadius" type="number" min="0" class="w-24" :disabled="!o.sharpenEnabled" /></Label>
      <Label>{{ $t('tools.imagemagick.sigma') }} (sharpen) <Input v-model.number="o.sharpenSigma" type="number" min="0" step="0.1" class="w-24" :disabled="!o.sharpenEnabled" /></Label>
      <Label class="flex items-center gap-2 md:col-span-2"><Switch v-model="o.modulateEnabled" /> {{ $t('tools.imagemagick.modulate') }}</Label>
      <RangeField v-model="o.brightness" :label="$t('tools.imagemagick.brightness')" :min="0" :max="200" />
      <RangeField v-model="o.saturation" :label="$t('tools.imagemagick.saturation')" :min="0" :max="200" />
      <RangeField v-model="o.hue" :label="$t('tools.imagemagick.hue')" :min="0" :max="200" />
    </div>

    <div v-else-if="tab === 'watermark'" class="flex flex-col gap-3">
      <FileDropzone accept="image/*" :label="$t('tools.imagemagick.watermark')" @file="wmFile = $event" />
      <span v-if="wmFile" class="text-muted-foreground text-sm">{{ wmFile.name }}</span>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.imagemagick.gravity') }}</span>
        <ModeToggle v-model="o.gravity" :options="gravities.map((g) => [g, g] as [string, string])" />
      </div>
      <div class="flex flex-wrap gap-3">
        <Label>{{ $t('tools.imagemagick.offsetX') }} <Input v-model.number="o.wmX" type="number" class="w-24" /></Label>
        <Label>{{ $t('tools.imagemagick.offsetY') }} <Input v-model.number="o.wmY" type="number" class="w-24" /></Label>
      </div>
    </div>

    <div v-else-if="tab === 'gif'" class="flex flex-col gap-3">
      <ModeToggle
        v-model="mode"
        :options="[
          ['single', $t('tools.imagemagick.modeSingle')],
          ['splitGif', $t('tools.imagemagick.modeSplit')],
          ['joinGif', $t('tools.imagemagick.modeJoin')],
          ['stats', $t('tools.imagemagick.modeStats')],
        ]"
      />
      <Label>{{ $t('tools.imagemagick.frameIndex') }} <Input v-model.number="o.frameIndex" type="number" min="-1" class="w-28" /></Label>
      <FileDropzone accept="image/*" multiple :label="$t('tools.imagemagick.extraFrames')" @files="extraFiles = $event" />
      <ul v-if="extraFiles.length" class="text-muted-foreground text-xs">
        <li v-for="(f, i) in extraFiles" :key="i">{{ f.name }}</li>
      </ul>
    </div>

    <div v-else class="flex flex-col gap-2">
      <p class="text-muted-foreground text-sm">{{ $t('tools.imagemagick.supported') }}: {{ supported.length || '—' }}</p>
      <pre class="max-h-40 overflow-auto rounded-md border p-2 text-xs">{{ supported.join(', ') || '—' }}</pre>
      <Label>
        {{ $t('tools.imagemagick.format') }} (raw)
        <Input v-model="o.format" class="w-40 font-mono" />
      </Label>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <Button :disabled="busy || (!file && mode !== 'joinGif')" @click="run">
        {{ status === 'loadingWasm' ? $t('tools.imagemagick.loadingWasm') : busy ? $t('common.processing') : $t('tools.imagemagick.run') }}
      </Button>
      <Button v-if="outBlob" variant="outline" @click="downloadBlob(outBlob, outName)"><Download /> {{ $t('common.download') }}</Button>
      <span v-if="outMeta" class="text-sm">{{ outMeta }}</span>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <pre v-if="statsText" class="bg-muted/40 max-h-40 overflow-auto rounded-md border p-2 text-xs">{{ statsText }}</pre>
    <div v-if="previewUrl || outUrl" class="grid gap-3 md:grid-cols-2">
      <div v-if="previewUrl" class="rounded-md border p-2">
        <div class="text-muted-foreground mb-1 text-xs">{{ $t('common.input') }}</div>
        <img :src="previewUrl" alt="" class="max-h-64 max-w-full object-contain" />
      </div>
      <div v-if="outUrl" class="rounded-md border p-2">
        <div class="text-muted-foreground mb-1 text-xs">{{ $t('common.output') }}</div>
        <img :src="outUrl" alt="" class="max-h-64 max-w-full object-contain" />
      </div>
    </div>
  </div>
</template>
