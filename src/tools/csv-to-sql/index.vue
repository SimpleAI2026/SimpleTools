<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { csvToSql, type CsvToSqlOptions } from './logic'

const SAMPLE = 'id,name,email,active,joined\n1,Alice,alice@example.com,true,2026-01-15\n2,Bob,,false,2026-02-01\n3,"Lee, Ann",ann@example.com,true,2026-03-09'
const input = ref(SAMPLE)
const o = reactive<CsvToSqlOptions>({ table: 'users', flavor: 'mysql', createTable: true, batchSize: 100, emptyAsNull: true })
const result = computed(() => {
  try {
    return { out: csvToSql(input.value, { ...o, batchSize: Number(o.batchSize) || 1 }), err: '' }
  } catch (e) {
    return { out: '', err: (e as Error).message }
  }
})
</script>

<template>
  <TextIO v-model="input" :output="result.out" :error="result.err" :sample="SAMPLE">
    <Label for="tbl">{{ $t('tools.csv-to-sql.table') }}</Label>
    <Input id="tbl" v-model="o.table" class="w-36 font-mono" />
    <ModeToggle v-model="o.flavor" :options="[['mysql', 'MySQL'], ['postgresql', 'PostgreSQL'], ['sqlite', 'SQLite'], ['sqlserver', 'SQL Server']]" />
    <Label><Switch v-model="o.createTable" /> {{ $t('tools.csv-to-sql.createTable') }}</Label>
    <Label><Switch v-model="o.emptyAsNull" /> {{ $t('tools.csv-to-sql.emptyAsNull') }}</Label>
    <Label for="batch">{{ $t('tools.csv-to-sql.batch') }}</Label>
    <Input id="batch" v-model.number="o.batchSize" type="number" min="1" class="w-24" />
  </TextIO>
</template>
