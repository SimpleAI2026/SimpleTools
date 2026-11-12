<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import { parsePhone } from './logic'

const SAMPLE = '+44 20 7183 8750'
const input = ref(SAMPLE)
const output = computed(() => {
  const phone = parsePhone(input.value)
  if (!phone) return ''
  return [`e164: ${phone.e164}`, `international: ${phone.international}`, `national: ${phone.national}`, `country: ${phone.country}`, `type: ${phone.type || '—'}`, `valid: ${phone.valid}`].join('\n')
})
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE" />
</template>
