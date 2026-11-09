<script setup lang="ts" generic="D extends string">
import { computed } from 'vue'
import { ArrowLeftRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import ModeToggle from './ModeToggle.vue'
import TextIO from './TextIO.vue'

/**
 * Two-way text converter: a direction toggle plus TextIO. `convert` throws on invalid input.
 * The swap button feeds the current output back as input and flips the direction.
 */
const props = defineProps<{
  directions: readonly (readonly [D, string])[]
  convert: (input: string, dir: D) => string
  placeholder?: string
  sample?: string
}>()
const input = defineModel<string>({ required: true })
const dir = defineModel<D>('dir', { required: true })
const result = computed(() => {
  if (!input.value.trim()) return { out: '', err: '' }
  try {
    return { out: props.convert(input.value, dir.value), err: '' }
  } catch (e) {
    return { out: '', err: e instanceof Error ? e.message : String(e) }
  }
})
function swap() {
  if (props.directions.length !== 2 || !result.value.out) return
  const next = props.directions.find(([d]) => d !== dir.value)![0]
  input.value = result.value.out
  dir.value = next
}
</script>

<template>
  <TextIO v-model="input" :output="result.out" :error="result.err" :placeholder="placeholder" :sample="sample">
    <ModeToggle v-model="dir" :options="directions" />
    <Button v-if="directions.length === 2" size="sm" variant="ghost" :disabled="!result.out" @click="swap"><ArrowLeftRight /> {{ $t('common.swap') }}</Button>
    <slot />
  </TextIO>
</template>
