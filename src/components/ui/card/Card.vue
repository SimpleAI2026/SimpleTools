<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div :class="cn('rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col gap-6 py-6', props.class)">
    <slot />
  </div>
</template>
