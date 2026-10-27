<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CssOutput from '@/components/shared/CssOutput.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { boxShadowCss, boxShadowValue, defaultLayer, SHADOW_PRESETS, type ShadowLayer } from './logic'

const layers = ref<ShadowLayer[]>(SHADOW_PRESETS.layered!.map((l) => ({ ...l })))
const bg = ref('#f4f4f5')
const css = computed(() => boxShadowCss(layers.value))
const presetKeys = Object.keys(SHADOW_PRESETS)
const applyPreset = (k: string) => (layers.value = SHADOW_PRESETS[k]!.map((l) => ({ ...l })))
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center gap-1">
        <span class="text-muted-foreground mr-1 text-sm">{{ $t('tools.box-shadow-generator.presets') }}</span>
        <Button v-for="k in presetKeys" :key="k" size="sm" variant="outline" @click="applyPreset(k)">{{ $t(`tools.box-shadow-generator.preset.${k}`) }}</Button>
      </div>
      <div v-for="(l, i) in layers" :key="i" class="flex flex-col gap-2 rounded-md border p-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ $t('tools.box-shadow-generator.layer', { n: i + 1 }) }}</span>
          <div class="flex items-center gap-3">
            <Label><Switch v-model="l.inset" /> {{ $t('tools.box-shadow-generator.inset') }}</Label>
            <input v-model="l.color" type="color" class="h-8 w-10 cursor-pointer rounded border" :aria-label="$t('tools.box-shadow-generator.color')" />
            <Button size="icon" variant="ghost" :aria-label="$t('common.remove')" @click="layers.splice(i, 1)"><Trash2 /></Button>
          </div>
        </div>
        <RangeField v-model="l.x" :label="$t('tools.box-shadow-generator.x')" :min="-100" :max="100" unit="px" />
        <RangeField v-model="l.y" :label="$t('tools.box-shadow-generator.y')" :min="-100" :max="100" unit="px" />
        <RangeField v-model="l.blur" :label="$t('tools.box-shadow-generator.blur')" :max="200" unit="px" />
        <RangeField v-model="l.spread" :label="$t('tools.box-shadow-generator.spread')" :min="-100" :max="100" unit="px" />
        <RangeField v-model="l.opacity" :label="$t('tools.box-shadow-generator.opacity')" :max="1" :step="0.01" />
      </div>
      <div><Button size="sm" variant="outline" @click="layers.push(defaultLayer())"><Plus /> {{ $t('common.add') }}</Button></div>
      <CssOutput :code="css" />
    </div>
    <div class="flex flex-col gap-2">
      <Label class="self-end">{{ $t('tools.box-shadow-generator.background') }} <input v-model="bg" type="color" class="h-7 w-9 rounded border" /></Label>
      <div class="flex min-h-[500px] flex-1 items-center justify-center rounded-md border p-10 min-h-[500px] h-[500px]" :style="{ background: bg }">
        <div class="size-48 rounded-xl bg-white" :style="{ boxShadow: boxShadowValue(layers) }" />
      </div>
    </div>
  </div>
</template>
