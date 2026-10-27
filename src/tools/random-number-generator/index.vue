<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { generateNumbers, validateRng, type RngOptions } from './logic'

const o = reactive<RngOptions>({ min: 1, max: 100, count: 10, unique: false, sort: 'none', decimals: 0 })
const nums = ref<number[]>([])
const err = computed(() => validateRng({ ...o, min: Number(o.min), max: Number(o.max), count: Number(o.count), decimals: Number(o.decimals) }))
function run() {
  nums.value = err.value ? [] : generateNumbers({ ...o, min: Number(o.min), max: Number(o.max), count: Number(o.count), decimals: Number(o.decimals) })
}
watch(o, run, { immediate: true })
const text = computed(() => nums.value.join('\n'))
const fields = ['min', 'max', 'count', 'decimals'] as const
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="f in fields" :key="f" class="flex flex-col gap-2">
        <Label :for="f">{{ $t(`tools.random-number-generator.${f}`) }}</Label>
        <Input :id="f" v-model.number="o[f]" type="number" :min="f === 'decimals' ? 0 : undefined" :max="f === 'decimals' ? 6 : undefined" />
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <Label><Switch v-model="o.unique" /> {{ $t('tools.random-number-generator.unique') }}</Label>
      <ModeToggle v-model="o.sort" :options="[['none', $t('tools.random-number-generator.none')], ['asc', $t('tools.random-number-generator.asc')], ['desc', $t('tools.random-number-generator.desc')]]" />
      <div class="ml-auto flex gap-2">
        <Button size="sm" :disabled="!!err" @click="run"><RefreshCw /> {{ $t('common.generate') }}</Button>
        <CopyButton :text="text" />
      </div>
    </div>
    <ErrorAlert v-if="err" :message="$t(`tools.random-number-generator.errors.${err}`)" />
    <div v-else-if="nums.length === 1" class="py-6 text-center text-6xl font-bold tabular-nums">{{ nums[0] }}</div>
    <Textarea v-else :model-value="text" readonly class="bg-muted/40 min-h-[500px] min-h-[500px] h-[500px]" />
  </div>
</template>
