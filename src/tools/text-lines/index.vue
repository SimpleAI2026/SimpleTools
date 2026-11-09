<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { LINE_OPS, processLines, type LineOp, type LineOptions } from './logic'

const SAMPLE = 'banana\napple\nCherry\napple\n\nitem10\nitem2'
const input = ref(SAMPLE)
const op = ref<LineOp>('sortAsc')
const o = reactive<LineOptions>({ caseInsensitive: false, prefix: '- ', suffix: '', filter: '', invertFilter: false })
const seed = ref(0)
const out = computed(() => (seed.value, processLines(input.value, op.value, o)))
</script>

<template>
  <div class="flex flex-col gap-3">
    <ModeToggle v-model="op" :options="LINE_OPS.map((k) => [k, $t(`tools.text-lines.ops.${k}`)] as const)" @update:model-value="seed++" />
    <div class="flex flex-wrap items-center gap-3">
      <Label><Switch v-model="o.caseInsensitive" /> {{ $t('tools.text-lines.caseInsensitive') }}</Label>
      <template v-if="op === 'addPrefix'">
        <Input v-model="o.prefix" :placeholder="$t('tools.text-lines.prefix')" class="w-32" />
        <Input v-model="o.suffix" :placeholder="$t('tools.text-lines.suffix')" class="w-32" />
      </template>
      <template v-if="op === 'filter'">
        <Input v-model="o.filter" :placeholder="$t('tools.text-lines.filter')" class="w-48" />
        <Label><Switch v-model="o.invertFilter" /> {{ $t('tools.text-lines.invert') }}</Label>
      </template>
      <span class="text-muted-foreground ml-auto text-xs">{{ $t('tools.text-lines.lines', { n: out.split('\n').length }) }}</span>
    </div>
    <TextIO v-model="input" :output="out" :sample="SAMPLE" />
  </div>
</template>
