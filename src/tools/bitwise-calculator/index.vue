<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { BIT_OPS, compute, formatBits, parseBigInt, toSigned, type BitOp, type Width } from './logic'

const a = ref('0b1100')
const b = ref('10')
const op = ref<BitOp>('and')
const width = ref<Width>(32)
const pa = computed(() => parseBigInt(a.value))
const pb = computed(() => parseBigInt(b.value))
const result = computed(() => (pa.value === null || pb.value === null ? null : compute(pa.value, pb.value, op.value, width.value)))
const rows = computed(() => {
  const r = result.value
  if (r === null) return []
  return [
    ['unsigned', r.toString()],
    ['signed', toSigned(r, width.value).toString()],
    ['HEX', '0x' + r.toString(16).toUpperCase()],
    ['OCT', '0o' + r.toString(8)],
    ['BIN', formatBits(r, width.value)],
  ] as const
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="flex flex-col gap-2"><Label for="a">{{ $t('tools.bitwise-calculator.a') }}</Label><Input id="a" v-model="a" class="font-mono" /></div>
      <div class="flex flex-col gap-2"><Label for="b">{{ $t('tools.bitwise-calculator.b') }}</Label><Input id="b" v-model="b" class="font-mono" :disabled="op === 'notA'" /></div>
    </div>
    <ModeToggle v-model="op" :options="BIT_OPS.map((o) => [o, $t(`tools.bitwise-calculator.ops.${o}`)] as const)" />
    <div class="flex items-center gap-2"><span class="text-sm">{{ $t('tools.bitwise-calculator.width') }}</span><ModeToggle v-model="width" :options="[[8, '8'], [16, '16'], [32, '32'], [64, '64']]" /></div>
    <ErrorAlert v-if="result === null" :message="$t('tools.bitwise-calculator.invalid')" />
    <div v-else class="flex flex-col gap-1">
      <div v-if="pa !== null" class="text-muted-foreground font-mono text-xs">A = {{ formatBits(pa, width) }}</div>
      <div v-if="pb !== null && op !== 'notA'" class="text-muted-foreground font-mono text-xs">B = {{ formatBits(pb, width) }}</div>
      <div v-for="[k, v] in rows" :key="k" class="flex items-center gap-3 border-b py-1.5">
        <span class="text-muted-foreground w-24 text-sm">{{ k === 'signed' || k === 'unsigned' ? $t(`tools.bitwise-calculator.${k}`) : k }}</span>
        <code class="flex-1 font-mono text-sm break-all">{{ v }}</code>
        <CopyButton :text="v" :label="false" />
      </div>
    </div>
  </div>
</template>
