<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { convertCssUnit, CSS_UNITS, DEFAULT_CONTEXT, fmt, type CssContext, type CssUnit } from './logic'

const value = ref(16)
const from = ref<CssUnit>('px')
const ctx = reactive<CssContext>({ ...DEFAULT_CONTEXT })
function loadSample() {
  value.value = 16
  from.value = 'px'
  Object.assign(ctx, DEFAULT_CONTEXT)
}
const rows = computed(() => CSS_UNITS.map((u) => ({ u, v: `${fmt(convertCssUnit(Number(value.value) || 0, from.value, u, ctx))}${u}` })))
const ctxKeys = Object.keys(DEFAULT_CONTEXT) as (keyof CssContext)[]
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_18rem]">
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
      </div>
      <div class="flex gap-2">
        <Input v-model.number="value" type="number" class="font-mono" :aria-label="$t('tools.css-unit-converter.value')" />
        <select v-model="from" class="border-input bg-background h-9 rounded-md border px-2" :aria-label="$t('tools.css-unit-converter.from')">
          <option v-for="u in CSS_UNITS" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>
      <div class="grid gap-x-6 sm:grid-cols-2">
        <div v-for="r in rows" :key="r.u" class="flex items-center gap-2 border-b py-1.5">
          <span class="text-muted-foreground w-12 text-sm">{{ r.u }}</span>
          <code class="flex-1 font-mono">{{ r.v }}</code>
          <CopyButton :text="r.v" :label="false" />
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-2 rounded-md border p-3">
      <h3 class="text-sm font-medium">{{ $t('tools.css-unit-converter.context') }}</h3>
      <Label v-for="k in ctxKeys" :key="k" class="flex items-center justify-between gap-2 text-xs">
        {{ $t(`tools.css-unit-converter.${k}`) }}
        <Input v-model.number="ctx[k]" type="number" class="h-8 w-24" />
      </Label>
    </div>
  </div>
</template>
