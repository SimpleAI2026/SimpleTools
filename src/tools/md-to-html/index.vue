<script setup lang="ts">
import { computed, ref } from 'vue'
import DOMPurify from 'dompurify'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { downloadText } from '@/lib/download'
import { mdToHtml } from './logic'

const SAMPLE = '# Weekly report\n\n## Done\n\n1. Shipped **v2.0**\n2. Fixed [#42](https://example.com)\n\n| Metric | Value |\n| --- | --- |\n| Users | 1,024 |\n'
const input = ref(SAMPLE)
const full = ref(false)
const sanitize = ref(true)
const view = ref<'source' | 'preview'>('source')
const html = computed(() => mdToHtml(input.value, full.value, sanitize.value ? (h) => DOMPurify.sanitize(h) : undefined))
// the preview iframe is sandboxed without scripts, so even unsanitized output cannot run code
const srcdoc = computed(() => mdToHtml(input.value, true, (h) => DOMPurify.sanitize(h)))
function download() {
  downloadText(mdToHtml(input.value, true, sanitize.value ? (h) => DOMPurify.sanitize(h) : undefined), 'document.html', 'text/html')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <TextIO v-model="input" :output="html" :sample="SAMPLE">
      <Label><Switch v-model="full" /> {{ $t('tools.md-to-html.full') }}</Label>
      <Label><Switch v-model="sanitize" /> {{ $t('tools.md-to-html.sanitize') }}</Label>
      <ModeToggle v-model="view" :options="[['source', $t('tools.md-to-html.source')], ['preview', $t('common.preview')]]" />
      <Button size="sm" variant="outline" @click="download">
        <Download /> {{ $t('tools.md-to-html.download') }}
      </Button>
    </TextIO>
    <iframe v-if="view === 'preview'" :srcdoc="srcdoc" sandbox="" class="h-96 w-full rounded-md border bg-white" :title="$t('common.preview')" />
  </div>
</template>
