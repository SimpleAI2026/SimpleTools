<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { ipv4RangeToCidrs } from './logic'

const { t } = useI18n()
const start = ref('10.0.0.0')
const end = ref('10.0.1.255')
const cidrs = computed(() => ipv4RangeToCidrs(start.value, end.value))
const text = computed(() => cidrs.value?.join('\n') ?? '')
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.ipv4-range-expander.start') }}<Input v-model="start" class="font-mono" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.ipv4-range-expander.end') }}<Input v-model="end" class="font-mono" /></Label>
    </div>
    <ErrorAlert v-if="(start || end) && !cidrs" :message="t('tools.ipv4-range-expander.invalid')" />
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono" data-testid="tool-output">{{ text || '—' }}</pre>
    </section>
  </div>
</template>
