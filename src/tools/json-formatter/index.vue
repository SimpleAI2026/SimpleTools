<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { formatJson, minifyJson, type JsonResult } from './logic'

const { t } = useI18n()
const SAMPLE = '{"name":"SimpleTools","version":1,"tags":["vue","offline"],"nested":{"ok":true,"value":null}}'
const input = ref(SAMPLE)
const mode = ref<'format' | 'minify'>('format')
const indent = ref<2 | 4 | 'tab'>(2)
const sortKeys = ref(false)

const result = computed<JsonResult>(() =>
  mode.value === 'format' ? formatJson(input.value, indent.value, sortKeys.value) : minifyJson(input.value),
)
const errorText = computed(() => {
  const r = result.value
  if (r.ok) return ''
  if (r.message === 'empty') return t('tools.json-formatter.empty')
  const pos = r.line ? ` (${t('tools.json-formatter.errorAt', { line: r.line, column: r.column ?? 1 })})` : ''
  return `${r.message}${pos}`
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" :variant="mode === 'format' ? 'default' : 'outline'" @click="mode = 'format'">{{ $t('tools.json-formatter.format') }}</Button>
      <Button size="sm" :variant="mode === 'minify' ? 'default' : 'outline'" @click="mode = 'minify'">{{ $t('tools.json-formatter.minify') }}</Button>
      <template v-if="mode === 'format'">
        <span class="text-muted-foreground ml-2 text-sm">{{ $t('tools.json-formatter.indent') }}</span>
        <Button v-for="opt in [2, 4, 'tab'] as const" :key="opt" size="sm" :variant="indent === opt ? 'secondary' : 'ghost'" @click="indent = opt">
          {{ opt === 'tab' ? $t('tools.json-formatter.tab') : opt }}
        </Button>
        <Label class="ml-2"><Switch v-model="sortKeys" /> {{ $t('tools.json-formatter.sortKeys') }}</Label>
      </template>
      <div class="ml-auto flex gap-2">
        <Button size="sm" variant="ghost" @click="input = SAMPLE">{{ $t('common.sample') }}</Button>
        <Button size="sm" variant="ghost" @click="input = ''">{{ $t('common.clear') }}</Button>
      </div>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex min-h-0 flex-col gap-2">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label>{{ $t('common.input') }}</Label>
        </div>
        <Textarea v-model="input" class="min-h-[500px] h-[500px]" spellcheck="false" />
      </div>
      <div class="flex min-h-0 flex-col gap-2">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label>{{ $t('common.output') }}</Label>
          <CopyButton :text="result.ok ? result.output : ''" />
        </div>
        <Textarea :model-value="result.ok ? result.output : ''" readonly class="bg-muted/40 min-h-[500px] h-[500px]" />
      </div>
    </div>
    <ErrorAlert v-if="!result.ok" :message="errorText" />
    <p v-else class="text-sm text-emerald-600">✓ {{ $t('tools.json-formatter.valid') }}</p>
  </div>
</template>
