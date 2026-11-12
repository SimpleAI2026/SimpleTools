<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import { numeronyms } from './logic'

const SAMPLE = 'internationalization\nkubernetes\naccessibility'
const input = ref(SAMPLE)
const output = computed(() => numeronyms(input.value))
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE" />
</template>
