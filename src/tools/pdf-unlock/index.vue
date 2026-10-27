<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { Unlock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { loadSamplePdf } from '@/lib/samplePdf'
import { downloadBlob } from '@/lib/download'
import { formatBytes } from '@/lib/format'
import { pdfBlob } from '@/lib/pdf'
import { isEncrypted, unlockPdf } from './logic'

const file = shallowRef<File | null>(null)
const bytes = shallowRef<Uint8Array | null>(null)
const password = ref('')
const error = ref('')
const busy = ref(false)
const encrypted = computed(() => (bytes.value ? isEncrypted(bytes.value) : false))
async function loadSample() {
  await onFile(await loadSamplePdf())
}
async function onFile(f: File) {
  file.value = f
  bytes.value = new Uint8Array(await f.arrayBuffer())
  error.value = ''
}
async function run() {
  if (!bytes.value || !file.value) return
  busy.value = true
  error.value = ''
  try {
    downloadBlob(pdfBlob(await unlockPdf(bytes.value, password.value)), file.value.name.replace(/\.pdf$/i, '') + '-unlocked.pdf')
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="application/pdf,.pdf" :label="$t('common.choosePdf')" @file="onFile" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <template v-if="file">
      <span class="text-sm">{{ file.name }} · {{ formatBytes(file.size) }}</span>
      <p v-if="!encrypted" class="text-muted-foreground text-sm">{{ $t('tools.pdf-unlock.notEncrypted') }}</p>
      <div class="flex flex-wrap items-center gap-2">
        <Input v-model="password" type="password" class="w-64" :placeholder="$t('tools.pdf-unlock.password')" @keyup.enter="run" />
        <Button :disabled="busy" @click="run"><Unlock /> {{ $t('tools.pdf-unlock.unlock') }}</Button>
      </div>
      <ErrorAlert v-if="error" :message="error" />
    </template>
    <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-unlock.note') }}</p>
  </div>
</template>
