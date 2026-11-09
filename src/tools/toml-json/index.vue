<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConvertIO from '@/components/shared/ConvertIO.vue'
import { jsonToToml, tomlToJson } from './logic'

const { t } = useI18n()
const SAMPLE = '[package]\nname = "simple-tools"\nversion = "1.0.0"\n\n[dependencies]\nvue = "^3.5"\n\n[[bin]]\nname = "cli"\npath = "src/main.rs"\n'
const input = ref(SAMPLE)
const dir = ref<'toJson' | 'toToml'>('toJson')
const convert = (s: string, d: 'toJson' | 'toToml') => (d === 'toJson' ? tomlToJson(s) : jsonToToml(s))
</script>

<template>
  <ConvertIO v-model="input" v-model:dir="dir" :directions="[['toJson', t('tools.toml-json.toJson')], ['toToml', t('tools.toml-json.toToml')]]" :convert="convert" :sample="SAMPLE" />
</template>
