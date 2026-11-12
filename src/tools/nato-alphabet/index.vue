<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import { toNato } from './logic'

const SAMPLE = 'SimpleTools 2026'
const input = ref(SAMPLE)
const output = computed(() => toNato(input.value))
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE" />
</template>
