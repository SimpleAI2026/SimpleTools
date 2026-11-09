<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import { convertRoman } from './logic'

const SAMPLE = '2026\n1994\nMMXXVI\nXLII'
const input = ref(SAMPLE)
const out = computed(() =>
  input.value
    .split('\n')
    .map((l) => {
      if (!l.trim()) return ''
      try {
        return convertRoman(l)
      } catch (e) {
        return `⚠ ${(e as Error).message}`
      }
    })
    .join('\n'),
)
</script>

<template>
  <TextIO v-model="input" :output="out" :placeholder="$t('tools.roman-numerals.hint')" :sample="SAMPLE" />
</template>
