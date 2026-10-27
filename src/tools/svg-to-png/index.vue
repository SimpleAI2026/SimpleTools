<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { canvasToBlob, makeCanvas, RASTER_EXT, type RasterFormat } from '@/lib/canvas'
import { downloadBlob } from '@/lib/download'
import { prepareSvg, svgSize } from './logic'

const { t } = useI18n()
const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="480" height="120">
  <rect width="480" height="120" rx="24" fill="#6366f1"/>
  <text x="240" y="72" text-anchor="middle" font-family="system-ui,sans-serif" font-size="42" font-weight="700" fill="#fff">SimpleTools</text>
</svg>`
const code = ref(SAMPLE)
const name = ref('image')
const scale = ref(4)
const width = ref(256)
const height = ref(256)
const transparent = ref(true)
const bg = ref('#ffffff')
const format = ref<RasterFormat>('image/png')
const error = ref('')
const intrinsic = computed(() => {
  try {
    return svgSize(code.value)
  } catch {
    return null
  }
})
watch([intrinsic, scale], () => {
  if (!intrinsic.value) return
  width.value = Math.round(intrinsic.value.width * scale.value)
  height.value = Math.round(intrinsic.value.height * scale.value)
}, { immediate: true })
// <img> rendering keeps any scripts inside the SVG inert
const preview = computed(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(code.value)}`)

function loadSample() {
  code.value = SAMPLE
  name.value = 'simpletools'
}

async function onFile(f: File) {
  code.value = await f.text()
  name.value = f.name.replace(/\.svg$/i, '')
}
async function convert() {
  error.value = ''
  try {
    const w = Math.max(1, Math.min(16384, Number(width.value) || 1))
    const h = Math.max(1, Math.min(16384, Number(height.value) || 1))
    const url = URL.createObjectURL(new Blob([prepareSvg(code.value, w, h)], { type: 'image/svg+xml' }))
    const img = new Image()
    await new Promise<void>((res, rej) => {
      img.onload = () => res()
      img.onerror = () => rej(new Error('load'))
      img.src = url
    }).finally(() => setTimeout(() => URL.revokeObjectURL(url), 0))
    const [c, ctx] = makeCanvas(w, h)
    if (!transparent.value || format.value === 'image/jpeg') {
      ctx.fillStyle = bg.value
      ctx.fillRect(0, 0, w, h)
    }
    ctx.drawImage(img, 0, 0, w, h)
    downloadBlob(await canvasToBlob(c, format.value, 0.92), `${name.value}.${RASTER_EXT[format.value]}`)
  } catch {
    error.value = t('tools.svg-to-png.failed')
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept=".svg,image/svg+xml" :label="$t('tools.svg-to-png.drop')" @file="onFile" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.svg-to-png.code') }}</Label>
        <Textarea v-model="code" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" spellcheck="false" data-testid="tool-input" />
      </div>
      <div class="flex min-h-[500px] items-center justify-center rounded-md border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px] p-4 min-h-[500px] h-[500px]">
        <img :src="preview" :alt="$t('common.preview')" class="max-h-64 max-w-full" />
      </div>
    </div>
    <ErrorAlert v-if="!intrinsic && code.trim()" :message="$t('tools.svg-to-png.failed')" />
    <div class="flex flex-wrap items-center gap-3">
      <span v-if="intrinsic" class="text-muted-foreground text-sm">{{ $t('tools.svg-to-png.size', { w: intrinsic.width, h: intrinsic.height }) }}</span>
      <span class="text-sm">{{ $t('tools.svg-to-png.scale') }}</span>
      <ModeToggle v-model="scale" :options="[[1, '1×'], [2, '2×'], [4, '4×'], [8, '8×']]" />
      <Label>{{ $t('tools.svg-to-png.width') }} <Input v-model.number="width" type="number" class="w-24" /></Label>
      <Label>{{ $t('tools.svg-to-png.height') }} <Input v-model.number="height" type="number" class="w-24" /></Label>
      <ModeToggle v-model="format" :options="[['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']]" />
      <Label><Switch v-model="transparent" /> {{ $t('tools.svg-to-png.transparent') }}</Label>
      <input v-if="!transparent || format === 'image/jpeg'" v-model="bg" type="color" class="h-8 w-10 rounded border" :aria-label="$t('tools.svg-to-png.background')" />
      <Button :disabled="!intrinsic" @click="convert"><Download /> {{ $t('tools.svg-to-png.convert') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
  </div>
</template>
