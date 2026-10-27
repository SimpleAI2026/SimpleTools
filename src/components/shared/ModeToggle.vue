<script setup lang="ts" generic="T extends string | number">
import { Button } from '@/components/ui/button'

/** Segmented button group bound to v-model; `options` are [value, label] pairs. */
defineProps<{ options: readonly (readonly [T, string])[] }>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="inline-flex flex-wrap gap-1">
    <Button v-for="[v, label] in options" :key="String(v)" size="sm" :variant="model === v ? 'default' : 'outline'" @click="model = v">
      {{ label }}
    </Button>
  </div>
</template>
