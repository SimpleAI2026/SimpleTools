<script setup lang="ts">
import { computed, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { formatXml, minifyXml } from './logic'

const SAMPLE = '<?xml version="1.0" encoding="UTF-8"?><catalog><book id="1"><title>Vue</title><price>29.9</price></book><book id="2"><title>Vite</title></book></catalog>'
const input = ref(SAMPLE)
const mode = ref<'format' | 'minify'>('format')
const indent = ref<'2' | '4' | 'tab'>('2')
const removeComments = ref(false)
const result = computed(() => {
  if (!input.value.trim()) return { out: '', err: '' }
  try {
    const ind = indent.value === 'tab' ? '\t' : ' '.repeat(Number(indent.value))
    const out = mode.value === 'minify' ? minifyXml(input.value, removeComments.value) : formatXml(input.value, { indent: ind, removeComments: removeComments.value })
    return { out, err: '' }
  } catch (e) {
    return { out: '', err: (e as Error).message }
  }
})
</script>

<template>
  <TextIO v-model="input" :output="result.out" :error="result.err" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['format', $t('tools.xml-formatter.format')], ['minify', $t('tools.xml-formatter.minify')]]" />
    <template v-if="mode === 'format'">
      <span class="text-sm">{{ $t('tools.xml-formatter.indent') }}</span>
      <ModeToggle v-model="indent" :options="[['2', '2'], ['4', '4'], ['tab', 'Tab']]" />
    </template>
    <Label><Switch v-model="removeComments" /> {{ $t('tools.xml-formatter.removeComments') }}</Label>
    <span v-if="result.out" class="text-xs text-green-600">✓ {{ $t('tools.xml-formatter.valid') }}</span>
  </TextIO>
</template>
