<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DOMPurify from 'dompurify'
import { Button } from '@/components/ui/button'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { loadSampleDocx } from '@/lib/sampleDocx'
import { docxToHtml, DOCX_ACCEPT } from '@/lib/word'
import { addHeadingIds, countWords } from './logic'

const { t } = useI18n()
const raw = ref('')
const warnings = ref<string[]>([])
const name = ref('')
const error = ref('')
const busy = ref(false)
const doc = computed(() => addHeadingIds(DOMPurify.sanitize(raw.value)))
const words = computed(() => countWords(doc.value.html.replace(/<[^>]+>/g, ' ')))
async function load(f: File) {
  busy.value = true
  error.value = ''
  try {
    const r = await docxToHtml(await f.arrayBuffer())
    raw.value = r.html
    warnings.value = r.warnings
    name.value = f.name
  } catch {
    error.value = t('tools.word-viewer.failed')
  } finally {
    busy.value = false
  }
}
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
async function loadSample() {
  await load(await loadSampleDocx())
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="DOCX_ACCEPT" :label="$t('tools.word-viewer.drop')" @file="load" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <span v-if="busy" class="text-sm">{{ $t('common.processing') }}</span>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="raw">
      <div class="text-muted-foreground flex gap-3 text-sm">
        <span class="text-foreground font-medium">{{ name }}</span>
        <span>{{ $t('tools.word-viewer.words', { n: words }) }}</span>
        <span v-if="warnings.length" :title="warnings.join('\n')">{{ $t('tools.word-viewer.warnings', { n: warnings.length }) }}</span>
      </div>
      <div class="grid gap-4" :class="doc.toc.length ? 'lg:grid-cols-[14rem_1fr]' : ''">
        <nav v-if="doc.toc.length" class="h-fit max-h-[36rem] overflow-auto rounded-md border p-3 text-sm lg:sticky lg:top-4">
          <h3 class="mb-2 font-medium">{{ $t('tools.word-viewer.outline') }}</h3>
          <button v-for="h in doc.toc" :key="h.id" type="button" class="hover:text-primary block w-full truncate text-left" :style="{ paddingLeft: `${(h.level - 1) * 12}px` }" @click="go(h.id)">{{ h.text }}</button>
        </nav>
        <!-- eslint-disable-next-line vue/no-v-html -- sanitized with DOMPurify -->
        <article class="docx-view rounded-md border bg-white p-8 text-black shadow-sm" data-testid="tool-output" v-html="doc.html" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.docx-view :deep(h1) { font-size: 1.6rem; font-weight: 700; margin: 0.6em 0; }
.docx-view :deep(h2) { font-size: 1.3rem; font-weight: 700; margin: 0.6em 0; }
.docx-view :deep(h3) { font-size: 1.1rem; font-weight: 600; margin: 0.6em 0; }
.docx-view :deep(p) { margin: 0.4em 0; line-height: 1.6; }
.docx-view :deep(ul) { list-style: disc; padding-left: 1.5rem; }
.docx-view :deep(ol) { list-style: decimal; padding-left: 1.5rem; }
.docx-view :deep(table) { border-collapse: collapse; margin: 0.6em 0; }
.docx-view :deep(td), .docx-view :deep(th) { border: 1px solid #ccc; padding: 0.25rem 0.5rem; vertical-align: top; }
.docx-view :deep(img) { max-width: 100%; height: auto; }
.docx-view :deep(a) { color: #2563eb; text-decoration: underline; }
</style>
