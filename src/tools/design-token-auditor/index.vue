<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import IssueList, { type AuditIssue } from '@/components/shared/IssueList.vue'
import { downloadText } from '@/lib/download'
import { present, SAMPLE } from './logic'

const input = ref(SAMPLE)
const report = computed(() => {
  if (!input.value.trim()) return null
  const presented = present(input.value)
  if (presented.error || !presented.jsonText) return { error: presented.error || 'bad-input', data: null, json: '', csv: '' }
  return { error: '', data: (JSON.parse(presented.jsonText) as { result: { tokenCount: number; issues: AuditIssue[] } }).result, json: presented.jsonText, csv: presented.csv }
})
async function importFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) input.value = await file.text()
  ;(event.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.design-token-auditor.disclaimer') }}</p>
    <div class="flex flex-wrap gap-2"><label class="inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm hover:bg-accent">{{ $t('common.importFile') }}<input type="file" class="sr-only" accept=".json,application/json" @change="importFile" /></label><Button variant="outline" @click="input = SAMPLE">{{ $t('common.sample') }}</Button><Button variant="outline" @click="input = ''">{{ $t('common.clear') }}</Button></div>
    <Textarea v-model="input" class="!h-56 !min-h-56 font-mono text-xs" spellcheck="false" data-testid="token-input" />
    <ErrorAlert v-if="report?.error" :message="$t('common.invalidJson')" />
    <template v-if="report?.data">
      <p class="text-sm">{{ $t('tools.design-token-auditor.tokenCount') }}: <strong>{{ report.data.tokenCount }}</strong></p>
      <IssueList :issues="report.data.issues" />
      <div class="flex flex-wrap gap-2"><Button variant="secondary" @click="downloadText(report.csv, 'token-issues.csv', 'text/csv;charset=utf-8')">{{ $t('common.downloadCsv') }}</Button><Button variant="secondary" @click="downloadText(report.json, 'token-audit.json', 'application/json')">{{ $t('common.downloadJson') }}</Button></div>
    </template>
  </div>
</template>
