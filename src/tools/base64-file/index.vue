<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { filenameFor, parseDataUrl, toDataUrl } from './logic'

const { t } = useI18n()
const dataUrl = ref('')
const info = ref('')
const pasted = ref('')
const decoded = computed(() => (pasted.value.trim() ? parseDataUrl(pasted.value) : null))

function onFile(file: File) {
  file.arrayBuffer().then((buffer) => {
    dataUrl.value = toDataUrl(new Uint8Array(buffer), file.type || 'application/octet-stream')
    info.value = `${file.name} · ${formatBytes(file.size)}`
  })
}
function downloadDecoded() {
  if (!decoded.value) return
  downloadBlob(new Blob([decoded.value.bytes as BlobPart], { type: decoded.value.mime }), filenameFor(decoded.value.mime, 'decoded'))
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :label="t('tools.base64-file.drop')" @file="onFile" />
    <p v-if="info" class="text-muted-foreground text-sm">{{ info }}</p>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.base64-file.dataUrl') }}</Label><CopyButton :text="dataUrl" /></div>
      <Textarea :model-value="dataUrl" readonly class="bg-muted/40 min-h-28 font-mono text-xs" data-testid="tool-output" />
    </section>
    <Label class="flex flex-col items-start gap-2">{{ $t('tools.base64-file.paste') }}<Textarea v-model="pasted" class="min-h-28 font-mono text-xs" /></Label>
    <ErrorAlert v-if="pasted.trim() && !decoded" :message="t('tools.base64-file.invalid')" />
    <div v-if="decoded" class="flex flex-wrap items-center gap-2 text-sm">
      <span>{{ decoded.mime }} · {{ formatBytes(decoded.bytes.byteLength) }}</span>
      <Button size="sm" variant="outline" @click="downloadDecoded">{{ $t('common.download') }}</Button>
    </div>
  </div>
</template>
