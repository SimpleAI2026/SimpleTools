<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { defaultFormat, fitAspect, outputFilename, resizeImage, scaleByPercent, type OutputFormat, type Size } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

const { t } = useI18n()
const file = ref<File | null>(null)
const previewUrl = ref('')
const original = ref<Size | null>(null)
const size = ref<Size>({ width: 0, height: 0 })
const lock = ref(true)
const format = ref<OutputFormat>('image/png')
const quality = ref([92])
const error = ref('')
const busy = ref(false)
const lastOutput = ref<{ size: number; dims: Size } | null>(null)

function revoke() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = ''
}
onBeforeUnmount(revoke)

async function loadSample() {
  busy.value = true
  try {
    await onFile(await loadSampleImage())
  } finally {
    busy.value = false
  }
}

async function onFile(f: File) {
  error.value = ''
  lastOutput.value = null
  if (!f.type.startsWith('image/')) {
    error.value = t('tools.image-resizer.notImage')
    return
  }
  try {
    const bmp = await createImageBitmap(f)
    original.value = { width: bmp.width, height: bmp.height }
    bmp.close()
  } catch {
    error.value = t('tools.image-resizer.failed')
    return
  }
  revoke()
  file.value = f
  previewUrl.value = URL.createObjectURL(f)
  size.value = { ...original.value }
  format.value = defaultFormat(f.type)
}

function setDim(which: 'width' | 'height', raw: string | number) {
  const v = Number(raw)
  if (!original.value || !Number.isFinite(v)) return
  size.value = lock.value ? fitAspect(original.value, which, v) : { ...size.value, [which]: Math.max(1, Math.round(v)) }
}
function setPercent(p: number) {
  if (original.value) size.value = scaleByPercent(original.value, p)
}

const lossy = computed(() => format.value !== 'image/png')

async function run() {
  if (!file.value) return
  busy.value = true
  error.value = ''
  try {
    const blob = await resizeImage(file.value, size.value, format.value, (quality.value[0] ?? 92) / 100)
    lastOutput.value = { size: blob.size, dims: { ...size.value } }
    downloadBlob(blob, outputFilename(file.value.name, size.value, format.value))
  } catch {
    error.value = t('tools.image-resizer.failed')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="image/*" :label="$t('tools.image-resizer.drop')" @file="onFile" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <div v-if="file && original" class="grid gap-6 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <img :src="previewUrl" alt="" class="max-h-80 rounded-md border object-contain" />
        <p class="text-muted-foreground text-sm">
          {{ $t('tools.image-resizer.original') }}: {{ original.width }}×{{ original.height }} · {{ formatBytes(file.size) }}
        </p>
        <p v-if="lastOutput" class="text-sm">
          {{ $t('tools.image-resizer.result') }}: {{ lastOutput.dims.width }}×{{ lastOutput.dims.height }} · {{ formatBytes(lastOutput.size) }}
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="flex flex-col gap-2">
            <Label for="w">{{ $t('tools.image-resizer.width') }}</Label>
            <Input id="w" type="number" min="1" :model-value="size.width" @update:model-value="setDim('width', $event ?? 0)" />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="h">{{ $t('tools.image-resizer.height') }}</Label>
            <Input id="h" type="number" min="1" :model-value="size.height" @update:model-value="setDim('height', $event ?? 0)" />
          </div>
        </div>
        <Label><Switch v-model="lock" /> {{ $t('tools.image-resizer.lockRatio') }}</Label>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ $t('tools.image-resizer.percent') }}</span>
          <Button v-for="p in [25, 50, 75, 100, 200]" :key="p" size="sm" variant="outline" @click="setPercent(p)">{{ p }}%</Button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ $t('tools.image-resizer.format') }}</span>
          <Button
            v-for="f in ['image/png', 'image/jpeg', 'image/webp'] as const"
            :key="f"
            size="sm"
            :variant="format === f ? 'secondary' : 'ghost'"
            @click="format = f"
          >
            {{ f.split('/')[1]?.toUpperCase() }}
          </Button>
        </div>
        <div v-if="lossy" class="flex flex-col gap-2">
          <Label>{{ $t('tools.image-resizer.quality') }}: {{ quality[0] }}</Label>
          <Slider v-model="quality" :min="10" :max="100" />
        </div>
        <Button :disabled="busy" @click="run">{{ $t('tools.image-resizer.resize') }}</Button>
      </div>
    </div>
  </div>
</template>
