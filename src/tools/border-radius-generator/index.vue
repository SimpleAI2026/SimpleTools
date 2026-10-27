<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CssOutput from '@/components/shared/CssOutput.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { borderRadiusCss, borderRadiusValue, CORNERS, type Corner, type RadiusState } from './logic'

const { t } = useI18n()
const s = reactive<RadiusState>({
  h: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 },
  v: { topLeft: 24, topRight: 24, bottomRight: 24, bottomLeft: 24 },
  elliptical: false,
  unit: 'px',
})
const linked = ref(true)
const max = computed(() => (s.unit === '%' ? 50 : 200))
function setCorner(axis: 'h' | 'v', c: Corner, v: number) {
  if (linked.value) for (const k of CORNERS) s[axis][k] = v
  else s[axis][c] = v
}
const css = computed(() => borderRadiusCss(s))
const label = (c: Corner, axis: 'h' | 'v') => `${t(`tools.border-radius-generator.corners.${c}`)}${s.elliptical ? ` · ${t(`tools.border-radius-generator.${axis === 'h' ? 'horizontal' : 'vertical'}`)}` : ''}`
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <ModeToggle v-model="s.unit" :options="[['px', 'px'], ['%', '%']]" />
        <Label><Switch v-model="linked" /> {{ $t('tools.border-radius-generator.linked') }}</Label>
        <Label><Switch v-model="s.elliptical" /> {{ $t('tools.border-radius-generator.elliptical') }}</Label>
      </div>
      <template v-for="c in CORNERS" :key="c">
        <RangeField :model-value="s.h[c]" :label="label(c, 'h')" :max="max" :unit="s.unit" @update:model-value="setCorner('h', c, $event)" />
        <RangeField v-if="s.elliptical" :model-value="s.v[c]" :label="label(c, 'v')" :max="max" :unit="s.unit" @update:model-value="setCorner('v', c, $event)" />
      </template>
      <CssOutput :code="css" />
    </div>
    <div class="flex min-h-[500px] items-center justify-center rounded-md border p-6 min-h-[500px] h-[500px]">
      <div class="size-56 bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg" :style="{ borderRadius: borderRadiusValue(s) }" />
    </div>
  </div>
</template>
