<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ConvertIO from '@/components/shared/ConvertIO.vue'
import { jsonToXml, xmlToJson } from './logic'

const { t } = useI18n()
const SAMPLE = '{\n  "catalog": {\n    "book": [\n      { "@_id": "bk101", "title": "Vue in Action", "price": 39.9 },\n      { "@_id": "bk102", "title": "Vite Deep Dive", "price": 29.5 }\n    ]\n  }\n}'
const input = ref(SAMPLE)
const dir = ref<'toXml' | 'toJson'>('toXml')
const root = ref('root')
const convert = (s: string, d: 'toXml' | 'toJson') => (d === 'toXml' ? jsonToXml(s, root.value || 'root') : xmlToJson(s))
</script>

<template>
  <ConvertIO v-model="input" v-model:dir="dir" :directions="[['toXml', t('tools.json-xml.toXml')], ['toJson', t('tools.json-xml.toJson')]]" :convert="convert" :sample="SAMPLE">
    <template v-if="dir === 'toXml'">
      <Label for="root">{{ $t('tools.json-xml.root') }}</Label>
      <Input id="root" v-model="root" class="w-32 font-mono" />
    </template>
  </ConvertIO>
</template>
