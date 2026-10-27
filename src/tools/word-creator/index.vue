<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import DOMPurify from 'dompurify'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { downloadBlob } from '@/lib/download'
import { renderMarkdown } from '@/tools/markdown-preview/logic'
import { markdownToDocx } from './logic'

const SAMPLE = '# 项目周报\n\n本周完成了 **核心功能** 的开发，详见 [文档](https://example.com)。\n\n## 进展\n\n- 完成登录模块\n- 修复 3 个缺陷\n  - 包含一个 _严重_ 问题\n\n1. 下周计划一\n2. 下周计划二\n\n| 指标 | 数值 |\n| --- | --- |\n| 用户数 | 1024 |\n\n> 备注：数据截至周五。\n'
const md = ref(SAMPLE)
const o = reactive({ title: 'Document', font: 'Calibri', fontSize: 11 })
const error = ref('')
const busy = ref(false)
const preview = computed(() => DOMPurify.sanitize(renderMarkdown(md.value)))
async function create() {
  busy.value = true
  error.value = ''
  try {
    downloadBlob(await markdownToDocx(md.value, o), `${o.title || 'document'}.docx`)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

function loadSample() {
  md.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Label>{{ $t('tools.word-creator.title') }} <Input v-model="o.title" class="w-48" /></Label>
      <Label>{{ $t('tools.word-creator.font') }}
        <select v-model="o.font" class="border-input bg-background h-9 rounded-md border px-2">
          <option v-for="f in ['Calibri', 'Arial', 'Times New Roman', 'Microsoft YaHei', 'SimSun', 'PingFang SC']" :key="f">{{ f }}</option>
        </select>
      </Label>
      <Label>{{ $t('tools.word-creator.fontSize') }} <Input v-model.number="o.fontSize" type="number" min="6" max="48" class="w-20" /></Label>
      <Button :disabled="busy" @click="create"><Download /> {{ $t('tools.word-creator.create') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <Textarea v-model="md" class="min-h-[500px] font-mono min-h-[500px] h-[500px]" spellcheck="false" data-testid="tool-input" />
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized with DOMPurify -->
      <article class="prose-sm doc-preview min-h-[500px] overflow-auto rounded-md border bg-white p-6 text-black min-h-[500px] h-[500px]" :aria-label="$t('tools.word-creator.preview')" v-html="preview" />
    </div>
  </div>
</template>

<style scoped>
.doc-preview :deep(h1) { font-size: 1.6rem; font-weight: 700; margin: 0.5em 0; }
.doc-preview :deep(h2) { font-size: 1.3rem; font-weight: 700; margin: 0.5em 0; }
.doc-preview :deep(ul) { list-style: disc; padding-left: 1.5rem; }
.doc-preview :deep(ol) { list-style: decimal; padding-left: 1.5rem; }
.doc-preview :deep(table) { border-collapse: collapse; margin: 0.5em 0; }
.doc-preview :deep(td), .doc-preview :deep(th) { border: 1px solid #ccc; padding: 0.2rem 0.5rem; }
.doc-preview :deep(blockquote) { border-left: 3px solid #cbd5e1; padding-left: 0.75rem; font-style: italic; }
.doc-preview :deep(p) { margin: 0.4em 0; }
.doc-preview :deep(a) { color: #2563eb; text-decoration: underline; }
.doc-preview :deep(pre) { background: #f1f5f9; padding: 0.5rem; }
</style>
