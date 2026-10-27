<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { base64ByteLength, base64ToBytes, cssSnippet, htmlSnippet, parseDataUrl } from './logic'
import { loadSampleImage } from '@/lib/sampleImage'

const mode = ref<'enc' | 'dec'>('enc')
const dataUrl = ref('')
const fileInfo = ref('')
async function loadSample() {
  onFile(await loadSampleImage())
}

function onFile(f: File) {
  const reader = new FileReader()
  reader.onload = () => {
    dataUrl.value = String(reader.result)
    fileInfo.value = `${f.name} · ${formatBytes(f.size)}`
  }
  reader.readAsDataURL(f)
}
const outputs = computed(() =>
  dataUrl.value
    ? [
        ['dataUrl', dataUrl.value],
        ['css', cssSnippet(dataUrl.value)],
        ['html', htmlSnippet(dataUrl.value)],
      ]
    : [],
)
const pasted = ref('')
const parsed = computed(() => (pasted.value.trim() ? parseDataUrl(pasted.value) : null))
const previewUrl = computed(() => (parsed.value ? `data:${parsed.value.mime};base64,${parsed.value.base64}` : ''))
function save() {
  if (!parsed.value) return
  const ext = parsed.value.mime.split('/')[1]?.replace('svg+xml', 'svg') ?? 'bin'
  downloadBlob(new Blob([base64ToBytes(parsed.value.base64) as BlobPart], { type: parsed.value.mime }), `image.${ext}`)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <ModeToggle v-model="mode" :options="[['enc', $t('tools.image-base64.toBase64')], ['dec', $t('tools.image-base64.toImage')]]" />
    <template v-if="mode === 'enc'">
      <FileDropzone accept="image/*" :label="$t('tools.image-base64.drop')" @file="onFile" />
      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
      </div>
      <div v-if="dataUrl" class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
          <img :src="dataUrl" alt="" class="max-h-40 rounded border" />
          <p class="text-muted-foreground text-sm">{{ fileInfo }} · Base64 {{ formatBytes(dataUrl.length) }}</p>
        </div>
        <div v-for="[k, v] in outputs" :key="k" class="flex flex-col gap-2">
          <div class="flex items-center justify-between"><Label>{{ $t(`tools.image-base64.${k}`) }}</Label><CopyButton :text="v ?? ''" /></div>
          <Textarea :model-value="v" readonly class="bg-muted/40 min-h-[500px] break-all min-h-[500px] h-[500px]" />
        </div>
      </div>
    </template>
    <template v-else>
      <Textarea v-model="pasted" :placeholder="$t('tools.image-base64.paste')" class="min-h-[500px] break-all min-h-[500px] h-[500px]" />
      <ErrorAlert v-if="pasted.trim() && !parsed" :message="$t('tools.image-base64.invalid')" />
      <div v-if="parsed" class="flex flex-col items-start gap-3">
        <img :src="previewUrl" alt="" class="max-h-80 rounded border" />
        <p class="text-muted-foreground text-sm">{{ parsed.mime }} · {{ $t('tools.image-base64.size') }} {{ formatBytes(base64ByteLength(parsed.base64)) }}</p>
        <Button size="sm" variant="outline" @click="save"><Download /> {{ $t('common.download') }}</Button>
      </div>
    </template>
  </div>
</template>
