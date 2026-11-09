<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { useAsyncOutput } from '@/lib/useAsyncOutput'
import { minifyHtml } from '@/tools/html-minifier/logic'
import { formatHtml } from './logic'

const SAMPLE = '<div class="card"><h2>Title</h2><ul><li>One</li><li>Two</li></ul><style>.card{padding:8px}</style></div>'
const input = ref(SAMPLE)
const mode = ref<'format' | 'minify'>('format')
const tab = ref(2)
const width = ref(100)
const vue = ref(false)
const { output, error } = useAsyncOutput([input, mode, tab, width, vue], () =>
  mode.value === 'minify' ? minifyHtml(input.value) : formatHtml(input.value, tab.value, Number(width.value) || 80, vue.value),
)
</script>

<template>
  <TextIO v-model="input" :output="output" :error="error" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['format', $t('tools.html-formatter.format')], ['minify', $t('tools.html-formatter.minify')]]" />
    <template v-if="mode === 'format'">
      <span class="text-sm">{{ $t('tools.html-formatter.indent') }}</span>
      <ModeToggle v-model="tab" :options="[[2, '2'], [4, '4']]" />
      <Label for="w">{{ $t('tools.html-formatter.width') }}</Label>
      <Input id="w" v-model.number="width" type="number" class="w-20" />
      <Label><Switch v-model="vue" /> {{ $t('tools.html-formatter.vue') }}</Label>
    </template>
  </TextIO>
</template>
