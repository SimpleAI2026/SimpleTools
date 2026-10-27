<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import { COMMON_PX, convertCss, pxToRem, remToPx } from './logic'

const base = ref(16)
const px = ref(24)
const rem = ref(1.5)
const b = computed(() => Number(base.value) || 16)
const SAMPLE = '.card {\n  padding: 24px 16px;\n  font-size: 14px;\n  border: 1px solid;\n}'
const css = ref(SAMPLE)
const keepSmall = ref(true)
const cssOut = computed(() => convertCss(css.value, b.value, keepSmall.value))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="grid gap-3 sm:grid-cols-3">
      <div class="flex flex-col gap-2"><Label for="base">{{ $t('tools.px-rem.base') }}</Label><Input id="base" v-model.number="base" type="number" min="1" /></div>
      <div class="flex flex-col gap-2"><Label for="px">px</Label><Input id="px" v-model.number="px" type="number" @input="rem = pxToRem(Number(px), b)" /></div>
      <div class="flex flex-col gap-2"><Label for="rem">rem</Label><Input id="rem" v-model.number="rem" type="number" step="0.125" @input="px = remToPx(Number(rem), b)" /></div>
    </div>
    <div>
      <h3 class="mb-2 text-sm font-medium">{{ $t('tools.px-rem.table') }}</h3>
      <div class="grid grid-cols-3 gap-1 font-mono text-xs sm:grid-cols-6">
        <span v-for="p in COMMON_PX" :key="p" class="rounded border px-2 py-1">{{ p }}px = {{ pxToRem(p, b) }}rem</span>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <h3 class="text-sm font-medium">{{ $t('tools.px-rem.css') }}</h3>
      <TextIO v-model="css" :output="cssOut" :sample="SAMPLE"><Label><Switch v-model="keepSmall" /> {{ $t('tools.px-rem.keepSmall') }}</Label></TextIO>
    </div>
  </div>
</template>
