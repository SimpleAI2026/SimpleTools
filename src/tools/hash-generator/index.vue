<script setup lang="ts">
import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import { formatBytes } from '@/lib/format'
import { hashAll, HASH_ALGORITHMS, type HashAlgorithm } from './logic'

const source = ref<'text' | 'file'>('text')
const SAMPLE = 'hello world'
const text = ref(SAMPLE)
const file = ref<File | null>(null)
const hashes = ref<Record<HashAlgorithm, string> | null>(null)
const busy = ref(false)
let run = 0

async function compute() {
  const id = ++run
  busy.value = true
  try {
    const data = source.value === 'text' ? text.value : file.value ? await file.value.arrayBuffer() : null
    const r = data === null ? null : await hashAll(data)
    if (id === run) hashes.value = r
  } finally {
    if (id === run) busy.value = false
  }
}

watchDebounced(text, compute, { debounce: 150 })
watch([source, file], compute, { immediate: true })

function loadSample() {
  text.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex gap-2">
      <Button size="sm" :variant="source === 'text' ? 'default' : 'outline'" @click="source = 'text'">{{ $t('tools.hash-generator.text') }}</Button>
      <Button size="sm" :variant="source === 'file' ? 'default' : 'outline'" @click="source = 'file'">{{ $t('tools.hash-generator.file') }}</Button>
    </div>
    <Textarea v-if="source === 'text'" v-model="text" class="min-h-[500px] min-h-[500px] h-[500px]" spellcheck="false" />
    <div v-else class="flex flex-col gap-2">
      <FileDropzone :label="$t('tools.hash-generator.chooseFile')" @file="file = $event" />
      <p v-if="file" class="text-muted-foreground text-sm">{{ file.name }} · {{ formatBytes(file.size) }}</p>
    </div>
    <p v-if="busy" class="text-muted-foreground text-sm">{{ $t('tools.hash-generator.computing') }}</p>
    <div class="flex flex-col gap-2">
      <div v-for="alg in HASH_ALGORITHMS" :key="alg" class="flex items-center gap-3 rounded-md border px-3 py-2">
        <span class="w-20 shrink-0 text-sm font-medium">{{ alg }}</span>
        <code class="text-muted-foreground min-w-0 flex-1 font-mono text-xs break-all">{{ hashes?.[alg] ?? '—' }}</code>
        <CopyButton :text="hashes?.[alg] ?? ''" :label="false" />
      </div>
    </div>
  </div>
</template>
