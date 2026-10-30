<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { zipBlobs } from '@/lib/zip'
import { listHighlightStyles, listPandocFormats, runPandoc } from './convert'
import { FALLBACK_FORMATS, guessFormat, SAMPLE_BIB, SAMPLE_MARKDOWN } from './logic'

const files = ref<File[]>([])
const text = ref(SAMPLE_MARKDOWN)
const from = ref('markdown')
const to = ref('html')
const inputFormats = ref<string[]>(FALLBACK_FORMATS.map((f) => f.id))
const outputFormats = ref<string[]>(FALLBACK_FORMATS.map((f) => f.id))
const highlightStyles = ref<string[]>([])
const standalone = ref(true)
const toc = ref(false)
const numberSections = ref(false)
const citeproc = ref(false)
const extractMedia = ref(false)
const embedResources = ref(false)
const showAdvanced = ref(false)
const template = ref('')
const css = ref('')
const fromExt = ref('')
const toExt = ref('')
const highlightStyle = ref('')
const bibFile = ref<File | null>(null)
const cslFile = ref<File | null>(null)
const luaFile = ref<File | null>(null)
const busy = ref(false)
const status = ref('')
const error = ref('')
const warnings = ref('')
const outText = ref('')
const outBlob = ref<Blob | null>(null)
const outName = ref('')
const mediaFiles = ref<{ name: string; blob: Blob }[]>([])

onMounted(() => {
  void refreshFormats()
})

async function refreshFormats() {
  busy.value = true
  status.value = 'loadingWasm'
  try {
    const { input, output } = await listPandocFormats()
    if (input.length) inputFormats.value = input
    if (output.length) outputFormats.value = output
    highlightStyles.value = await listHighlightStyles()
  } catch (e) {
    // keep fallbacks
    console.warn(e)
  } finally {
    busy.value = false
    status.value = ''
  }
}

function onFiles(fs: File[]) {
  files.value = fs
  if (fs[0]) from.value = guessFormat(fs[0].name)
  error.value = ''
  outBlob.value = null
  outText.value = ''
}

const fromOptions = computed(() => inputFormats.value.slice(0, 24).map((f) => [f, f] as [string, string]))
const toOptions = computed(() => outputFormats.value.slice(0, 24).map((f) => [f, f] as [string, string]))

async function run() {
  busy.value = true
  error.value = ''
  warnings.value = ''
  status.value = 'loadingWasm'
  outBlob.value = null
  outText.value = ''
  mediaFiles.value = []
  try {
    status.value = 'processing'
    const res = await runPandoc({
      from: from.value,
      to: to.value,
      files: files.value.length ? files.value : undefined,
      text: files.value.length ? undefined : text.value,
      standalone: standalone.value,
      toc: toc.value,
      numberSections: numberSections.value,
      template: template.value || undefined,
      css: css.value || undefined,
      bibliography: bibFile.value,
      csl: cslFile.value,
      citeproc: citeproc.value,
      highlightStyle: highlightStyle.value || undefined,
      extractMedia: extractMedia.value,
      embedResources: embedResources.value,
      luaFilter: luaFile.value,
      fromExtensions: fromExt.value || undefined,
      toExtensions: toExt.value || undefined,
    })
    outBlob.value = res.blob
    outName.value = res.filename
    outText.value = res.text ?? ''
    warnings.value = res.warnings
    mediaFiles.value = res.media ?? []
  } catch (e) {
    error.value = String(e)
  } finally {
    busy.value = false
    status.value = ''
  }
}

function loadBibSample() {
  bibFile.value = new File([SAMPLE_BIB], 'refs.bib', { type: 'text/plain' })
  citeproc.value = true
}

async function downloadMedia() {
  if (!mediaFiles.value.length) return
  downloadBlob(await zipBlobs(mediaFiles.value), 'pandoc-media.zip')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.pandoc.note') }}</p>
    <p class="text-amber-700 dark:text-amber-400 text-sm">{{ $t('tools.pandoc.pdfWarning') }}</p>
    <FileDropzone
      accept=".md,.markdown,.html,.htm,.docx,.odt,.epub,.rst,.tex,.txt,.adoc,.org,.rtf,.bib,.csl,text/*,application/*"
      multiple
      :label="$t('tools.pandoc.drop')"
      @files="onFiles"
    />
    <div v-if="files.length" class="text-sm">
      <div v-for="(f, i) in files" :key="i" class="text-muted-foreground">{{ f.name }} · {{ formatBytes(f.size) }}</div>
      <Button size="sm" variant="ghost" @click="files = []">{{ $t('common.clear') }}</Button>
    </div>
    <div v-else class="flex flex-col gap-2">
      <Label>{{ $t('tools.pandoc.paste') }}</Label>
      <Textarea v-model="text" rows="10" class="font-mono" />
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="refreshFormats">{{ $t('tools.pandoc.refreshFormats') }}</Button>
    </div>
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.pandoc.from') }}</span>
        <ModeToggle v-model="from" :options="fromOptions" />
        <Input v-model="from" class="w-36 font-mono" />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.pandoc.to') }}</span>
        <ModeToggle v-model="to" :options="toOptions" />
        <Input v-model="to" class="w-36 font-mono" />
      </div>
      <div class="flex flex-wrap gap-4">
        <Label class="flex items-center gap-2"><Switch v-model="standalone" /> {{ $t('tools.pandoc.standalone') }}</Label>
        <Label class="flex items-center gap-2"><Switch v-model="toc" /> {{ $t('tools.pandoc.toc') }}</Label>
        <Label class="flex items-center gap-2"><Switch v-model="numberSections" /> {{ $t('tools.pandoc.numberSections') }}</Label>
        <Label class="flex items-center gap-2"><Switch v-model="showAdvanced" /> {{ $t('tools.pandoc.advanced') }}</Label>
      </div>
    </div>
    <div v-if="showAdvanced" class="flex flex-col gap-3 rounded-md border p-3">
      <Label>{{ $t('tools.pandoc.fromExt') }} <Input v-model="fromExt" class="font-mono" placeholder="+smart-raw_html" /></Label>
      <Label>{{ $t('tools.pandoc.toExt') }} <Input v-model="toExt" class="font-mono" /></Label>
      <Label>{{ $t('tools.pandoc.template') }} <Textarea v-model="template" rows="4" class="font-mono text-xs" /></Label>
      <Label>{{ $t('tools.pandoc.css') }} <Textarea v-model="css" rows="3" class="font-mono text-xs" /></Label>
      <div class="flex flex-wrap gap-3">
        <Label class="flex items-center gap-2"><Switch v-model="citeproc" /> {{ $t('tools.pandoc.citeproc') }}</Label>
        <Button size="sm" variant="outline" @click="loadBibSample">sample .bib</Button>
        <Label class="flex items-center gap-2"><Switch v-model="extractMedia" /> {{ $t('tools.pandoc.extractMedia') }}</Label>
        <Label class="flex items-center gap-2"><Switch v-model="embedResources" /> {{ $t('tools.pandoc.embedResources') }}</Label>
      </div>
      <FileDropzone accept=".bib,text/plain" :label="$t('tools.pandoc.bibliography')" @file="bibFile = $event" />
      <span v-if="bibFile" class="text-muted-foreground text-xs">{{ bibFile.name }}</span>
      <FileDropzone accept=".csl,text/xml,application/xml" :label="$t('tools.pandoc.csl')" @file="cslFile = $event" />
      <span v-if="cslFile" class="text-muted-foreground text-xs">{{ cslFile.name }}</span>
      <FileDropzone accept=".lua,text/plain" :label="$t('tools.pandoc.luaFilter')" @file="luaFile = $event" />
      <span v-if="luaFile" class="text-muted-foreground text-xs">{{ luaFile.name }}</span>
      <Label v-if="highlightStyles.length">
        {{ $t('tools.pandoc.highlight') }}
        <select v-model="highlightStyle" class="border-input bg-background h-9 rounded-md border px-2 text-sm">
          <option value="">—</option>
          <option v-for="s in highlightStyles" :key="s" :value="s">{{ s }}</option>
        </select>
      </Label>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button :disabled="busy || (!files.length && !text.trim())" @click="run">
        {{ status === 'loadingWasm' ? $t('tools.pandoc.loadingWasm') : busy ? $t('common.processing') : $t('tools.pandoc.run') }}
      </Button>
      <Button v-if="outBlob" variant="outline" @click="downloadBlob(outBlob, outName)"><Download /> {{ $t('common.download') }}</Button>
      <Button v-if="mediaFiles.length" variant="outline" @click="downloadMedia">{{ $t('tools.pandoc.mediaZip') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <p v-if="warnings" class="text-muted-foreground whitespace-pre-wrap text-xs">{{ warnings }}</p>
    <Textarea v-if="outText" :model-value="outText" readonly rows="14" class="font-mono text-xs" />
  </div>
</template>
