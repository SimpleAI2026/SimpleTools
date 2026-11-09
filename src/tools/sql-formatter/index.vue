<script setup lang="ts">
import { reactive, ref } from 'vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import TextIO from '@/components/shared/TextIO.vue'
import { useAsyncOutput } from '@/lib/useAsyncOutput'
import { formatSql, minifySql, SQL_DIALECTS, type SqlOptions } from './logic'

const SAMPLE = "select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.created_at > '2026-01-01' group by u.id, u.name order by orders desc limit 10;"
const input = ref(SAMPLE)
const mode = ref<'format' | 'minify'>('format')
const o = reactive<SqlOptions>({ dialect: 'sql', keywordCase: 'upper', tabWidth: 2 })
const { output, error } = useAsyncOutput([input, mode, o], () => (mode.value === 'minify' ? minifySql(input.value) : formatSql(input.value, o)))
</script>

<template>
  <TextIO v-model="input" :output="output" :error="error" :sample="SAMPLE">
    <ModeToggle v-model="mode" :options="[['format', $t('tools.sql-formatter.format')], ['minify', $t('tools.sql-formatter.minify')]]" />
    <template v-if="mode === 'format'">
      <label class="flex items-center gap-2 text-sm">
        {{ $t('tools.sql-formatter.dialect') }}
        <select v-model="o.dialect" class="border-input bg-background h-8 rounded-md border px-2 text-sm">
          <option v-for="d in SQL_DIALECTS" :key="d" :value="d">{{ d }}</option>
        </select>
      </label>
      <span class="text-sm">{{ $t('tools.sql-formatter.keywordCase') }}</span>
      <ModeToggle
        v-model="o.keywordCase"
        :options="[['upper', $t('tools.sql-formatter.upper')], ['lower', $t('tools.sql-formatter.lower')], ['preserve', $t('tools.sql-formatter.preserve')]]"
      />
      <span class="text-sm">{{ $t('tools.sql-formatter.indent') }}</span>
      <ModeToggle v-model="o.tabWidth" :options="[[2, '2'], [4, '4']]" />
    </template>
  </TextIO>
</template>
