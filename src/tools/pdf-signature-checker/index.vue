<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { extractPdfSignatures, type PdfSignature } from './logic'

const { t } = useI18n()
const rows = ref<PdfSignature[]>([])
const note = ref('')
const text = () => rows.value.map((row) => `${row.signer}\t${row.digest}\t${row.signingTime}\t${row.byteRange?.join(' ') ?? ''}`).join('\n')

function onFile(file: File) {
  file.arrayBuffer().then((buffer) => {
    rows.value = extractPdfSignatures(new Uint8Array(buffer))
    note.value = rows.value.length ? '' : t('tools.pdf-signature-checker.none')
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone accept="application/pdf,.pdf" :label="t('tools.pdf-signature-checker.drop')" @file="onFile" />
    <p class="text-muted-foreground text-sm">{{ $t('tools.pdf-signature-checker.note') }}</p>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text()" /></div>
      <p v-if="note" class="text-muted-foreground text-sm">{{ note }}</p>
      <article v-for="(row, index) in rows" :key="index" class="rounded-md border p-3 text-sm" data-testid="tool-output">
        <p>{{ row.signer }}</p>
        <p class="text-muted-foreground">{{ row.digest }} · {{ row.bytes }} B</p>
        <p class="font-mono text-xs">{{ row.signingTime || '—' }} · {{ row.byteRange?.join(' ') }}</p>
      </article>
    </section>
  </div>
</template>
