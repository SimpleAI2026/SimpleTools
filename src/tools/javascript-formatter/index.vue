<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { useAsyncOutput } from '@/lib/useAsyncOutput'
import { formatJs, type JsLang } from './logic'

const SAMPLE = 'const greet=(name)=>{if(!name){return "hi"}return `hello ${name}`};\nexport default {greet,version:1}'
const input = ref(SAMPLE)
const lang = ref<JsLang>('babel')
const o = reactive({ tabWidth: 2, semi: true, singleQuote: false, printWidth: 80 })
const { output, error } = useAsyncOutput([input, lang, o], () => formatJs(input.value, lang.value, { ...o, printWidth: Number(o.printWidth) || 80 }))
</script>

<template>
  <TextIO v-model="input" :output="output" :error="error" :sample="SAMPLE">
    <ModeToggle v-model="lang" :options="[['babel', 'JavaScript'], ['typescript', 'TypeScript']]" />
    <span class="text-sm">{{ $t('tools.javascript-formatter.indent') }}</span>
    <ModeToggle v-model="o.tabWidth" :options="[[2, '2'], [4, '4']]" />
    <Label><Switch v-model="o.semi" /> {{ $t('tools.javascript-formatter.semi') }}</Label>
    <Label><Switch v-model="o.singleQuote" /> {{ $t('tools.javascript-formatter.singleQuote') }}</Label>
    <Label for="pw">{{ $t('tools.javascript-formatter.width') }}</Label>
    <Input id="pw" v-model.number="o.printWidth" type="number" class="w-20" />
  </TextIO>
</template>
