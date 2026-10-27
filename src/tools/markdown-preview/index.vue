<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import DOMPurify from 'dompurify'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { downloadText } from '@/lib/download'
import { markdownStats, renderMarkdown, wrapHtmlDocument } from './logic'

const SAMPLE = '# Markdown Preview\n\nType **Markdown** on the left and see it _rendered_ here.\n\n- [x] GFM task lists\n- [ ] Tables\n\n| Tool | Status |\n| ---- | ------ |\n| Vue  | ✅     |\n\n```ts\nconst hello = (name: string) => `Hello ${name}`\n```\n\n> Scripts are stripped: <img src=x onerror="alert(1)">\n'
const input = ref(SAMPLE)
const o = reactive({ gfm: true, breaks: false })
const html = computed(() => DOMPurify.sanitize(renderMarkdown(input.value, o)))
const stats = computed(() => markdownStats(input.value))
function exportHtml() {
  downloadText(wrapHtmlDocument(html.value, 'Markdown'), 'markdown.html', 'text/html')
}

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Label><Switch v-model="o.gfm" /> {{ $t('tools.markdown-preview.gfm') }}</Label>
      <Label><Switch v-model="o.breaks" /> {{ $t('tools.markdown-preview.breaks') }}</Label>
      <span class="text-muted-foreground text-xs">{{ $t('tools.markdown-preview.stats', stats) }}</span>
      <div class="ml-auto flex gap-2">
        <CopyButton :text="html" />
        <Button size="sm" variant="outline" @click="exportHtml"><Download /> {{ $t('tools.markdown-preview.exportHtml') }}</Button>
      </div>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <Textarea v-model="input" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" spellcheck="false" data-testid="tool-input" />
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized with DOMPurify -->
      <article class="md-preview min-h-[500px] overflow-auto rounded-md border p-4 min-h-[500px] h-[500px]" data-testid="tool-output" v-html="html" />
    </div>
  </div>
</template>

<style scoped>
.md-preview :deep(h1) { font-size: 1.75rem; font-weight: 700; margin: 0.6em 0 0.4em; }
.md-preview :deep(h2) { font-size: 1.4rem; font-weight: 700; margin: 0.6em 0 0.4em; }
.md-preview :deep(h3) { font-size: 1.15rem; font-weight: 600; margin: 0.6em 0 0.4em; }
.md-preview :deep(p), .md-preview :deep(ul), .md-preview :deep(ol), .md-preview :deep(pre), .md-preview :deep(blockquote), .md-preview :deep(table) { margin: 0.6em 0; }
.md-preview :deep(ul) { list-style: disc; padding-left: 1.5rem; }
.md-preview :deep(ol) { list-style: decimal; padding-left: 1.5rem; }
.md-preview :deep(pre) { background: var(--muted); padding: 0.75rem; border-radius: 0.375rem; overflow: auto; }
.md-preview :deep(code) { font-family: ui-monospace, monospace; font-size: 0.9em; }
.md-preview :deep(blockquote) { border-left: 4px solid var(--border); padding-left: 1rem; color: var(--muted-foreground); }
.md-preview :deep(table) { border-collapse: collapse; }
.md-preview :deep(th), .md-preview :deep(td) { border: 1px solid var(--border); padding: 0.25rem 0.6rem; }
.md-preview :deep(a) { color: var(--primary); text-decoration: underline; }
.md-preview :deep(img) { max-width: 100%; }
</style>
