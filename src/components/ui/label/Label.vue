<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Label, type LabelProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <Label :for="props.for" :class="cn('flex items-center gap-2 text-sm leading-none font-medium select-none', props.class)">
    <slot />
  </Label>
</template>
