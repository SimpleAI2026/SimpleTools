<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import TextIO from '@/components/shared/TextIO.vue'
import { evaluateMath, type AngleMode } from './logic'

const { t } = useI18n()
const SAMPLE = 'sin(pi/2) + sqrt(9) * 2'
const input = ref(SAMPLE)
const angle = ref<AngleMode>('rad')
const result = computed(() => evaluateMath(input.value, angle.value))
const output = computed(() => (result.value.ok ? result.value.formatted : ''))
const error = computed(() => {
  if (result.value.ok || result.value.error === 'empty') return ''
  return t(`tools.math-evaluator.errors.${result.value.error}`, { detail: result.value.detail ?? '' })
})
</script>

<template>
  <TextIO v-model="input" :output="output" :error="error" :sample="SAMPLE">
    <Button size="sm" :variant="angle === 'rad' ? 'default' : 'outline'" @click="angle = 'rad'">{{ $t('tools.math-evaluator.rad') }}</Button>
    <Button size="sm" :variant="angle === 'deg' ? 'default' : 'outline'" @click="angle = 'deg'">{{ $t('tools.math-evaluator.deg') }}</Button>
  </TextIO>
</template>
