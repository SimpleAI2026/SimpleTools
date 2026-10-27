<script setup lang="ts">
import { ref } from 'vue'
import { Download, RotateCcw, RotateCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import PdfInput from '@/components/shared/PdfInput.vue'
import PdfPageGrid from '@/components/shared/PdfPageGrid.vue'
import { downloadBlob } from '@/lib/download'
import { pdfBlob } from '@/lib/pdf'
import { usePdfFile } from '@/lib/usePdfFile'
import { rotatePdf, rotationMap } from './logic'

const { file, bytes, doc, numPages, error, busy, needsPassword, load, baseName } = usePdfFile()
const selected = ref<number[]>([])
const rot = ref<Record<number, number>>({})
const toggle = (p: number) => (selected.value = selected.value.includes(p) ? selected.value.filter((x) => x !== p) : [...selected.value, p])
const targets = () => (selected.value.length ? selected.value : Array.from({ length: numPages.value }, (_, i) => i + 1))
const rotate = (a: number) => (rot.value = rotationMap(targets(), a, rot.value))
async function save() {
  if (!bytes.value) return
  downloadBlob(pdfBlob(await rotatePdf(bytes.value, rot.value)), `${baseName()}-rotated.pdf`)
}
function onLoad(f: File, pw?: string) {
  selected.value = []
  rot.value = {}
  void load(f, pw)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <PdfInput :file="file" :num-pages="numPages" :busy="busy" :error="error" :needs-password="needsPassword" @load="onLoad" />
    <template v-if="doc">
      <div class="flex flex-wrap items-center gap-2">
        <Button variant="outline" @click="rotate(-90)"><RotateCcw /> {{ $t('tools.pdf-rotate.left') }}</Button>
        <Button variant="outline" @click="rotate(90)"><RotateCw /> {{ $t('tools.pdf-rotate.right') }}</Button>
        <Button variant="outline" @click="rotate(180)">{{ $t('tools.pdf-rotate.flip') }}</Button>
        <Button variant="ghost" @click="rot = {}">{{ $t('tools.pdf-rotate.reset') }}</Button>
        <Button @click="save"><Download /> {{ $t('tools.pdf-rotate.save') }}</Button>
      </div>
      <p class="text-muted-foreground text-xs">{{ $t('tools.pdf-rotate.hint') }}</p>
      <PdfPageGrid :doc="doc" :selected="selected" :rotations="rot" @toggle="toggle" />
    </template>
  </div>
</template>
