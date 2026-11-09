<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { cidrInfo, parseCidr, splitSubnets, type CidrInfo } from './logic'

const SAMPLE = '192.168.1.10/24'
const input = ref(SAMPLE)
const parsed = computed(() => parseCidr(input.value))
const info = computed(() => (parsed.value ? cidrInfo(parsed.value.ip, parsed.value.prefix) : null))
const sub = ref([26])
const subnets = computed(() => (parsed.value ? splitSubnets(parsed.value.ip, parsed.value.prefix, sub.value[0] ?? 26) : []))
const keys = ['network', 'broadcast', 'netmask', 'wildcard', 'prefix', 'firstHost', 'lastHost', 'totalAddresses', 'usableHosts', 'ipClass', 'isPrivate'] as (keyof CidrInfo)[]

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <Input v-model="input" class="max-w-md font-mono" :placeholder="$t('tools.cidr-calculator.input')" />
    <ErrorAlert v-if="!info" :message="$t('tools.cidr-calculator.invalid')" />
    <template v-else>
      <div class="grid gap-x-6 sm:grid-cols-2">
        <div v-for="k in keys" :key="k" class="flex items-center gap-2 border-b py-1.5 text-sm">
          <span class="text-muted-foreground w-28">{{ $t(`tools.cidr-calculator.fields.${k}`) }}</span>
          <code class="flex-1 font-mono">{{ typeof info[k] === 'boolean' ? (info[k] ? $t('tools.cidr-calculator.yes') : $t('tools.cidr-calculator.no')) : info[k].toLocaleString() }}</code>
          <CopyButton :text="String(info[k])" :label="false" />
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <Label>{{ $t('tools.cidr-calculator.subnets', { n: sub[0] }) }}</Label>
        <Slider v-model="sub" :min="info.prefix" :max="32" class="max-w-md" />
        <div class="grid max-h-60 grid-cols-2 gap-1 overflow-auto font-mono text-xs sm:grid-cols-4">
          <span v-for="s in subnets" :key="s">{{ s }}</span>
        </div>
      </div>
    </template>
  </div>
</template>
