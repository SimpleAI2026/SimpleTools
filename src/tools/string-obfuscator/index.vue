<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TextIO from '@/components/shared/TextIO.vue'
import { obfuscateLines } from './logic'

const SAMPLE = 'ada@example.com'
const input = ref(SAMPLE)
const keepStart = ref(1)
const keepEnd = ref(4)
const mask = ref('•')
const output = computed(() => obfuscateLines(input.value, { keepStart: keepStart.value, keepEnd: keepEnd.value, mask: mask.value || '•' }))
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE">
    <Label class="flex items-center gap-2 text-xs">{{ $t('tools.string-obfuscator.keepStart') }}<Input v-model.number="keepStart" type="number" min="0" class="w-20" /></Label>
    <Label class="flex items-center gap-2 text-xs">{{ $t('tools.string-obfuscator.keepEnd') }}<Input v-model.number="keepEnd" type="number" min="0" class="w-20" /></Label>
    <Label class="flex items-center gap-2 text-xs">{{ $t('tools.string-obfuscator.mask') }}<Input v-model="mask" class="w-20" /></Label>
  </TextIO>
</template>
