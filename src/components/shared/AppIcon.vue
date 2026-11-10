<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{ class?: string }>(), { class: '' })
const src = `${import.meta.env.BASE_URL}favicon.svg`
</script>

<template>
  <img :src="src" alt="" :class="cn('size-4 shrink-0', props.class)" decoding="async" />
</template>
