<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadText, downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { loadSampleImage } from '@/lib/sampleImage'
import { zipBlobs } from '@/lib/zip'
import { OCR_LANGS, PSM_OPTIONS, parseRoi, type OcrLangId, type OutputMode, type WordBox } from './logic'
import { recognizeImage, terminateOcrWorker } from './ocr'

const { locale } = useI18n()
const files = ref<File[]>([])
const previewUrl = ref<string | null>(null)
const text = ref('')
const confidence = ref(0)
const words = ref<WordBox[]>([])
const batchOut = ref<{ name: string; text: string }[]>([])
const lang = ref<OcrLangId>('eng+chi_sim')
const psm = ref('3')
const mode = ref<OutputMode>('text')
const overlay = ref(true)
const showAdvanced = ref(false)
const busy = ref(false)
const progress = ref(0)
const status = ref('')
const error = ref('')
const canvas = ref<HTMLCanvasElement | null>(null)
const roi = reactive({ left: 0, top: 0, width: 0, height: 0 })
const whitelist = ref('')
const blacklist = ref('')

onBeforeUnmount(() => {
  void terminateOcrWorker()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function setFiles(fs: File[]) {
  files.value = fs
  text.value = ''
  words.value = []
  batchOut.value = []
  confidence.value = 0
  error.value = ''
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = fs[0] ? URL.createObjectURL(fs[0]) : null
}

async function loadSample() {
  busy.value = true
  try {
    setFiles([await loadSampleImage()])
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
  }
}

async function drawOverlay() {
  const c = canvas.value
  const f = files.value[0]
  if (!c || !f || !overlay.value) return
  const bmp = await createImageBitmap(f)
  c.width = bmp.width
  c.height = bmp.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(bmp, 0, 0)
  bmp.close()
  ctx.strokeStyle = 'rgba(0,180,0,0.85)'
  ctx.lineWidth = 2
  ctx.font = '12px monospace'
  ctx.fillStyle = 'rgba(0,120,0,0.85)'
  for (const w of words.value) {
    const { x0, y0, x1, y1 } = w.bbox
    ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
    ctx.fillText(w.text, x0, Math.max(10, y0 - 2))
  }
  if (roi.width > 0 && roi.height > 0) {
    ctx.strokeStyle = 'rgba(0,100,255,0.9)'
    ctx.strokeRect(roi.left, roi.top, roi.width, roi.height)
  }
}

watch([words, previewUrl, overlay], () => {
  void drawOverlay()
})

async function run() {
  if (!files.value.length) return
  busy.value = true
  error.value = ''
  progress.value = 0
  status.value = 'loadingWasm'
  batchOut.value = []
  try {
    const rectangle = parseRoi(roi.left, roi.top, roi.width, roi.height)
    if (files.value.length === 1) {
      const res = await recognizeImage({
        image: files.value[0]!,
        lang: lang.value,
        psm: psm.value,
        whitelist: whitelist.value || undefined,
        blacklist: blacklist.value || undefined,
        roi: rectangle,
        mode: mode.value,
        onProgress: (p) => {
          status.value = 'processing'
          progress.value = p
        },
      })
      text.value = res.text
      confidence.value = res.confidence
      words.value = res.words
      await drawOverlay()
    } else {
      for (const [i, f] of files.value.entries()) {
        status.value = 'processing'
        progress.value = Math.round(((i + 1) / files.value.length) * 100)
        const res = await recognizeImage({
          image: f,
          lang: lang.value,
          psm: psm.value,
          whitelist: whitelist.value || undefined,
          blacklist: blacklist.value || undefined,
          mode: mode.value,
        })
        batchOut.value.push({ name: f.name.replace(/\.[^.]+$/, '') + '.txt', text: res.text })
      }
      text.value = batchOut.value.map((b) => `===== ${b.name} =====\n${b.text}`).join('\n\n')
    }
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
    status.value = ''
  }
}

async function downloadBatch() {
  if (!batchOut.value.length) return
  downloadBlob(await zipBlobs(batchOut.value.map((b) => ({ name: b.name, blob: new Blob([b.text], { type: 'text/plain' }) }))), 'ocr-batch.zip')
}

const langOptions = computed(() =>
  OCR_LANGS.map((l) => [l.id, locale.value === 'zh-CN' ? l.labelZh : l.labelEn] as [OcrLangId, string]),
)
const psmOptions = computed(() =>
  PSM_OPTIONS.map((p) => [p.id, `${p.id}: ${locale.value === 'zh-CN' ? p.labelZh : p.labelEn}`] as [string, string]),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.image-ocr.note') }}</p>
    <FileDropzone accept="image/*" multiple :label="$t('tools.image-ocr.drop')" @files="setFiles" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
      <span v-if="files.length" class="text-muted-foreground text-sm">{{ files.length }} file(s) · {{ formatBytes(files.reduce((s, f) => s + f.size, 0)) }}</span>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.image-ocr.lang') }}</span>
      <ModeToggle v-model="lang" :options="langOptions" />
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.image-ocr.mode') }}</span>
      <ModeToggle
        v-model="mode"
        :options="[
          ['text', $t('tools.image-ocr.modeText')],
          ['blocks', $t('tools.image-ocr.modeBlocks')],
          ['hocr', $t('tools.image-ocr.modeHocr')],
          ['tsv', $t('tools.image-ocr.modeTsv')],
          ['box', $t('tools.image-ocr.modeBox')],
        ]"
      />
      <Label class="flex items-center gap-2"><Switch v-model="overlay" /> {{ $t('tools.image-ocr.overlay') }}</Label>
      <Label class="flex items-center gap-2"><Switch v-model="showAdvanced" /> {{ $t('tools.image-ocr.advanced') }}</Label>
    </div>
    <template v-if="showAdvanced">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.image-ocr.psm') }}</span>
        <ModeToggle v-model="psm" :options="psmOptions" />
      </div>
      <div class="grid gap-2 md:grid-cols-2">
        <Label>{{ $t('tools.image-ocr.whitelist') }} <Input v-model="whitelist" class="font-mono" /></Label>
        <Label>{{ $t('tools.image-ocr.blacklist') }} <Input v-model="blacklist" class="font-mono" /></Label>
      </div>
      <div class="flex flex-wrap items-end gap-2">
        <span class="text-sm">{{ $t('tools.image-ocr.roi') }}</span>
        <Label>{{ $t('tools.image-ocr.left') }} <Input v-model.number="roi.left" type="number" class="w-20" /></Label>
        <Label>{{ $t('tools.image-ocr.top') }} <Input v-model.number="roi.top" type="number" class="w-20" /></Label>
        <Label>{{ $t('tools.image-ocr.width') }} <Input v-model.number="roi.width" type="number" class="w-20" /></Label>
        <Label>{{ $t('tools.image-ocr.height') }} <Input v-model.number="roi.height" type="number" class="w-20" /></Label>
      </div>
    </template>
    <div class="flex flex-wrap items-center gap-2">
      <Button :disabled="!files.length || busy" @click="run">
        {{ status === 'loadingWasm' ? $t('tools.image-ocr.loadingWasm') : busy ? $t('common.processing') : $t('tools.image-ocr.run') }}
      </Button>
      <span v-if="busy && progress" class="text-sm">{{ $t('tools.image-ocr.progress', { p: progress }) }}</span>
      <span v-if="text && confidence" class="text-muted-foreground text-sm">{{ $t('tools.image-ocr.confidence', { n: confidence }) }}</span>
      <Button v-if="text" size="sm" variant="outline" @click="downloadText(text, 'ocr.txt')"><Download /> {{ $t('common.download') }}</Button>
      <Button v-if="batchOut.length" size="sm" variant="outline" @click="downloadBatch">{{ $t('tools.image-ocr.batch') }}</Button>
      <CopyButton v-if="text" :text="text" />
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <canvas v-if="previewUrl && overlay" ref="canvas" class="max-h-72 max-w-full rounded-md border" />
    <img v-else-if="previewUrl" :src="previewUrl" alt="" class="max-h-48 max-w-full object-contain" />
    <Textarea v-if="text" :model-value="text" readonly rows="12" class="font-mono text-xs" />
  </div>
</template>
