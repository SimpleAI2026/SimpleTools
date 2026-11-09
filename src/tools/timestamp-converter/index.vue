<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIntervalFn } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { describeDate, parseDateString, parseTimestamp, type TsUnit } from './logic'

const { locale } = useI18n()
const now = ref(new Date())
useIntervalFn(() => (now.value = new Date()), 1000)
const SAMPLE_TS = '1700000000'
const SAMPLE_ISO = '2023-11-14T22:13:20.000Z'
const tsInput = ref(String(Math.floor(Date.now() / 1000)))
const unit = ref<TsUnit | 'auto'>('auto')
const dateInput = ref(new Date().toISOString())
const zones = ['UTC', 'Asia/Shanghai', 'Asia/Tokyo', 'Europe/London', 'Europe/Berlin', 'America/New_York', 'America/Los_Angeles']
const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const timeZone = ref(localZone)
const zoneOptions = [...new Set([localZone, ...zones])]

const fromTs = computed(() => {
  const d = parseTimestamp(tsInput.value, unit.value)
  return d ? describeDate(d, locale.value, timeZone.value, now.value) : null
})
const fromDate = computed(() => {
  const d = parseDateString(dateInput.value)
  return d ? describeDate(d, locale.value, timeZone.value, now.value) : null
})
const rows = ['seconds', 'milliseconds', 'iso', 'utc', 'local', 'relative'] as const
function loadSample() {
  tsInput.value = SAMPLE_TS
  unit.value = 'seconds'
  dateInput.value = SAMPLE_ISO
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-3 rounded-lg border p-3 text-sm">
      <span class="font-medium">{{ $t('tools.timestamp-converter.now') }}:</span>
      <code class="font-mono">{{ Math.floor(now.getTime() / 1000) }}</code>
      <CopyButton :text="String(Math.floor(now.getTime() / 1000))" :label="false" />
      <span class="ml-auto flex items-center gap-2">
        <Label for="tz">{{ $t('tools.timestamp-converter.timeZone') }}</Label>
        <select id="tz" v-model="timeZone" class="bg-background h-8 rounded-md border px-2">
          <option v-for="z in zoneOptions" :key="z" :value="z">{{ z }}</option>
        </select>
      </span>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <section class="flex flex-col gap-3">
        <Label for="ts">{{ $t('tools.timestamp-converter.timestamp') }}</Label>
        <Input id="ts" v-model="tsInput" class="font-mono" />
        <div class="flex gap-2">
          <Button v-for="u in ['auto', 'seconds', 'milliseconds'] as const" :key="u" size="sm" :variant="unit === u ? 'secondary' : 'ghost'" @click="unit = u">
            {{ $t(`tools.timestamp-converter.${u}`) }}
          </Button>
        </div>
        <ErrorAlert v-if="!fromTs" :message="$t('tools.timestamp-converter.invalid')" />
        <dl v-else class="flex flex-col gap-1 text-sm">
          <div v-for="r in rows" :key="r" class="flex items-center gap-2 border-b py-1">
            <dt class="text-muted-foreground w-28 shrink-0">{{ $t(`tools.timestamp-converter.${r}`) }}</dt>
            <dd class="min-w-0 flex-1 font-mono break-all">{{ fromTs[r] }}</dd>
            <CopyButton :text="String(fromTs[r])" :label="false" />
          </div>
        </dl>
      </section>
      <section class="flex flex-col gap-3">
        <Label for="date">{{ $t('tools.timestamp-converter.date') }}</Label>
        <Input id="date" v-model="dateInput" class="font-mono" :placeholder="$t('tools.timestamp-converter.datePlaceholder')" />
        <div class="h-8"></div>
        <ErrorAlert v-if="!fromDate" :message="$t('tools.timestamp-converter.invalid')" />
        <dl v-else class="flex flex-col gap-1 text-sm">
          <div v-for="r in rows" :key="r" class="flex items-center gap-2 border-b py-1">
            <dt class="text-muted-foreground w-28 shrink-0">{{ $t(`tools.timestamp-converter.${r}`) }}</dt>
            <dd class="min-w-0 flex-1 font-mono break-all">{{ fromDate[r] }}</dd>
            <CopyButton :text="String(fromDate[r])" :label="false" />
          </div>
        </dl>
      </section>
    </div>
  </div>
</template>
