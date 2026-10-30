<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogTrigger, type DialogTriggerProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogTriggerProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogTrigger v-bind="props" :class="cn(props.class)">
    <slot />
  </DialogTrigger>
</template>
