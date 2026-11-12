<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import { parseIban } from './logic'

const SAMPLE = 'GB82 WEST 1234 5698 7654 32'
const input = ref(SAMPLE)
const output = computed(() => {
  const parsed = parseIban(input.value)
  if (!parsed) return ''
  return [`${parsed.formatted}`, `country: ${parsed.country}`, `check: ${parsed.checkDigits}`, `bban: ${parsed.bban}`, `valid: ${parsed.valid}`, `known-length: ${parsed.knownLength}`].join('\n')
})
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE" />
</template>
