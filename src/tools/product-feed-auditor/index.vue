<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import IssueList, { type AuditIssue } from '@/components/shared/IssueList.vue'
import { downloadText } from '@/lib/download'
import { present } from './logic'

const example = 'id,title,price,currency,gtin,item_group_id,ai_source\nSKU-1,Classic hat,19.99,USD,96385074,HAT,human\nSKU-1,Classic hat,19.99,USD,96385075,HAT,model\n'
const input = ref(example)
const report = computed(() => {
  if (!input.value.trim()) return null
  const presented = present(input.value)
  if (presented.error || !presented.jsonText) return { error: presented.error || 'bad-input', data: null, json: '', csv: '' }
  const data = (JSON.parse(presented.jsonText) as { result: { products: number; ai_columns: string[]; issues: AuditIssue[] } }).result
  return { error: '', data, json: presented.jsonText, csv: presented.csv }
})
async function importFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) input.value = await file.text()
  ;(event.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.product-feed-auditor.disclaimer') }}</p>
    <div class="flex flex-wrap items-center gap-2">
      <label class="inline-flex min-h-10 cursor-pointer items-center rounded-md border px-3 text-sm hover:bg-accent">{{ $t('common.importFile') }}<input type="file" class="sr-only" accept=".csv,.tsv,text/csv,text/tab-separated-values" @change="importFile" /></label>
      <Button variant="outline" @click="input = example">{{ $t('common.sample') }}</Button>
      <Button variant="outline" @click="input = ''">{{ $t('common.clear') }}</Button>
    </div>
    <Textarea v-model="input" class="!h-48 !min-h-48 font-mono text-xs" :placeholder="$t('tools.product-feed-auditor.feedHint')" data-testid="feed-input" />
    <ErrorAlert v-if="report?.error" :message="$t('common.badInput')" />
    <template v-if="report?.data">
      <div class="flex flex-wrap gap-4 text-sm">
        <span>{{ $t('tools.product-feed-auditor.products') }}: <strong>{{ report.data.products }}</strong></span>
        <span v-if="report.data.ai_columns.length">AI: <code>{{ report.data.ai_columns.join(', ') }}</code></span>
      </div>
      <IssueList :issues="report.data.issues" />
      <div class="flex flex-wrap gap-2">
        <Button variant="secondary" @click="downloadText(report.csv, 'feed-issues.csv', 'text/csv;charset=utf-8')">{{ $t('common.downloadCsv') }}</Button>
        <Button variant="secondary" @click="downloadText(report.json, 'feed-audit.json', 'application/json')">{{ $t('common.downloadJson') }}</Button>
      </div>
    </template>
  </div>
</template>
