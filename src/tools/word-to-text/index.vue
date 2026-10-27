<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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
import { docxToText, DOCX_ACCEPT } from '@/lib/word'
import { tidyText } from './logic'

const { t } = useI18n()
const raw = ref('')
const name = ref('document.docx')
const o = reactive({ collapseBlankLines: true, trimLines: true })
const error = ref('')
const text = computed(() => tidyText(raw.value, o))
async function load(f: File) {
  error.value = ''
  try {
    raw.value = await docxToText(await f.arrayBuffer())
    name.value = f.name
  } catch {
    error.value = t('tools.word-to-text.failed')
  }
}
async function loadSample() {
  await load(await loadSampleDocx())
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="DOCX_ACCEPT" :label="$t('tools.word-to-text.drop')" @file="load" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="raw">
      <div class="flex flex-wrap items-center gap-3">
        <Label><Switch v-model="o.collapseBlankLines" /> {{ $t('tools.word-to-text.collapse') }}</Label>
        <Label><Switch v-model="o.trimLines" /> {{ $t('tools.word-to-text.trim') }}</Label>
        <CopyButton :text="text" />
        <Button variant="outline" @click="downloadText(text, withExt(name, 'txt'))"><Download /> {{ $t('tools.word-to-text.download') }}</Button>
      </div>
      <Textarea :model-value="text" readonly class="bg-muted/40 min-h-[500px] min-h-[500px] h-[500px]" data-testid="tool-output" />
    </template>
  </div>
</template>
