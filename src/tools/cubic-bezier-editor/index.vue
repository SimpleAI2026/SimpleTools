<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Play } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CssOutput from '@/components/shared/CssOutput.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { BEZIER_PRESETS, formatBezier, parseBezier, type Bezier } from './logic'

const b = ref<Bezier>([0.34, 1.56, 0.64, 1])
const text = ref(formatBezier(b.value))
const invalid = ref(false)
const duration = ref(1)
const playing = ref(false)
const value = computed(() => formatBezier(b.value))
watch(value, (v) => (text.value = v))
function onText(v: string | number | undefined) {
  text.value = String(v ?? '')
  const p = parseBezier(text.value)
  invalid.value = !p
  if (p) b.value = p
}

// SVG coordinates: 0..1 mapped into a 200x200 box with room for overshoot
const S = 200
const PAD = 60
const toX = (x: number) => PAD + x * S
const toY = (y: number) => PAD + (1 - y) * S
const path = computed(() => `M${toX(0)},${toY(0)} C${toX(b.value[0])},${toY(b.value[1])} ${toX(b.value[2])},${toY(b.value[3])} ${toX(1)},${toY(1)}`)
const svg = ref<SVGSVGElement | null>(null)
const dragging = ref<0 | 1 | null>(null)
function onMove(e: PointerEvent) {
  if (dragging.value === null || !svg.value) return
  const rect = svg.value.getBoundingClientRect()
  const k = (S + PAD * 2) / rect.width
  const x = Math.min(1, Math.max(0, ((e.clientX - rect.left) * k - PAD) / S))
  const y = Math.min(2, Math.max(-1, 1 - ((e.clientY - rect.top) * k - PAD) / S))
  const nb = [...b.value] as Bezier
  nb[dragging.value * 2] = Math.round(x * 100) / 100
  nb[dragging.value * 2 + 1] = Math.round(y * 100) / 100
  b.value = nb
}
function play() {
  playing.value = false
  requestAnimationFrame(() => requestAnimationFrame(() => (playing.value = true)))
}
const css = computed(() => `transition-timing-function: ${value.value};\nanimation-timing-function: ${value.value};`)
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="flex flex-col items-center gap-2">
      <svg
        ref="svg"
        :viewBox="`0 0 ${S + PAD * 2} ${S + PAD * 2}`"
        class="w-full max-w-md touch-none rounded-md border select-none"
        @pointermove="onMove"
        @pointerup="dragging = null"
        @pointerleave="dragging = null"
      >
        <rect :x="PAD" :y="PAD" :width="S" :height="S" class="fill-muted/40 stroke-border" />
        <line :x1="toX(0)" :y1="toY(0)" :x2="toX(1)" :y2="toY(1)" class="stroke-muted-foreground/40" stroke-dasharray="4" />
        <line :x1="toX(0)" :y1="toY(0)" :x2="toX(b[0])" :y2="toY(b[1])" class="stroke-pink-500" />
        <line :x1="toX(1)" :y1="toY(1)" :x2="toX(b[2])" :y2="toY(b[3])" class="stroke-sky-500" />
        <path :d="path" class="stroke-foreground" fill="none" stroke-width="3" />
        <circle :cx="toX(b[0])" :cy="toY(b[1])" r="8" class="cursor-grab fill-pink-500" @pointerdown="dragging = 0" />
        <circle :cx="toX(b[2])" :cy="toY(b[3])" r="8" class="cursor-grab fill-sky-500" @pointerdown="dragging = 1" />
      </svg>
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <Input :model-value="text" class="font-mono" :aria-label="$t('tools.cubic-bezier-editor.input')" @update:model-value="onText" />
        <span v-if="invalid" class="text-destructive text-xs">{{ $t('tools.cubic-bezier-editor.invalid') }}</span>
      </div>
      <div class="flex flex-wrap gap-1">
        <Button v-for="(p, k) in BEZIER_PRESETS" :key="k" size="sm" variant="outline" @click="b = [...p]">{{ k }}</Button>
      </div>
      <RangeField v-model="duration" :label="$t('tools.cubic-bezier-editor.duration')" :min="0.2" :max="5" :step="0.1" unit="s" />
      <Button class="self-start" @click="play"><Play /> {{ $t('tools.cubic-bezier-editor.play') }}</Button>
      <div class="flex flex-col gap-3 rounded-md border p-4">
        <div class="relative h-8">
          <div class="absolute top-0 size-8 rounded bg-indigo-500" :style="{ left: playing ? 'calc(100% - 2rem)' : '0', transition: playing ? `left ${duration}s ${value}` : 'none' }" />
        </div>
        <div class="relative h-8">
          <div class="bg-muted-foreground/50 absolute top-0 size-8 rounded" :style="{ left: playing ? 'calc(100% - 2rem)' : '0', transition: playing ? `left ${duration}s linear` : 'none' }" />
        </div>
        <span class="text-muted-foreground text-xs">{{ $t('tools.cubic-bezier-editor.compare') }}</span>
      </div>
      <CssOutput :code="css" />
    </div>
  </div>
</template>
