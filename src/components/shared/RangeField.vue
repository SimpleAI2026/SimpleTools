<script setup lang="ts">
/** Labelled range slider with a synced number box. */
withDefaults(defineProps<{ label: string; min?: number; max?: number; step?: number; unit?: string }>(), { min: 0, max: 100, step: 1, unit: '' })
const model = defineModel<number>({ required: true })
function set(v: string) {
  const n = Number(v)
  if (Number.isFinite(n)) model.value = n
}
</script>

<template>
  <label class="flex items-center gap-3 text-sm">
    <span class="w-28 shrink-0">{{ label }}</span>
    <input type="range" class="accent-primary min-w-0 flex-1" :min="min" :max="max" :step="step" :value="model" @input="set(($event.target as HTMLInputElement).value)" />
    <input
      type="number"
      class="border-input bg-background h-8 w-20 rounded-md border px-2 text-right font-mono"
      :step="step"
      :value="model"
      @change="set(($event.target as HTMLInputElement).value)"
    />
    <span v-if="unit" class="text-muted-foreground w-6">{{ unit }}</span>
  </label>
</template>
