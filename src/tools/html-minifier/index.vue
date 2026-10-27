<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import { formatBytes } from '@/lib/format'
import { defaultHtmlMinify, minifyHtml } from './logic'

const SAMPLE = '<!DOCTYPE html>\n<html>\n  <head>\n    <!-- page styles -->\n    <style>\n      body { margin : 0 ; }\n    </style>\n  </head>\n  <body>\n    <h1>  Hello  </h1>\n  </body>\n</html>'
const input = ref(SAMPLE)
const o = reactive({ ...defaultHtmlMinify })
const output = computed(() => minifyHtml(input.value, o))
const len = (s: string) => new TextEncoder().encode(s).length
const stats = computed(() => {
  const a = len(input.value)
  const b = len(output.value)
  return { from: formatBytes(a), to: formatBytes(b), pct: a ? Math.round((1 - b / a) * 100) : 0 }
})
const keys = ['removeComments', 'collapseWhitespace', 'aggressive', 'minifyCss'] as const
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE">
    <Label v-for="k in keys" :key="k"><Switch v-model="o[k]" /> {{ $t(`tools.html-minifier.${k}`) }}</Label>
    <span class="text-muted-foreground text-xs">{{ $t('tools.html-minifier.saved', stats) }}</span>
  </TextIO>
</template>
