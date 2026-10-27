<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<{ id?: string; class?: HTMLAttributes['class'] }>()
const model = defineModel<boolean>({ default: false })
</script>

<template>
  <SwitchRoot
    :id="props.id"
    v-model="model"
    :class="cn('peer inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input', props.class)"
  >
    <SwitchThumb class="pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0" />
  </SwitchRoot>
</template>
