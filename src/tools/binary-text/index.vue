<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { bytesToText, textToBytes, type Radix } from './logic'

const { t } = useI18n()
const mode = ref<'enc' | 'dec'>('enc')
const radix = ref<Radix>(2)
const SAMPLE = 'Hello'
const input = ref(SAMPLE)
const res = computed(() => {
  if (mode.value === 'enc') return { out: textToBytes(input.value, radix.value), err: '' }
  try {
    return { out: bytesToText(input.value, radix.value), err: '' }
  } catch (e) {
    return { out: '', err: t('tools.binary-text.invalid', { token: e instanceof Error ? e.message : '' }) }
  }
})
</script>

<template>
  <TextIO v-model="input" :output="res.out" :error="res.err" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['enc', $t('tools.binary-text.toBytes')], ['dec', $t('tools.binary-text.toText')]]" />
    <ModeToggle v-model="radix" :options="[[2, 'BIN'], [8, 'OCT'], [10, 'DEC'], [16, 'HEX']]" />
  </TextIO>
</template>
