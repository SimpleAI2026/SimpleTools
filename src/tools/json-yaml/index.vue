<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConvertIO from '@/components/shared/ConvertIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { jsonToYaml, yamlToJson } from './logic'

const { t } = useI18n()
const SAMPLE = '{\n  "name": "simple-tools",\n  "version": "1.0.0",\n  "scripts": { "dev": "vite" },\n  "tags": ["vue", "vite"]\n}'
const input = ref(SAMPLE)
const dir = ref<'toYaml' | 'toJson'>('toYaml')
const indent = ref(2)
const convert = (s: string, d: 'toYaml' | 'toJson') => (d === 'toYaml' ? jsonToYaml(s, indent.value) : yamlToJson(s, indent.value))
</script>

<template>
  <ConvertIO v-model="input" v-model:dir="dir" :directions="[['toYaml', t('tools.json-yaml.toYaml')], ['toJson', t('tools.json-yaml.toJson')]]" :convert="convert" :sample="SAMPLE">
    <span class="text-sm">{{ $t('tools.json-yaml.indent') }}</span>
    <ModeToggle v-model="indent" :options="[[2, '2'], [4, '4']]" />
  </ConvertIO>
</template>
