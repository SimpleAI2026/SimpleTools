<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download, Search } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import PdfInput from '@/components/shared/PdfInput.vue'
import PdfPageCanvas from '@/components/shared/PdfPageCanvas.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { downloadBlob } from '@/lib/download'
import { parsePageRanges, pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { canvasRedactor, collectMatches, PRESETS, redactPdf, type Match } from './logic'

const { file, bytes, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const terms = ref('')
const presets = ref<string[]>(['email'])
const range = ref('')
const o = reactive({ regex: false, caseSensitive: false, wholeWord: false, padding: 1.5 })
const dpi = ref(200)
const matches = ref<Match[] | null>(null)
const enabled = ref<boolean[]>([])
const previewPage = ref(1)
const chosen = computed(() => (matches.value ?? []).filter((_, i) => enabled.value[i]))
function toggle(k: string) {
  presets.value = presets.value.includes(k) ? presets.value.filter((p) => p !== k) : [...presets.value, k]
}
async function find() {
  if (!doc.value) return
  busy.value = true
  error.value = ''
  try {
    matches.value = await collectMatches(doc.value, parsePageRanges(range.value, numPages.value), terms.value.split('\n'), presets.value, o)
    enabled.value = matches.value.map(() => true)
    previewPage.value = matches.value[0]?.page ?? 1
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
async function run() {
  if (!bytes.value || !doc.value) return
  busy.value = true
  try {
    downloadBlob(pdfBlob(await redactPdf(bytes.value, chosen.value, canvasRedactor(doc.value, dpi.value))), `${baseName()}-redacted.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="doc">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label>{{ $t('tools.pdf-auto-redact.terms') }}</Label>
          <Textarea v-model="terms" rows="5" class="font-mono h-auto" />
          <div class="flex flex-wrap gap-3 text-sm">
            <Label><Switch v-model="o.regex" /> {{ $t('tools.pdf-auto-redact.regex') }}</Label>
            <Label><Switch v-model="o.caseSensitive" /> {{ $t('tools.pdf-auto-redact.caseSensitive') }}</Label>
            <Label><Switch v-model="o.wholeWord" /> {{ $t('tools.pdf-auto-redact.wholeWord') }}</Label>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <Label>{{ $t('tools.pdf-auto-redact.presets') }}</Label>
          <div class="flex flex-wrap gap-2">
            <Button v-for="k in Object.keys(PRESETS)" :key="k" size="sm" :variant="presets.includes(k) ? 'default' : 'outline'" @click="toggle(k)">{{ $t(`tools.pdf-auto-redact.p_${k}`) }}</Button>
          </div>
          <Label>{{ $t('common.pageRange') }} <Input v-model="range" class="w-40" :placeholder="$t('common.allPages')" /></Label>
          <RangeField v-model="dpi" :label="$t('tools.pdf-auto-redact.dpi')" :min="72" :max="400" :step="4" unit="dpi" />
        </div>
      </div>
      <div><Button :disabled="busy" @click="find"><Search /> {{ $t('tools.pdf-auto-redact.find') }}</Button></div>
      <template v-if="matches">
        <p class="text-sm">{{ matches.length ? $t('tools.pdf-auto-redact.found', { n: chosen.length }) : $t('tools.pdf-auto-redact.none') }}</p>
        <div v-if="matches.length" class="flex flex-col gap-4 lg:flex-row">
          <ul class="max-h-[32rem] min-w-64 overflow-auto text-sm">
            <li v-for="(m, i) in matches" :key="i" class="flex items-center gap-2">
              <input v-model="enabled[i]" type="checkbox" />
              <button class="truncate text-left underline" @click="previewPage = m.page">p{{ m.page }} · {{ m.text }}</button>
            </li>
          </ul>
          <PdfPageCanvas v-slot="{ scale }" :doc="doc" :page="previewPage" :width="560">
            <template v-for="(m, i) in matches" :key="i">
              <div v-if="m.page === previewPage && enabled[i]" class="absolute bg-black/80" :style="{ left: `${m.x * scale}px`, top: `${m.y * scale}px`, width: `${m.w * scale}px`, height: `${m.h * scale}px` }" />
            </template>
          </PdfPageCanvas>
        </div>
        <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-auto-redact.warn') }}</p>
        <div><Button :disabled="!chosen.length || busy" @click="run"><Download /> {{ busy ? $t('common.processing') : $t('tools.pdf-auto-redact.run') }}</Button></div>
      </template>
    </template>
  </div>
</template>
