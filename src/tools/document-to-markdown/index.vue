<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import DOMPurify from 'dompurify'
import { Download, LoaderCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { downloadText } from '@/lib/download'
import { renderMarkdown } from '@/tools/markdown-preview/logic'
import { loadAnydocUrls } from './loader'
import {
  DOCUMENT_ACCEPT,
  FORMAT_GROUPS,
  anydocEngineMib,
  conversionStats,
  markdownDownloadName,
  mapConvertError,
  type AnydocFormat,
  type ConvertFailure,
} from './logic'
import type { WorkerPhase, WorkerResult } from './worker'

const { t } = useI18n()
const p = (key: string, args?: Record<string, unknown>) => t(`tools.document-to-markdown.${key}`, args ?? {})
const engineSize = anydocEngineMib()

const file = shallowRef<File | null>(null)
const markdown = ref<string | null>(null)
const format = ref<AnydocFormat | ''>('')
const stats = ref<{ characters: number; lines: number; elapsedMs: number } | null>(null)
const failure = ref<ConvertFailure | null>(null)
const phase = ref<'loading' | 'converting' | ''>('')
const view = ref<'preview' | 'source'>('preview')

const previewHtml = computed(() => DOMPurify.sanitize(renderMarkdown(markdown.value ?? '', { gfm: true, breaks: false })))
const downloadName = computed(() => markdownDownloadName(file.value?.name ?? 'document'))

let worker: Worker | null = null
let requestId = 0
const pending = new Map<number, (result: WorkerResult) => void>()

function failWorker(error: unknown) {
  for (const [id, resolve] of pending) resolve({ id, ok: false, failure: mapConvertError(error) })
  pending.clear()
  worker?.terminate()
  worker = null
}

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = (event: MessageEvent<WorkerResult | WorkerPhase>) => {
      const data = event.data
      if ('phase' in data) {
        if (data.id === requestId) phase.value = data.phase
        return
      }
      pending.get(data.id)?.(data)
      pending.delete(data.id)
    }
    worker.onerror = (event) => failWorker(new Error(event.message || 'worker'))
  }
  return worker
}

function callWorker(message: { id: number; filename: string; bytes: ArrayBuffer; jsUrl: string; wasmUrl: string }, transfer: ArrayBuffer) {
  return new Promise<WorkerResult>((resolve) => {
    pending.set(message.id, resolve)
    getWorker().postMessage(message, [transfer])
  })
}

async function onFile(next: File) {
  const id = ++requestId
  file.value = next
  markdown.value = null
  format.value = ''
  stats.value = null
  failure.value = null
  phase.value = 'loading'
  view.value = 'preview'
  try {
    const urls = loadAnydocUrls()
    const bytes = await next.arrayBuffer()
    if (id !== requestId) return
    const result = await callWorker({ id, filename: next.name, bytes, ...urls }, bytes)
    if (id !== requestId) return
    if (!result.ok) {
      failure.value = result.failure
      return
    }
    markdown.value = result.markdown
    format.value = result.format
    stats.value = conversionStats(result.markdown, result.elapsedMs)
  } catch (error) {
    if (id !== requestId) return
    failure.value = mapConvertError(error)
  } finally {
    if (id === requestId) phase.value = ''
  }
}

function downloadMarkdown() {
  if (markdown.value === null) return
  downloadText(markdown.value, downloadName.value, 'text/markdown;charset=utf-8')
}

function clearFile() {
  requestId += 1
  file.value = null
  markdown.value = null
  format.value = ''
  stats.value = null
  failure.value = null
  phase.value = ''
}

onBeforeUnmount(() => {
  requestId += 1
  worker?.terminate()
  worker = null
  pending.clear()
})
</script>

<template>
  <div class="flex min-w-0 flex-col gap-4">
    <p class="text-sm">{{ p('privacy') }}</p>
    <p class="text-muted-foreground text-sm">{{ p('engine', { size: engineSize }) }} {{ p('noOcr') }}</p>

    <section class="flex flex-col gap-2">
      <h2 class="text-sm font-semibold">{{ p('formatsTitle') }}</h2>
      <ul class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <li v-for="group in FORMAT_GROUPS" :key="group.id" class="min-w-0 rounded-md border px-3 py-2">
          <p class="text-sm font-medium">{{ p(`groups.${group.id}`) }}</p>
          <p class="text-muted-foreground text-xs break-words">{{ group.extensions.join(' ') }}</p>
        </li>
      </ul>
    </section>

    <FileDropzone :accept="DOCUMENT_ACCEPT" :label="p('drop')" @file="onFile" />
    <p v-if="file" class="text-sm break-all">{{ p('fileLabel', { name: file.name }) }}</p>
    <p v-if="phase" class="text-muted-foreground flex items-center gap-2 text-sm" role="status">
      <LoaderCircle class="size-4 animate-spin" />
      {{ phase === 'loading' ? p('loading') : p('converting') }}
    </p>

    <div v-if="failure" role="alert" class="border-destructive/40 bg-destructive/5 min-w-0 rounded-lg border p-4" data-testid="convert-error">
      <p class="font-medium">{{ p(`errors.${failure.code}`) }}</p>
      <p v-if="failure.message" class="text-muted-foreground mt-1 text-sm break-words">{{ failure.message }}</p>
      <p v-if="failure.pages?.length" class="mt-1 text-sm">
        {{ p('needsOcrPages', { pages: failure.pages.join(', '), pageCount: failure.pageCount ?? failure.pages.length }) }}
      </p>
    </div>

    <section v-if="markdown !== null" class="flex min-w-0 flex-col gap-3">
      <div class="flex min-w-0 flex-wrap items-center gap-2">
        <h2 class="text-sm font-semibold">{{ p('result') }}</h2>
        <span v-if="format" class="bg-secondary rounded-full px-2 py-0.5 text-xs" data-testid="detected-format">{{ p('detected', { format }) }}</span>
        <span v-if="stats" class="text-muted-foreground text-xs">{{ p('stats', { characters: stats.characters, lines: stats.lines, elapsed: stats.elapsedMs }) }}</span>
        <div class="ml-auto flex max-w-full flex-wrap items-center justify-end gap-2">
          <Button size="sm" :variant="view === 'preview' ? 'default' : 'outline'" data-testid="view-preview" @click="view = 'preview'">{{ p('preview') }}</Button>
          <Button size="sm" :variant="view === 'source' ? 'default' : 'outline'" data-testid="view-source" @click="view = 'source'">{{ p('source') }}</Button>
          <CopyButton :text="markdown ?? ''" />
          <Button size="sm" variant="outline" data-testid="download-md" @click="downloadMarkdown">
            <Download /> {{ p('download') }}
          </Button>
          <Button size="sm" variant="outline" data-testid="clear-file" @click="clearFile">{{ p('clear') }}</Button>
        </div>
      </div>
      <!-- eslint-disable vue/no-v-html -- sanitized with DOMPurify -->
      <article
        v-if="view === 'preview'"
        class="md-preview min-h-48 min-w-0 overflow-auto rounded-md border p-4"
        data-testid="tool-output"
        v-html="previewHtml"
      />
      <!-- eslint-enable vue/no-v-html -->
      <Textarea v-else :model-value="markdown" readonly class="bg-muted/40 min-h-48 font-mono" data-testid="markdown-source" />
    </section>
  </div>
</template>

<style scoped>
.md-preview :deep(h1) { font-size: 1.5rem; font-weight: 700; margin: 0.6em 0 0.4em; }
.md-preview :deep(h2) { font-size: 1.25rem; font-weight: 700; margin: 0.6em 0 0.4em; }
.md-preview :deep(h3) { font-size: 1.1rem; font-weight: 600; margin: 0.6em 0 0.4em; }
.md-preview :deep(p), .md-preview :deep(ul), .md-preview :deep(ol), .md-preview :deep(pre), .md-preview :deep(blockquote), .md-preview :deep(table) { margin: 0.6em 0; }
.md-preview :deep(ul) { list-style: disc; padding-left: 1.25rem; }
.md-preview :deep(ol) { list-style: decimal; padding-left: 1.25rem; }
.md-preview :deep(pre) { background: var(--muted); padding: 0.75rem; border-radius: 0.375rem; overflow: auto; }
.md-preview :deep(code) { font-family: ui-monospace, monospace; font-size: 0.9em; }
.md-preview :deep(blockquote) { border-left: 4px solid var(--border); padding-left: 1rem; color: var(--muted-foreground); }
.md-preview :deep(table) { border-collapse: collapse; display: block; max-width: 100%; overflow-x: auto; }
.md-preview :deep(th), .md-preview :deep(td) { border: 1px solid var(--border); padding: 0.25rem 0.5rem; }
.md-preview :deep(a) { color: var(--primary); text-decoration: underline; }
.md-preview :deep(img) { max-width: 100%; }
</style>
