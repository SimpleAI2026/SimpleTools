<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import FileDropzone from '@/components/shared/FileDropzone.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { SPREADSHEET_ACCEPT } from '@/lib/excel'
import { downloadText } from '@/lib/download'
import { loadSampleExcel } from '@/lib/sampleExcel'
import { useSpreadsheet } from '@/lib/useSpreadsheet'
import { workbookToJson, type JsonExportOptions } from './logic'

const { sheets, active, sheet, baseName, error, load } = useSpreadsheet()
async function loadSample() {
  await load(await loadSampleExcel())
}
const o = reactive<JsonExportOptions>({ header: true, inferTypes: true, skipEmpty: true })
const all = ref(false)
const json = computed(() => (sheet.value ? workbookToJson(all.value ? sheets.value : [sheet.value], o) : ''))
</script>

<template>
  <div class="flex flex-col gap-4">
    <FileDropzone :accept="SPREADSHEET_ACCEPT" :label="$t('tools.excel-to-json.drop')" @file="load" />
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <template v-if="sheet">
      <div class="flex flex-wrap items-center gap-3">
        <ModeToggle v-if="!all" v-model="active" :options="sheets.map((s, i) => [i, s.name] as const)" />
        <Label v-if="sheets.length > 1"><Switch v-model="all" /> {{ $t('tools.excel-to-json.allSheets') }}</Label>
        <Label><Switch v-model="o.header" /> {{ $t('tools.excel-to-json.header') }}</Label>
        <Label><Switch v-model="o.inferTypes" /> {{ $t('tools.excel-to-json.inferTypes') }}</Label>
        <Label><Switch v-model="o.skipEmpty" /> {{ $t('tools.excel-to-json.skipEmpty') }}</Label>
        <CopyButton :text="json" />
        <Button variant="outline" @click="downloadText(json, `${baseName}.json`, 'application/json')"><Download /> {{ $t('tools.excel-to-json.download') }}</Button>
      </div>
      <Textarea :model-value="json.length > 500000 ? json.slice(0, 500000) + '\n…' : json" readonly class="bg-muted/40 min-h-[500px] font-mono min-h-[500px] h-[500px]" data-testid="tool-output" />
    </template>
  </div>
</template>
