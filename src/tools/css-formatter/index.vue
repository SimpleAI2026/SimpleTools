<script setup lang="ts">
import { computed, ref } from 'vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { formatBytes } from '@/lib/format'
import { useAsyncOutput } from '@/lib/useAsyncOutput'
import { formatCss, minifyCss, type CssLang } from './logic'

const SAMPLE = '.card{display:flex;padding:8px 16px}\n.card:hover{box-shadow:0 1px 3px rgba(0,0,0,.2)}'
const input = ref(SAMPLE)
const mode = ref<'format' | 'minify'>('format')
const lang = ref<CssLang>('css')
const tab = ref(2)
const { output, error } = useAsyncOutput([input, mode, lang, tab], () =>
  mode.value === 'minify' ? minifyCss(input.value) : formatCss(input.value, lang.value, tab.value),
)
const size = (s: string) => formatBytes(new TextEncoder().encode(s).length)
const stats = computed(() => ({ from: size(input.value), to: size(output.value) }))
</script>

<template>
  <TextIO v-model="input" :output="output" :error="error" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['format', $t('tools.css-formatter.format')], ['minify', $t('tools.css-formatter.minify')]]" />
    <ModeToggle v-model="lang" :options="[['css', 'CSS'], ['scss', 'SCSS'], ['less', 'Less']]" />
    <template v-if="mode === 'format'">
      <span class="text-sm">{{ $t('tools.css-formatter.indent') }}</span>
      <ModeToggle v-model="tab" :options="[[2, '2'], [4, '4']]" />
    </template>
    <span class="text-muted-foreground text-xs">{{ $t('tools.css-formatter.saved', stats) }}</span>
  </TextIO>
</template>
