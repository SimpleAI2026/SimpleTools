<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { withExt } from '@/lib/canvas'
import { downloadText } from '@/lib/download'
import { loadSampleDocx } from '@/lib/sampleDocx'
import { DOCX_ACCEPT } from '@/lib/word'
import { docxToMarkdown } from './logic'

const { t } = useI18n()
const file = shallowRef<File | null>(null)
const md = ref('')
const stripImages = ref(true)
const error = ref('')
watch([file, stripImages], async () => {
  if (!file.value) return
  error.value = ''
  try {
    md.value = (await docxToMarkdown(await file.value.arrayBuffer(), { stripImages: stripImages.value })).markdown
  } catch {
    error.value = t('tools.word-to-markdown.failed')
  }
})
async function loadSample() {
  file.value = await loadSampleDocx()
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="DOCX_ACCEPT" :label="$t('tools.word-to-markdown.drop')" @file="(f) => (file = f)" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="md">
      <div class="flex flex-wrap items-center gap-3">
        <Label><Switch v-model="stripImages" /> {{ $t('tools.word-to-markdown.stripImages') }}</Label>
        <CopyButton :text="md" />
        <Button variant="outline" @click="downloadText(md, withExt(file?.name ?? 'document', 'md'), 'text/markdown')"><Download /> {{ $t('tools.word-to-markdown.download') }}</Button>
      </div>
      <Textarea :model-value="md" readonly class="bg-muted/40 min-h-[500px] font-mono min-h-[500px] h-[500px]" data-testid="tool-output" />
    </template>
  </div>
</template>
