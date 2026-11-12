<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import { decodeSafelinks } from './logic'

const SAMPLE = 'https://nam12.safelinks.protection.outlook.com/?url=https%3A%2F%2Fexample.com%2Fa&data=05'
const input = ref(SAMPLE)
const output = computed(() => decodeSafelinks(input.value))
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE" />
</template>
