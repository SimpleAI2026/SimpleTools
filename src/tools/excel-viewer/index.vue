<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import SheetTable from '@/components/shared/SheetTable.vue'
import { SPREADSHEET_ACCEPT } from '@/lib/excel'
import { loadSampleExcel } from '@/lib/sampleExcel'
import { useSpreadsheet } from '@/lib/useSpreadsheet'
import { filterRows, sheetStats } from './logic'

const { sheets, active, sheet, fileName, error, busy, load } = useSpreadsheet()
async function loadSample() {
  await load(await loadSampleExcel())
}
const query = ref('')
const header = ref(true)
const rows = computed(() => (sheet.value ? filterRows(sheet.value.rows, query.value, header.value) : []))
const stats = computed(() => sheetStats(sheet.value?.rows ?? []))
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="SPREADSHEET_ACCEPT" :label="$t('tools.excel-viewer.drop')" @file="load" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" :disabled="busy" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <span v-if="busy" class="text-sm">{{ $t('common.processing') }}</span>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="sheet">
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-sm font-medium">{{ fileName }}</span>
        <ModeToggle v-if="sheets.length > 1" v-model="active" :options="sheets.map((s, i) => [i, s.name] as const)" />
        <Input v-model="query" class="w-56" :placeholder="$t('tools.excel-viewer.search')" />
        <Label><Switch v-model="header" /> {{ $t('tools.excel-viewer.header') }}</Label>
        <span class="text-muted-foreground text-xs">{{ $t('tools.excel-viewer.stats', stats) }}</span>
      </div>
      <SheetTable :rows="rows" :header="header" />
    </template>
  </div>
</template>
