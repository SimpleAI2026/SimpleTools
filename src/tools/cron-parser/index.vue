<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { explainCron, nextRuns, type Lang } from './logic'

const { locale } = useI18n()
const SAMPLE = '*/15 9-17 * * 1-5'
const expr = ref(SAMPLE)
const count = ref(10)
const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
const tz = ref(localTz)
const presets = ['* * * * *', '0 * * * *', '0 0 * * *', '0 9 * * 1-5', '0 0 1 * *', '@weekly']
const result = computed(() => {
  try {
    const lang: Lang = locale.value.startsWith('zh') ? 'zh' : 'en'
    const fields = explainCron(expr.value, lang)
    const runs = nextRuns(expr.value, Math.min(50, Math.max(1, Number(count.value) || 1)), new Date(), tz.value || undefined)
    const fmt = new Intl.DateTimeFormat(locale.value, { dateStyle: 'full', timeStyle: 'medium', timeZone: tz.value || undefined })
    return { fields, runs: runs.map((d) => fmt.format(d)), err: '' }
  } catch (e) {
    return { fields: [], runs: [], err: (e as Error).message }
  }
})

function loadSample() {
  expr.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-end gap-3">
      <div class="flex min-w-60 flex-1 flex-col gap-1.5">
        <Label for="cron">{{ $t('tools.cron-parser.input') }}</Label>
        <Input id="cron" v-model="expr" class="font-mono text-lg" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="tz">{{ $t('tools.cron-parser.tz') }}</Label>
        <Input id="tz" v-model="tz" class="w-48" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="cnt">{{ $t('tools.cron-parser.count') }}</Label>
        <Input id="cnt" v-model.number="count" type="number" min="1" max="50" class="w-20" />
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-1">
      <span class="text-muted-foreground mr-1 text-sm">{{ $t('tools.cron-parser.presets') }}</span>
      <Button v-for="p in presets" :key="p" size="sm" variant="outline" class="font-mono" @click="expr = p">{{ p }}</Button>
    </div>
    <ErrorAlert v-if="result.err" :message="result.err" />
    <template v-else>
      <div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <div v-for="f in result.fields" :key="f.kind" class="rounded-md border p-2">
          <div class="text-muted-foreground text-xs">{{ $t(`tools.cron-parser.fields.${f.kind}`) }}</div>
          <div class="font-mono font-semibold">{{ f.value }}</div>
          <div class="text-sm">{{ f.text }}</div>
        </div>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-medium">{{ $t('tools.cron-parser.next') }}</h3>
        <ol class="list-decimal space-y-1 pl-6 font-mono text-sm">
          <li v-for="(r, i) in result.runs" :key="i">{{ r }}</li>
        </ol>
      </div>
    </template>
  </div>
</template>
