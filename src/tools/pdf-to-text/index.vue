<script setup lang="ts">
import { ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadText } from '@/lib/download'
import { parsePageRanges } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { extractPdfText } from './logic'

const { file, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const range = ref('')
const sep = ref(false)
const text = ref<string | null>(null)
async function run() {
  if (!doc.value) return
  busy.value = true
  try {
    text.value = await extractPdfText(doc.value, parsePageRanges(range.value, numPages.value), sep.value)
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
    <div v-if="doc" class="flex flex-wrap items-center gap-3">
      <Label>{{ $t('common.pageRange') }} <Input v-model="range" class="w-40" :placeholder="$t('common.allPages')" /></Label>
      <Label><Switch v-model="sep" /> {{ $t('tools.pdf-to-text.separators') }}</Label>
      <Button :disabled="busy" @click="run">{{ $t('tools.pdf-to-text.run') }}</Button>
    </div>
    <template v-if="text !== null">
      <p v-if="!text.trim()" class="text-muted-foreground text-sm">{{ $t('tools.pdf-to-text.empty') }}</p>
      <Textarea :model-value="text" readonly rows="18" class="font-mono" />
      <div class="flex gap-2">
        <CopyButton :text="text" />
        <Button variant="outline" @click="downloadText(text, `${baseName()}.txt`)"><Download /> {{ $t('tools.pdf-to-text.download') }}</Button>
      </div>
    </template>
  </div>
</template>
