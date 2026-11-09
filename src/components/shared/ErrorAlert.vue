<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'

defineProps<{ message: string }>()
</script>

<template>
  <div role="alert" class="border-destructive/40 text-destructive flex items-start gap-2 rounded-md border px-3 py-2 text-sm">
    <CircleAlert class="mt-0.5 size-4 shrink-0" />
    <span>{{ message }}</span>
  </div>
</template>
