<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DialogClose, type DialogCloseProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<DialogCloseProps & { class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DialogClose v-bind="props" :class="cn(props.class)">
    <slot />
  </DialogClose>
</template>
