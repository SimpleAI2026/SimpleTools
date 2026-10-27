<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { decodeBase32, encodeBase32 } from './logic'

const { t } = useI18n()
const mode = ref<'encode' | 'decode'>('encode')
const padding = ref(true)
const SAMPLE = 'Hello, 世界'
const input = ref(SAMPLE)
const res = computed(() => {
  if (mode.value === 'encode') return { out: encodeBase32(input.value, padding.value), err: '' }
  try {
    return { out: decodeBase32(input.value), err: '' }
  } catch {
    return { out: '', err: t('tools.base32.invalid') }
  }
})
</script>

<template>
  <TextIO v-model="input" :output="res.out" :error="res.err" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['encode', $t('common.encode')], ['decode', $t('common.decode')]]" />
    <Label v-if="mode === 'encode'"><Switch v-model="padding" /> {{ $t('tools.base32.padding') }}</Label>
  </TextIO>
</template>
