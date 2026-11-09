<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ConvertIO from '@/components/shared/ConvertIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { csvToJson, jsonToCsv } from './logic'

const { t } = useI18n()
const SAMPLE = 'id,name,active\n1,Alice,true\n2,Bob,false'
const input = ref(SAMPLE)
const dir = ref<'toJson' | 'toCsv'>('toJson')
const o = reactive({ header: true, inferTypes: true, indent: 2, delimiter: ',' })
const convert = (s: string, d: 'toJson' | 'toCsv') => (d === 'toJson' ? csvToJson(s, o) : jsonToCsv(s, o.delimiter))
</script>

<template>
  <ConvertIO v-model="input" v-model:dir="dir" :directions="[['toJson', t('tools.csv-json.toJson')], ['toCsv', t('tools.csv-json.toCsv')]]" :convert="convert" :sample="SAMPLE">
    <template v-if="dir === 'toJson'">
      <Label><Switch v-model="o.header" /> {{ $t('tools.csv-json.header') }}</Label>
      <Label><Switch v-model="o.inferTypes" /> {{ $t('tools.csv-json.inferTypes') }}</Label>
    </template>
    <template v-else>
      <span class="text-sm">{{ $t('tools.csv-json.delimiter') }}</span>
      <ModeToggle v-model="o.delimiter" :options="[[',', ','], [';', ';'], ['\t', 'Tab']]" />
    </template>
  </ConvertIO>
</template>
