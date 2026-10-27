<script setup lang="ts">
import { reactive } from 'vue'
import { Lock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import PdfInput from '@/components/shared/PdfInput.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { protectPdf, type ProtectOptions } from './logic'

const { file, bytes, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const o = reactive<ProtectOptions>({ userPassword: '', ownerPassword: '', algorithm: 'AES-256', printing: true, copying: false, modifying: false, annotating: true })
const perms = ['printing', 'copying', 'modifying', 'annotating'] as const
async function run() {
  if (!bytes.value) return
  try {
    downloadBlob(pdfBlob(await protectPdf(bytes.value, o)), `${baseName()}-protected.pdf`)
  } catch (e) {
    error.value = (e as Error).message
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="load" />
    <template v-if="bytes">
      <div class="grid max-w-2xl gap-3 sm:grid-cols-2">
        <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-protect.userPassword') }} <Input v-model="o.userPassword" type="password" autocomplete="new-password" /></Label>
        <Label class="flex flex-col items-start gap-1.5">{{ $t('tools.pdf-protect.ownerPassword') }} <Input v-model="o.ownerPassword" type="password" autocomplete="new-password" /></Label>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm">{{ $t('tools.pdf-protect.algorithm') }}</span>
        <ModeToggle v-model="o.algorithm" :options="[['AES-256', 'AES-256'], ['AES-128', 'AES-128']]" />
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <span class="text-sm">{{ $t('tools.pdf-protect.permissions') }}</span>
        <Label v-for="p in perms" :key="p"><Switch v-model="o[p]" /> {{ $t(`tools.pdf-protect.${p}`) }}</Label>
      </div>
      <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-protect.note') }}</p>
      <div><Button :disabled="!o.userPassword && !o.ownerPassword" @click="run"><Lock /> {{ $t('tools.pdf-protect.protect') }}</Button></div>
    </template>
  </div>
</template>
