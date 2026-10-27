<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConvertIO from '@/components/shared/ConvertIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { htmlToMarkdown, markdownToHtml, type TurndownOptions } from './logic'

const { t } = useI18n()
const SAMPLE = '<h2>Release notes</h2>\n<p>This version adds <strong>dark mode</strong> and <a href="https://example.com">docs</a>.</p>\n<ul><li>Faster build</li><li>Smaller bundle</li></ul>\n<pre><code>yarn build</code></pre>'
const input = ref(SAMPLE)
const dir = ref<'toMd' | 'toHtml'>('toMd')
const o = reactive<TurndownOptions>({ headingStyle: 'atx', bulletListMarker: '-', codeBlockStyle: 'fenced' })
const convert = (s: string, d: 'toMd' | 'toHtml') => (d === 'toMd' ? htmlToMarkdown(s, o) : markdownToHtml(s))
</script>

<template>
  <ConvertIO v-model="input" v-model:dir="dir" :directions="[['toMd', t('tools.html-markdown.toMd')], ['toHtml', t('tools.html-markdown.toHtml')]]" :convert="convert" :sample="SAMPLE">
    <template v-if="dir === 'toMd'">
      <span class="text-sm">{{ $t('tools.html-markdown.heading') }}</span>
      <ModeToggle v-model="o.headingStyle" :options="[['atx', '#'], ['setext', '===']]" />
      <span class="text-sm">{{ $t('tools.html-markdown.bullet') }}</span>
      <ModeToggle v-model="o.bulletListMarker" :options="[['-', '-'], ['*', '*'], ['+', '+']]" />
      <span class="text-sm">{{ $t('tools.html-markdown.code') }}</span>
      <ModeToggle v-model="o.codeBlockStyle" :options="[['fenced', '```'], ['indented', '⇥']]" />
    </template>
  </ConvertIO>
</template>
