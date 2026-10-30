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
import { downloadBlob, downloadText } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { terminateFfmpeg, runFfmpeg } from './engine'
import { FF_FORMATS, parseExtraArgs, parseSeconds, type FfFormatId, type FfMode, type FfQuality } from './logic'

const files = ref<File[]>([])
const subFile = ref<File | null>(null)
const wmFile = ref<File | null>(null)
const fontFile = ref<File | null>(null)
const outBlob = ref<Blob | null>(null)
const outName = ref('')
const outUrl = ref<string | null>(null)
const busy = ref(false)
const status = ref('')
const progress = ref(0)
const error = ref('')
const logText = ref('')
const showAdvanced = ref(false)
const o = reactive({
  format: 'mp4' as FfFormatId,
  quality: 'medium' as FfQuality,
  mode: 'convert' as FfMode,
  start: '',
  end: '',
  width: 0,
  height: 0,
  fps: 0,
  vbitrate: '',
  abitrate: '',
  vf: '',
  extra: '',
  watermarkXY: '10:10',
  drawtext: '',
})

onBeforeUnmount(() => {
  void terminateFfmpeg()
  if (outUrl.value) URL.revokeObjectURL(outUrl.value)
})

function setFiles(fs: File[]) {
  files.value = fs
  outBlob.value = null
  error.value = ''
  logText.value = ''
  if (outUrl.value) URL.revokeObjectURL(outUrl.value)
  outUrl.value = null
}

async function run() {
  if (!files.value.length) return
  busy.value = true
  error.value = ''
  progress.value = 0
  logText.value = ''
  status.value = 'loadingWasm'
  try {
    const res = await runFfmpeg({
      file: files.value[0]!,
      files: files.value,
      format: o.format,
      quality: o.quality,
      mode: o.mode,
      start: parseSeconds(o.start),
      end: parseSeconds(o.end),
      width: Number(o.width) || undefined,
      height: Number(o.height) || undefined,
      fps: Number(o.fps) || undefined,
      videoBitrate: o.vbitrate || undefined,
      audioBitrate: o.abitrate || undefined,
      vf: o.vf || undefined,
      extraArgs: o.extra ? parseExtraArgs(o.extra) : undefined,
      subtitle: subFile.value,
      watermark: wmFile.value,
      watermarkXY: o.watermarkXY,
      drawtext: o.drawtext || undefined,
      font: fontFile.value,
      onProgress: (p) => {
        status.value = 'processing'
        progress.value = p
      },
      onLog: (line) => {
        logText.value += (logText.value ? '\n' : '') + line
      },
    })
    outBlob.value = res.blob
    outName.value = res.filename
    if (res.log) logText.value = res.log
    if (outUrl.value) URL.revokeObjectURL(outUrl.value)
    outUrl.value = URL.createObjectURL(res.blob)
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
    status.value = ''
  }
}

const formatOptions = computed(() => FF_FORMATS.map((f) => [f.id, f.label] as [FfFormatId, string]))
const isVideoOut = computed(() => {
  if (o.mode === 'frames' || o.mode === 'probe' || o.mode === 'extractAudio') return false
  const f = FF_FORMATS.find((x) => x.id === o.format)
  return f?.kind === 'video' && o.format !== 'gif'
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.ffmpeg.note') }}</p>
    <p class="text-amber-700 dark:text-amber-400 text-sm">{{ $t('tools.ffmpeg.gpl') }}</p>
    <FileDropzone accept="audio/*,video/*,.mp4,.webm,.mkv,.mov,.avi,.mp3,.wav,.aac,.ogg,.flac,.m4a,.srt,.ass" multiple :label="$t('tools.ffmpeg.drop')" @files="setFiles" />
    <div v-if="files.length" class="text-muted-foreground text-sm">
      <div v-for="(f, i) in files" :key="i">{{ f.name }} · {{ formatBytes(f.size) }}</div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.ffmpeg.mode') }}</span>
      <ModeToggle
        v-model="o.mode"
        :options="[
          ['convert', $t('tools.ffmpeg.modeConvert')],
          ['extractAudio', $t('tools.ffmpeg.modeExtractAudio')],
          ['stripAudio', $t('tools.ffmpeg.modeStripAudio')],
          ['concat', $t('tools.ffmpeg.modeConcat')],
          ['frames', $t('tools.ffmpeg.modeFrames')],
          ['probe', $t('tools.ffmpeg.modeProbe')],
        ]"
      />
    </div>
    <div v-if="o.mode !== 'probe'" class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.ffmpeg.format') }}</span>
      <ModeToggle v-model="o.format" :options="formatOptions" />
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.ffmpeg.quality') }}</span>
      <ModeToggle
        v-model="o.quality"
        :options="[
          ['low', $t('tools.ffmpeg.qualityLow')],
          ['medium', $t('tools.ffmpeg.qualityMedium')],
          ['high', $t('tools.ffmpeg.qualityHigh')],
        ]"
      />
      <Label class="flex items-center gap-2"><Switch v-model="showAdvanced" /> {{ $t('tools.ffmpeg.advanced') }}</Label>
    </div>
    <div class="flex flex-wrap items-end gap-3">
      <span class="text-sm">{{ $t('tools.ffmpeg.trim') }}</span>
      <Label>{{ $t('tools.ffmpeg.start') }} <Input v-model="o.start" type="number" min="0" step="0.1" class="w-28" /></Label>
      <Label>{{ $t('tools.ffmpeg.end') }} <Input v-model="o.end" type="number" min="0" step="0.1" class="w-28" /></Label>
      <Label>{{ $t('tools.ffmpeg.width') }} <Input v-model.number="o.width" type="number" min="0" class="w-24" /></Label>
      <Label>{{ $t('tools.ffmpeg.height') }} <Input v-model.number="o.height" type="number" min="0" class="w-24" /></Label>
      <Label>{{ $t('tools.ffmpeg.fps') }} <Input v-model.number="o.fps" type="number" min="0" class="w-24" /></Label>
    </div>
    <div class="flex flex-wrap gap-3">
      <Label>{{ $t('tools.ffmpeg.vbitrate') }} <Input v-model="o.vbitrate" class="w-28 font-mono" placeholder="2M" /></Label>
      <Label>{{ $t('tools.ffmpeg.abitrate') }} <Input v-model="o.abitrate" class="w-28 font-mono" placeholder="128k" /></Label>
    </div>
    <template v-if="showAdvanced">
      <p class="text-muted-foreground text-xs">{{ $t('tools.ffmpeg.extraWarn') }}</p>
      <Label>{{ $t('tools.ffmpeg.vf') }} <Input v-model="o.vf" class="font-mono" placeholder="eq=brightness=0.06" /></Label>
      <Label>{{ $t('tools.ffmpeg.extra') }} <Input v-model="o.extra" class="font-mono" placeholder="-an -sn" /></Label>
      <FileDropzone accept=".srt,.ass,.vtt,text/plain" :label="$t('tools.ffmpeg.subtitle')" @file="subFile = $event" />
      <span v-if="subFile" class="text-muted-foreground text-xs">{{ subFile.name }}</span>
      <FileDropzone accept="image/*" :label="$t('tools.ffmpeg.watermark')" @file="wmFile = $event" />
      <Label>{{ $t('tools.ffmpeg.watermarkXY') }} <Input v-model="o.watermarkXY" class="w-32 font-mono" /></Label>
      <Label>{{ $t('tools.ffmpeg.drawtext') }} <Input v-model="o.drawtext" /></Label>
      <FileDropzone accept=".ttf,.otf,.woff" :label="$t('tools.ffmpeg.font')" @file="fontFile = $event" />
    </template>
    <div class="flex flex-wrap items-center gap-2">
      <Button :disabled="!files.length || busy" @click="run">
        {{ status === 'loadingWasm' ? $t('tools.ffmpeg.loadingWasm') : busy ? $t('common.processing') : $t('tools.ffmpeg.run') }}
      </Button>
      <span v-if="busy && progress" class="text-sm">{{ $t('tools.ffmpeg.progress', { p: progress }) }}</span>
      <Button v-if="outBlob" variant="outline" @click="o.mode === 'probe' ? downloadText(logText, outName) : downloadBlob(outBlob, outName)">
        <Download /> {{ $t('common.download') }}
      </Button>
      <span v-if="outBlob && o.mode !== 'probe'" class="text-muted-foreground text-sm">{{ formatBytes(outBlob.size) }}</span>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <video v-if="outUrl && isVideoOut" :src="outUrl" controls class="max-h-72 w-full rounded-md border bg-black" />
    <audio v-else-if="outUrl && (o.mode === 'extractAudio' || ['mp3','aac','wav','ogg'].includes(o.format))" :src="outUrl" controls class="w-full" />
    <img v-else-if="outUrl && (o.mode === 'frames' || o.format === 'gif')" :src="outUrl" alt="" class="max-h-72 max-w-full rounded-md border object-contain" />
    <details v-if="logText" class="text-muted-foreground text-xs" open>
      <summary>{{ $t('tools.ffmpeg.log') }}</summary>
      <pre class="mt-2 max-h-56 overflow-auto whitespace-pre-wrap font-mono">{{ logText }}</pre>
    </details>
  </div>
</template>
