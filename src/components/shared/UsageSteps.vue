<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ slug: string }>()
const { t, te } = useI18n()

const steps = computed(() => {
  const out: string[] = []
  for (let i = 1; i <= 3; i++) {
    const key = `tools.${props.slug}.step${i}`
    if (!te(key)) break
    out.push(t(key))
  }
  return out
})
</script>

<template>
  <section v-if="steps.length === 3" class="rounded-lg border p-4" data-testid="usage-steps">
    <h2 class="text-sm font-semibold">{{ t(`tools.${slug}.usageTitle`) }}</h2>
    <ol class="mt-3 flex flex-col gap-3 md:flex-row md:items-start">
      <li v-for="(step, index) in steps" :key="index" class="flex min-w-0 flex-1 gap-2">
        <span class="bg-primary text-primary-foreground mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">{{ index + 1 }}</span>
        <span class="min-w-0 text-sm leading-6">{{ step }}</span>
        <span v-if="index < steps.length - 1" class="text-muted-foreground hidden self-center px-1 md:inline" aria-hidden="true">→</span>
      </li>
    </ol>
  </section>
</template>
