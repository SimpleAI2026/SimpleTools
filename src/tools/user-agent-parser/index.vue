<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { formatUaReport, parseUserAgent } from './logic'

const { t } = useI18n()
const input = ref(typeof navigator === 'undefined' ? '' : navigator.userAgent)
const report = computed(() => parseUserAgent(input.value))
const labels = computed(() => ({
  browser: t('tools.user-agent-parser.browser'),
  browserVersion: t('tools.user-agent-parser.browserVersion'),
  engine: t('tools.user-agent-parser.engine'),
  engineVersion: t('tools.user-agent-parser.engineVersion'),
  os: t('tools.user-agent-parser.os'),
  osVersion: t('tools.user-agent-parser.osVersion'),
  deviceType: t('tools.user-agent-parser.deviceType'),
  deviceVendor: t('tools.user-agent-parser.deviceVendor'),
  deviceModel: t('tools.user-agent-parser.deviceModel'),
  cpu: t('tools.user-agent-parser.cpu'),
}))
const text = computed(() => formatUaReport(report.value, labels.value))
function useBrowser() {
  input.value = navigator.userAgent
}
const rows = computed(() => (Object.keys(labels.value) as (keyof typeof labels.value)[]).map((key) => ({ key, label: labels.value[key], value: report.value[key] || '—' })))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" @click="useBrowser">{{ $t('tools.user-agent-parser.current') }}</Button>
      <Button size="sm" variant="ghost" @click="input = ''">{{ $t('common.clear') }}</Button>
    </div>
    <Label class="flex flex-col items-start gap-2">
      {{ $t('tools.user-agent-parser.input') }}
      <Textarea v-model="input" class="min-h-28 font-mono text-xs" spellcheck="false" data-testid="ua-input" />
    </Label>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }}</Label>
        <CopyButton :text="text" />
      </div>
      <dl class="grid gap-2 sm:grid-cols-2" data-testid="tool-output">
        <div v-for="row in rows" :key="row.key" class="rounded-md border px-3 py-2">
          <dt class="text-muted-foreground text-xs">{{ row.label }}</dt>
          <dd class="font-medium break-all">{{ row.value }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
