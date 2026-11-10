<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import IssueList, { type AuditIssue } from '@/components/shared/IssueList.vue'
import { downloadText } from '@/lib/download'
import RedirectRowEditor from './RedirectRow.vue'
import { present } from './logic'

interface RedirectRow { from: string; to: string; status: string }
const example: RedirectRow[] = [
  { from: 'https://example.com/old', to: 'https://example.com/new', status: '301' },
  { from: 'https://example.com/new', to: 'https://example.com/final', status: '301' },
]
const rows = ref<RedirectRow[]>(example.map((row) => ({ ...row })))
const report = computed(() => {
  const mappings = rows.value.filter((row) => row.from.trim() || row.to.trim())
  if (!mappings.length) return null
  const presented = present(JSON.stringify({ rows: mappings }))
  if (presented.error || !presented.jsonText) return { error: presented.error || 'bad-input', data: null, csv: '', map: '' }
  const data = (JSON.parse(presented.jsonText) as { result: { redirects: number; issues: AuditIssue[] } }).result
  return { error: '', data, csv: presented.csv, map: presented.files.find((file) => file.name === 'redirect-map.csv')?.text ?? '' }
})
function addRow() { rows.value.push({ from: '', to: '', status: '301' }) }
function sample() { rows.value = example.map((row) => ({ ...row })) }
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.redirect-migration-planner.disclaimer') }}</p>
    <div class="flex flex-col gap-3">
      <RedirectRowEditor v-for="(row, index) in rows" :key="index" :row="row" @update="Object.assign(row, $event)" @remove="rows.splice(index, 1)" />
    </div>
    <div class="flex flex-wrap gap-2"><Button variant="outline" @click="addRow">{{ $t('common.addRow') }}</Button><Button variant="outline" @click="sample">{{ $t('common.sample') }}</Button><Button variant="outline" @click="rows = []">{{ $t('common.clear') }}</Button></div>
    <template v-if="report?.data">
      <IssueList :issues="report.data.issues" />
      <div class="flex flex-wrap gap-2"><Button variant="secondary" @click="downloadText(report.map, 'redirect-map.csv', 'text/csv;charset=utf-8')">{{ $t('tools.redirect-migration-planner.downloadMap') }}</Button><Button variant="secondary" @click="downloadText(report.csv, 'redirect-issues.csv', 'text/csv;charset=utf-8')">{{ $t('common.downloadCsv') }}</Button></div>
    </template>
  </div>
</template>
