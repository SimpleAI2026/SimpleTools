<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { downloadText } from '@/lib/download'
import { present } from './logic'

interface UtmReport {
  links: { id: string; url: string; issues: string }[]
  issues: { id: string; code: string; detail: string }[]
}

const defaults = {
  utm_source: 'newsletter',
  utm_medium: 'email',
  utm_campaign: 'spring-sale',
  utm_term: '',
  utm_content: '',
}
const urls = ref('https://example.com/landing?lang=zh#details')
const fields = reactive({ ...defaults })
const onDuplicate = ref<'overwrite' | 'keep' | 'error'>('overwrite')

const report = computed(() => {
  const links = urls.value.split(/\r?\n/).map((url) => url.trim()).filter(Boolean)
  if (!links.length) return null
  const result = present(JSON.stringify({ onDuplicate: onDuplicate.value, links: links.map((url, index) => ({ id: String(index + 1), url, ...fields })) }))
  if (result.error || !result.jsonText) return { error: result.error || 'bad-input', data: null, csv: '' }
  return { error: '', data: (JSON.parse(result.jsonText) as { result: UtmReport }).result, csv: result.csv }
})

function sample() {
  urls.value = 'https://example.com/landing?lang=zh#details'
  Object.assign(fields, defaults)
  onDuplicate.value = 'overwrite'
}
function clear() {
  urls.value = ''
  for (const key of Object.keys(fields) as (keyof typeof fields)[]) fields[key] = ''
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <p class="text-muted-foreground text-sm">{{ $t('tools.utm-builder.disclaimer') }}</p>
    <div class="flex flex-col gap-2">
      <Label for="utm-urls">{{ $t('tools.utm-builder.urls') }}</Label>
      <Textarea id="utm-urls" v-model="urls" class="!h-32 !min-h-32 font-mono text-xs" :placeholder="$t('tools.utm-builder.urlsHint')" data-testid="utm-urls" />
    </div>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Label v-for="key in ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const" :key="key" class="flex flex-col items-start gap-2 text-xs">
        {{ key }}<span v-if="['utm_source', 'utm_medium', 'utm_campaign'].includes(key)" class="text-destructive">*</span>
        <Input v-model="fields[key]" :data-testid="key" />
      </Label>
    </div>
    <Label class="flex max-w-md flex-col items-start gap-2 text-sm">
      {{ $t('tools.utm-builder.duplicatePolicy') }}
      <select v-model="onDuplicate" class="border-input bg-background h-10 rounded-md border px-3">
        <option value="overwrite">{{ $t('tools.utm-builder.overwrite') }}</option>
        <option value="keep">{{ $t('tools.utm-builder.keep') }}</option>
        <option value="error">{{ $t('tools.utm-builder.flag') }}</option>
      </select>
    </Label>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" @click="sample">{{ $t('common.sample') }}</Button>
      <Button variant="outline" @click="clear">{{ $t('common.clear') }}</Button>
      <Button v-if="report?.data" variant="secondary" @click="downloadText(report.csv, 'utm-links.csv', 'text/csv;charset=utf-8')">{{ $t('common.downloadCsv') }}</Button>
    </div>
    <ErrorAlert v-if="report?.error" :message="$t('common.badInput')" />
    <section v-if="report?.data" class="flex flex-col gap-3" aria-live="polite">
      <h3 class="text-sm font-medium">{{ $t('tools.utm-builder.generatedLinks') }} ({{ report.data.links.length }})</h3>
      <div v-for="link in report.data.links" :key="link.id" class="flex flex-col gap-2 rounded-md border p-3">
        <div class="flex items-start gap-2">
          <Input :model-value="link.url" readonly class="font-mono text-xs" :data-testid="`utm-result-${link.id}`" />
          <CopyButton v-if="link.url" :text="link.url" />
        </div>
        <p v-if="link.issues" class="text-xs text-amber-700 dark:text-amber-400">{{ link.issues.split('|').join(' · ') }}</p>
      </div>
    </section>
  </div>
</template>
