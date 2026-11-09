<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { CATEGORIES, convertUnit, formatNumber, unitsOf, type Category } from './logic'

const { t } = useI18n()
const cat = ref<Category>('length')
const value = ref(1)
const from = ref('m')
watch(cat, (c) => (from.value = c === 'temperature' ? '°C' : unitsOf(c).includes('m') ? 'm' : unitsOf(c)[0]!))
const catOptions = computed(() => CATEGORIES.map((c) => [c, t(`tools.unit-converter.categories.${c}`)] as const))
const rows = computed(() => unitsOf(cat.value).map((u) => ({ u, v: formatNumber(convertUnit(Number(value.value) || 0, from.value, u, cat.value)) })))
</script>

<template>
  <div class="flex flex-col gap-4">
    <ModeToggle v-model="cat" :options="catOptions" />
    <div class="flex max-w-md gap-2">
      <Input v-model.number="value" type="number" class="font-mono" :aria-label="$t('tools.unit-converter.value')" />
      <select v-model="from" class="border-input bg-background h-9 rounded-md border px-2" :aria-label="$t('tools.unit-converter.from')">
        <option v-for="u in unitsOf(cat)" :key="u" :value="u">{{ u }}</option>
      </select>
    </div>
    <div class="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="r in rows" :key="r.u" class="flex items-center gap-2 border-b py-1.5" :class="r.u === from ? 'font-semibold' : ''">
        <span class="text-muted-foreground w-16 text-sm">{{ r.u }}</span>
        <code class="flex-1 font-mono break-all">{{ r.v }}</code>
        <CopyButton :text="r.v" :label="false" />
      </div>
    </div>
  </div>
</template>
