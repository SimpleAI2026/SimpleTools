<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import IssueList, { type AuditIssue } from '@/components/shared/IssueList.vue'
import { downloadText } from '@/lib/download'
import HreflangRowEditor from './HreflangRow.vue'
import { present } from './logic'

interface PageRow { url: string; lang: string; alternates: string }
const example: PageRow[] = [
  { url: 'https://example.com/en/', lang: 'en', alternates: 'https://example.com/en/|https://example.com/de/' },
  { url: 'https://example.com/de/', lang: 'de', alternates: 'https://example.com/de/' },
]
const rows = ref<PageRow[]>(example.map((row) => ({ ...row })))
const report = computed(() => {
  const pages = rows.value.filter((row) => row.url.trim() || row.lang.trim() || row.alternates.trim())
  if (!pages.length) return null
  const presented = present(JSON.stringify({ rows: pages }))
  if (presented.error || !presented.jsonText) return { error: presented.error || 'bad-input', data: null, json: '', csv: '' }
  return { error: '', data: (JSON.parse(presented.jsonText) as { result: { pages: number; issues: AuditIssue[] } }).result, json: presented.jsonText, csv: presented.csv }
})
function addRow() { rows.value.push({ url: '', lang: '', alternates: '' }) }
function sample() { rows.value = example.map((row) => ({ ...row })) }
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.hreflang-map-auditor.disclaimer') }}</p>
    <p class="text-muted-foreground text-xs">{{ $t('tools.hreflang-map-auditor.alternatesHint') }}</p>
    <div class="flex flex-col gap-3">
      <HreflangRowEditor v-for="(row, index) in rows" :key="index" :row="row" :index="index" @update="Object.assign(row, $event)" @remove="rows.splice(index, 1)" />
    </div>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" @click="addRow">{{ $t('common.addRow') }}</Button>
      <Button variant="outline" @click="sample">{{ $t('common.sample') }}</Button>
      <Button variant="outline" @click="rows = []">{{ $t('common.clear') }}</Button>
    </div>
    <template v-if="report?.data">
      <IssueList :issues="report.data.issues" />
      <div class="flex flex-wrap gap-2"><Button variant="secondary" @click="downloadText(report.csv, 'hreflang-issues.csv', 'text/csv;charset=utf-8')">{{ $t('common.downloadCsv') }}</Button><Button variant="secondary" @click="downloadText(report.json, 'hreflang-audit.json', 'application/json')">{{ $t('common.downloadJson') }}</Button></div>
    </template>
  </div>
</template>
