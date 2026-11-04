<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadText } from '@/lib/download'
import { parsePageRanges } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { pdfToMarkdown } from './logic'
import { runBusy } from '@/lib/runBusy'

const { file, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const range = ref('')
const md = ref<string | null>(null)
async function run() {
  const d = doc.value
  if (!d) return
  await runBusy({ busy, error }, async () => {
    md.value = await pdfToMarkdown(d, parsePageRanges(range.value, numPages.value))
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <div v-if="doc" class="flex flex-wrap items-center gap-3">
      <Label>{{ $t('common.pageRange') }} <Input v-model="range" class="w-40" :placeholder="$t('common.allPages')" /></Label>
      <Button :disabled="busy" @click="run">{{ $t('tools.pdf-to-markdown.run') }}</Button>
      <span class="text-muted-foreground text-xs">{{ $t('tools.pdf-to-markdown.note') }}</span>
    </div>
    <template v-if="md !== null">
      <Textarea :model-value="md" readonly rows="18" class="font-mono" />
      <div class="flex gap-2">
        <CopyButton :text="md" />
        <Button variant="outline" @click="downloadText(md, `${baseName()}.md`, 'text/markdown;charset=utf-8')"><Download /> {{ $t('tools.pdf-to-markdown.download') }}</Button>
      </div>
    </template>
  </div>
</template>
