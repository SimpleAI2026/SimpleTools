<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { COLOR_FORMATS, contrastRatio, formatColor, parseColor, type RGB } from './logic'

const SAMPLE = '#6366f1'
const input = ref(SAMPLE)
/** CSS named colors are resolved by the browser itself. */
function resolveNamed(s: string): RGB | null {
  if (!/^[a-z]+$/i.test(s.trim())) return null
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#010203'
  ctx.fillStyle = s.trim()
  const v = ctx.fillStyle
  return v === '#010203' && s.trim().toLowerCase() !== '#010203' ? null : parseColor(v)
}
const color = computed(() => parseColor(input.value) ?? resolveNamed(input.value))
const rows = computed(() => (color.value ? COLOR_FORMATS.map((f) => ({ f, v: formatColor(color.value!, f) })) : []))
const picker = computed({
  get: () => (color.value ? formatColor({ ...color.value, a: 1 }, 'hex') : '#000000'),
  set: (v: string) => (input.value = v),
})
const W = { r: 255, g: 255, b: 255, a: 1 }
const K = { r: 0, g: 0, b: 0, a: 1 }

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex gap-2">
      <input v-model="picker" type="color" class="h-10 w-14 cursor-pointer rounded border" />
      <Input v-model="input" class="h-10 font-mono" :placeholder="$t('tools.color-converter.input')" />
    </div>
    <ErrorAlert v-if="input.trim() && !color" :message="$t('tools.color-converter.invalid')" />
    <div v-if="color" class="grid gap-4 md:grid-cols-[12rem_1fr]">
      <div class="flex flex-col gap-2">
        <div class="h-32 rounded-md border" :style="{ background: rows[1]!.v }" />
        <div class="text-sm">{{ $t('tools.color-converter.contrast') }}: {{ contrastRatio(color, W) }}:1 {{ $t('tools.color-converter.onWhite') }}</div>
        <div class="text-sm">{{ $t('tools.color-converter.contrast') }}: {{ contrastRatio(color, K) }}:1 {{ $t('tools.color-converter.onBlack') }}</div>
      </div>
      <div class="flex flex-col">
        <div v-for="r in rows" :key="r.f" class="flex items-center gap-3 border-b py-2">
          <span class="text-muted-foreground w-16 text-sm uppercase">{{ r.f }}</span>
          <code class="flex-1 font-mono">{{ r.v }}</code>
          <CopyButton :text="r.v" :label="false" />
        </div>
      </div>
    </div>
  </div>
</template>
