<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Plus, Shuffle, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CssOutput from '@/components/shared/CssOutput.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import RangeField from '@/components/shared/RangeField.vue'
import { gradientCss, gradientValue, insertStop, randomGradient, type GradientState } from './logic'

const g = reactive<GradientState>({
  type: 'linear',
  angle: 135,
  shape: 'circle',
  cx: 50,
  cy: 50,
  repeating: false,
  stops: [
    { color: '#6366f1', opacity: 1, pos: 0 },
    { color: '#ec4899', opacity: 1, pos: 50 },
    { color: '#f59e0b', opacity: 1, pos: 100 },
  ],
})
const css = computed(() => gradientCss(g))
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <ModeToggle
          v-model="g.type"
          :options="[['linear', $t('tools.gradient-generator.linear')], ['radial', $t('tools.gradient-generator.radial')], ['conic', $t('tools.gradient-generator.conic')]]"
        />
        <Label><Switch v-model="g.repeating" /> {{ $t('tools.gradient-generator.repeating') }}</Label>
        <Button size="sm" variant="outline" @click="g.stops = randomGradient()"><Shuffle /> {{ $t('tools.gradient-generator.random') }}</Button>
      </div>
      <RangeField v-if="g.type !== 'radial'" v-model="g.angle" :label="$t('tools.gradient-generator.angle')" :max="360" unit="°" />
      <template v-if="g.type !== 'linear'">
        <ModeToggle v-if="g.type === 'radial'" v-model="g.shape" :options="[['circle', $t('tools.gradient-generator.circle')], ['ellipse', $t('tools.gradient-generator.ellipse')]]" />
        <RangeField v-model="g.cx" :label="$t('tools.gradient-generator.cx')" unit="%" />
        <RangeField v-model="g.cy" :label="$t('tools.gradient-generator.cy')" unit="%" />
      </template>
      <h3 class="text-sm font-medium">{{ $t('tools.gradient-generator.stops') }}</h3>
      <div v-for="(s, i) in g.stops" :key="i" class="flex items-center gap-2 rounded-md border p-2">
        <input v-model="s.color" type="color" class="h-8 w-10 shrink-0 cursor-pointer rounded border" />
        <div class="flex flex-1 flex-col gap-1">
          <RangeField v-model="s.pos" :label="$t('tools.gradient-generator.position')" unit="%" />
          <RangeField v-model="s.opacity" :label="$t('tools.gradient-generator.opacity')" :max="1" :step="0.01" />
        </div>
        <Button size="icon" variant="ghost" :disabled="g.stops.length <= 2" :aria-label="$t('common.remove')" @click="g.stops.splice(i, 1)"><Trash2 /></Button>
      </div>
      <div><Button size="sm" variant="outline" @click="g.stops = insertStop(g.stops)"><Plus /> {{ $t('common.add') }}</Button></div>
    </div>
    <div class="flex flex-col gap-3">
      <div class="h-80 rounded-md border" :style="{ background: gradientValue(g) }" />
      <CssOutput :code="css" />
    </div>
  </div>
</template>
