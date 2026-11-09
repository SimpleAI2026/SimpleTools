<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <span :class="cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap', props.class)">
    <slot />
  </span>
</template>
