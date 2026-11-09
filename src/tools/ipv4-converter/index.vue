<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { ipv4Formats, parseAnyIPv4 } from './logic'

const SAMPLE = '192.168.0.1'
const input = ref(SAMPLE)
const n = computed(() => parseAnyIPv4(input.value))
const f = computed(() => (n.value === null ? null : ipv4Formats(n.value)))

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <Input v-model="input" class="max-w-md font-mono" :placeholder="$t('tools.ipv4-converter.input')" />
    <ErrorAlert v-if="!f" :message="$t('tools.ipv4-converter.invalid')" />
    <div v-else class="flex flex-col">
      <div v-for="(v, k) in f" :key="k" class="flex items-center gap-3 border-b py-1.5 text-sm">
        <span class="text-muted-foreground w-32">{{ $t(`tools.ipv4-converter.fields.${k}`) }}</span>
        <code class="flex-1 font-mono break-all">{{ v }}</code>
        <CopyButton :text="v" :label="false" />
      </div>
    </div>
  </div>
</template>
