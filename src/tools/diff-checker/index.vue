<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { refDebounced } from '@vueuse/core'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { computeDiff, diffStats, toUnified, type DiffMode } from './logic'

const SAMPLE_A = 'The quick brown fox\njumps over\nthe lazy dog.'
const SAMPLE_B = 'The quick red fox\njumps over\nthe lazy cat.\nThe end.'
const a = ref(SAMPLE_A)
const b = ref(SAMPLE_B)
const mode = ref<DiffMode>('lines')
const ignoreCase = ref(false)
const ignoreWhitespace = ref(false)
const da = refDebounced(a, 200)
const db = refDebounced(b, 200)
const parts = computed(() => computeDiff(da.value, db.value, mode.value, { ignoreCase: ignoreCase.value, ignoreWhitespace: ignoreWhitespace.value }))
const stats = computed(() => diffStats(parts.value, mode.value))
const cls = { added: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300', removed: 'bg-red-500/20 text-red-800 line-through dark:text-red-300', same: '' }

function loadSample() {
  a.value = SAMPLE_A
  b.value = SAMPLE_B
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2"><Label>{{ $t('tools.diff-checker.original') }}</Label><Textarea v-model="a" class="min-h-[500px] min-h-[500px] h-[500px]" /></div>
      <div class="flex flex-col gap-2"><Label>{{ $t('tools.diff-checker.changed') }}</Label><Textarea v-model="b" class="min-h-[500px] min-h-[500px] h-[500px]" /></div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <ModeToggle v-model="mode" :options="[['lines', $t('tools.diff-checker.lines')], ['words', $t('tools.diff-checker.words')], ['chars', $t('tools.diff-checker.chars')]]" />
      <Label><Switch v-model="ignoreCase" /> {{ $t('tools.diff-checker.ignoreCase') }}</Label>
      <Label><Switch v-model="ignoreWhitespace" /> {{ $t('tools.diff-checker.ignoreWhitespace') }}</Label>
      <span class="ml-auto text-sm text-emerald-600">{{ $t('tools.diff-checker.added', { n: stats.added }) }}</span>
      <span class="text-sm text-red-600">{{ $t('tools.diff-checker.removed', { n: stats.removed }) }}</span>
      <CopyButton v-if="mode === 'lines'" :text="toUnified(parts)" />
    </div>
    <p v-if="!stats.added && !stats.removed" class="text-sm text-emerald-600">✓ {{ $t('tools.diff-checker.identical') }}</p>
    <pre class="bg-muted/30 max-h-[32rem] overflow-auto rounded-md border p-3 font-mono text-sm whitespace-pre-wrap"><span v-for="(p, i) in parts" :key="i" :class="cls[p.type]">{{ p.value }}</span></pre>
  </div>
</template>
