<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { downloadText } from '@/lib/download'
import { present, SAMPLE } from './logic'

const source = ref(SAMPLE)
const offsetMs = ref(0)
const target = ref<'srt' | 'vtt' | 'txt'>('srt')
const report = computed(() => {
  if (!source.value.trim()) return null
  const presented = present(JSON.stringify({ text: source.value, offsetMs: offsetMs.value, target: target.value }))
  if (presented.error || !presented.jsonText) return { error: presented.error || 'bad-input', data: null, output: '', filename: '' }
  const data = (JSON.parse(presented.jsonText) as { result: { converted: boolean; cues?: unknown[]; overlaps?: number; clipped?: number; rendered?: string } }).result
  const file = presented.files.find((item) => ['subtitles.srt', 'subtitles.vtt', 'transcript.txt', 'subtitles.original.txt'].includes(item.name))
  return { error: '', data, output: data.rendered ?? file?.text ?? '', filename: file?.name ?? 'subtitles.txt' }
})
async function importFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) source.value = await file.text()
  ;(event.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.subtitle-toolkit.disclaimer') }}</p>
    <div class="flex flex-wrap gap-2">
      <label class="inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm hover:bg-accent">{{ $t('common.importFile') }}<input type="file" class="sr-only" accept=".srt,.vtt,text/plain" @change="importFile" /></label>
      <Button variant="outline" @click="source = SAMPLE">{{ $t('common.sample') }}</Button>
      <Button variant="outline" @click="source = ''">{{ $t('common.clear') }}</Button>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <Label class="flex flex-col items-start gap-2 text-sm">{{ $t('common.input') }}<Textarea v-model="source" class="!h-56 !min-h-56 font-mono text-xs" data-testid="subtitle-input" /></Label>
      <Label class="flex flex-col items-start gap-2 text-sm">{{ $t('common.output') }}<Textarea :model-value="report?.output ?? ''" readonly class="bg-muted/30 !h-56 !min-h-56 font-mono text-xs" data-testid="subtitle-output" /></Label>
    </div>
    <div class="flex flex-wrap items-end gap-3">
      <Label class="flex flex-col items-start gap-2 text-sm">{{ $t('tools.subtitle-toolkit.offset') }}<Input v-model.number="offsetMs" type="number" step="100" class="w-36" /></Label>
      <Label class="flex flex-col items-start gap-2 text-sm">{{ $t('tools.subtitle-toolkit.targetFormat') }}<select v-model="target" class="border-input bg-background h-9 rounded-md border px-3"><option value="srt">SRT</option><option value="vtt">WebVTT</option><option value="txt">TXT</option></select></Label>
      <CopyButton v-if="report?.output" :text="report.output" />
      <Button v-if="report?.output" variant="secondary" @click="downloadText(report.output, report.filename, 'text/plain;charset=utf-8')">{{ $t('common.download') }}</Button>
    </div>
    <ErrorAlert v-if="report?.error" :message="$t('common.badInput')" />
    <template v-if="report?.data">
      <p v-if="!report.data.converted" class="rounded-md border border-amber-600/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">{{ $t('tools.subtitle-toolkit.complexWarning') }}</p>
      <div v-else class="flex flex-wrap gap-4 text-sm"><span>{{ $t('tools.subtitle-toolkit.cues') }}: <strong>{{ report.data.cues?.length ?? 0 }}</strong></span><span>{{ $t('tools.subtitle-toolkit.overlaps') }}: <strong>{{ report.data.overlaps ?? 0 }}</strong></span><span>{{ $t('tools.subtitle-toolkit.clipped') }}: <strong>{{ report.data.clipped ?? 0 }}</strong></span></div>
    </template>
  </div>
</template>
