<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ min?: number; max?: number; step?: number; class?: HTMLAttributes['class'] }>(), {
  min: 0,
  max: 100,
  step: 1,
  class: undefined,
})
const model = defineModel<number[]>({ default: () => [0] })
</script>

<template>
  <SliderRoot
    v-model="model"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :class="cn('relative flex w-full touch-none items-center select-none', props.class)"
  >
    <SliderTrack class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
      <SliderRange class="absolute h-full bg-primary" />
    </SliderTrack>
    <SliderThumb
      v-for="(_, i) in model"
      :key="i"
      class="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm transition-[color,box-shadow] hover:ring-4 hover:ring-ring/50 focus-visible:ring-4 focus-visible:ring-ring/50 focus-visible:outline-hidden"
    />
  </SliderRoot>
</template>
