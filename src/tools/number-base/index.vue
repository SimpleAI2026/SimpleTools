<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { groupDigits, parseBase, toBase, twosComplement } from './logic'

const SAMPLE = '255'
const input = ref(SAMPLE)
const from = ref(10)
const custom = ref(36)
const group = ref(true)
const bits = ref(16)
const bases = computed(() => [2, 8, 10, 16, Math.min(36, Math.max(2, Number(custom.value) || 36))])
const result = computed(() => {
  if (!input.value.trim()) return { rows: [], err: '', v: null }
  try {
    const v = parseBase(input.value, from.value)
    const rows = bases.value.map((b) => {
      const raw = toBase(v, b)
      const size = b === 2 || b === 16 ? 4 : b === 10 ? 3 : 0
      return { b, raw, shown: group.value && size ? groupDigits(raw, size, b === 10 ? ',' : ' ') : raw }
    })
    return { rows, err: '', v }
  } catch (e) {
    return { rows: [], err: (e as Error).message, v: null }
  }
})
const twos = computed(() => {
  const v = result.value.v
  if (v === null) return ''
  const n = Number(bits.value) || 16
  return v < -(1n << BigInt(n - 1)) || v >= 1n << BigInt(n) ? '—' : groupDigits(twosComplement(v, n), 4)
})

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex min-w-60 flex-1 flex-col gap-1.5">
        <Label for="num">{{ $t('tools.number-base.input') }}</Label>
        <Input id="num" v-model="input" class="font-mono text-lg" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label>{{ $t('tools.number-base.from') }}</Label>
        <ModeToggle v-model="from" :options="[[2, '2'], [8, '8'], [10, '10'], [16, '16'], [bases[4]!, String(bases[4])]]" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="custom">{{ $t('tools.number-base.custom') }}</Label>
        <Input id="custom" v-model.number="custom" type="number" min="2" max="36" class="w-20" />
      </div>
      <Label><Switch v-model="group" /> {{ $t('tools.number-base.group') }}</Label>
    </div>
    <ErrorAlert v-if="result.err" :message="result.err" />
    <div v-for="r in result.rows" :key="r.b" class="flex items-center gap-3 border-b py-2">
      <span class="text-muted-foreground w-16 text-sm">Base {{ r.b }}</span>
      <code class="flex-1 font-mono break-all">{{ r.shown }}</code>
      <CopyButton :text="r.raw" :label="false" />
    </div>
    <div v-if="result.v !== null" class="flex flex-wrap items-center gap-3">
      <span class="text-sm">{{ $t('tools.number-base.twos') }}</span>
      <ModeToggle v-model="bits" :options="[[8, '8'], [16, '16'], [32, '32'], [64, '64']]" />
      <code class="font-mono break-all">{{ twos }}</code>
    </div>
  </div>
</template>
