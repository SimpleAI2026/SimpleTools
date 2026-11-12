<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { diffJson, formatDiff, parseJsonSide } from './logic'

const { t } = useI18n()
const left = ref('{\n  "name": "SimpleTools",\n  "version": 1,\n  "tags": ["offline"]\n}')
const right = ref('{\n  "name": "SimpleTools",\n  "version": 2,\n  "tags": ["offline", "i18n"]\n}')

const result = computed(() => {
  const a = parseJsonSide(left.value)
  const b = parseJsonSide(right.value)
  if (!a.ok) return { error: a.message, text: '', count: 0 }
  if (!b.ok) return { error: b.message, text: '', count: 0 }
  const changes = diffJson(a.value, b.value)
  return { error: '', text: changes.length ? formatDiff(changes) : t('tools.json-diff.same'), count: changes.length }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.json-diff.note') }}</p>
    <div class="grid gap-4 lg:grid-cols-2">
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.json-diff.left') }}
        <Textarea v-model="left" class="min-h-48 font-mono text-xs" spellcheck="false" data-testid="json-diff-left" />
      </Label>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.json-diff.right') }}
        <Textarea v-model="right" class="min-h-48 font-mono text-xs" spellcheck="false" />
      </Label>
    </div>
    <ErrorAlert v-if="result.error" :message="result.error === 'empty' ? $t('tools.json-diff.empty') : result.error" />
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }} <span v-if="!result.error" class="text-muted-foreground font-normal">({{ result.count }})</span></Label>
        <CopyButton :text="result.error ? '' : result.text" />
      </div>
      <pre class="bg-muted/40 min-h-40 overflow-auto rounded-md border p-3 font-mono text-xs break-all whitespace-pre-wrap" data-testid="tool-output">{{ result.error ? '' : result.text }}</pre>
    </section>
  </div>
</template>
