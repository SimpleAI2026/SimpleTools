<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { flipText, mirrorText } from './logic'

const SAMPLE = 'Hello, world!'
const input = ref(SAMPLE)
const mode = ref<'flip' | 'mirror'>('flip')
const out = computed(() => (mode.value === 'flip' ? flipText(input.value) : mirrorText(input.value)))
</script>

<template>
  <TextIO v-model="input" :output="out" :mono="false" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['flip', $t('tools.upside-down-text.flip')], ['mirror', $t('tools.upside-down-text.mirror')]]" />
  </TextIO>
</template>
