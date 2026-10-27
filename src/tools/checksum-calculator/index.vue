<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { formatBytes } from '@/lib/format'
import { ALGOS, checksums, findMatch, hmac, type Algo } from './logic'

const SAMPLE = 'SimpleTools sample — offline-first developer toolbox.'
const src = ref<'text' | 'file'>('text')
const text = ref(SAMPLE)
const file = ref<File | null>(null)
const sums = ref<Partial<Record<Algo, string>>>({})
const busy = ref(false)
const expected = ref('')
const key = ref('')
const hmacHash = ref<'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256')
const hmacOut = ref('')
let run = 0
async function data(): Promise<Uint8Array | null> {
  if (src.value === 'text') return new TextEncoder().encode(text.value)
  return file.value ? new Uint8Array(await file.value.arrayBuffer()) : null
}
async function compute() {
  const id = ++run
  busy.value = true
  const d = await data()
  const s = d ? await checksums(d) : {}
  const h = d && key.value ? await hmac(d, key.value, hmacHash.value) : ''
  if (id === run) {
    sums.value = s
    hmacOut.value = h
    busy.value = false
  }
}
watchDebounced([text, key], compute, { debounce: 150 })
watch([src, file, hmacHash], compute, { immediate: true })
const match = computed(() => findMatch(expected.value, { ...sums.value }))
function loadSample() {
  src.value = 'text'
  text.value = SAMPLE
  expected.value = ''
  key.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ModeToggle v-model="src" :options="[['text', $t('tools.checksum-calculator.text')], ['file', $t('tools.checksum-calculator.file')]]" />
    <Textarea v-if="src === 'text'" v-model="text" class="min-h-28 h-auto" />
    <div v-else class="flex flex-col gap-2">
      <FileDropzone :label="$t('tools.checksum-calculator.drop')" @file="file = $event" />
      <p v-if="file" class="text-muted-foreground text-sm">{{ file.name }} · {{ formatBytes(file.size) }}</p>
    </div>
    <p v-if="busy" class="text-muted-foreground text-sm">{{ $t('tools.checksum-calculator.computing') }}</p>
    <div class="flex flex-col">
      <div v-for="a in ALGOS" :key="a" :class="['flex items-center gap-3 border-b py-1.5', match === a ? 'bg-emerald-500/10' : '']">
        <span class="w-20 shrink-0 text-sm font-medium">{{ a }}</span>
        <code class="text-muted-foreground flex-1 font-mono text-xs break-all">{{ sums[a] ?? '—' }}</code>
        <CopyButton :text="sums[a] ?? ''" :label="false" />
      </div>
    </div>
    <Input v-model="expected" class="font-mono" :placeholder="$t('tools.checksum-calculator.expected')" />
    <p v-if="expected.trim()" :class="match ? 'text-emerald-600' : 'text-destructive'" class="text-sm">
      {{ match ? $t('tools.checksum-calculator.match', { algo: match }) : $t('tools.checksum-calculator.noMatch') }}
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <Input v-model="key" type="password" class="max-w-xs" :placeholder="$t('tools.checksum-calculator.hmacKey')" />
      <ModeToggle v-model="hmacHash" :options="[['SHA-1', 'SHA-1'], ['SHA-256', 'SHA-256'], ['SHA-384', 'SHA-384'], ['SHA-512', 'SHA-512']]" />
    </div>
    <div v-if="hmacOut" class="flex items-center gap-2"><span class="text-sm font-medium">HMAC</span><code class="flex-1 font-mono text-xs break-all">{{ hmacOut }}</code><CopyButton :text="hmacOut" :label="false" /></div>
  </div>
</template>
