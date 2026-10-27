<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEFAULT_PRICING_MODELS, estimateCost, formatUsd } from './logic'

const SAMPLE = { modelId: 'gpt-4o', inputTokens: 10000, outputTokens: 2000, requests: 1000 }
const modelId = ref(SAMPLE.modelId)
const inputRate = ref(2.5)
const outputRate = ref(10)
const inputTokens = ref(SAMPLE.inputTokens)
const outputTokens = ref(SAMPLE.outputTokens)
const requests = ref(SAMPLE.requests)

watch(modelId, (id) => {
  const m = DEFAULT_PRICING_MODELS.find((x) => x.id === id)
  if (!m || m.id === 'custom') return
  inputRate.value = m.inputPerMillion
  outputRate.value = m.outputPerMillion
}, { immediate: true })

function loadSample() {
  modelId.value = SAMPLE.modelId
  inputTokens.value = SAMPLE.inputTokens
  outputTokens.value = SAMPLE.outputTokens
  requests.value = SAMPLE.requests
}

const result = computed(() =>
  estimateCost({
    inputTokens: inputTokens.value,
    outputTokens: outputTokens.value,
    inputPerMillion: inputRate.value,
    outputPerMillion: outputRate.value,
    requestsPerMonth: requests.value,
  }),
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <p class="text-muted-foreground text-sm">{{ $t('tools.api-cost-estimator.currencyNote') }}</p>
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div class="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
        <Label for="model">{{ $t('tools.api-cost-estimator.model') }}</Label>
        <select id="model" v-model="modelId" class="border-input bg-background h-9 rounded-md border px-2">
          <option v-for="m in DEFAULT_PRICING_MODELS" :key="m.id" :value="m.id">{{ m.provider }} · {{ m.label }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="inRate">{{ $t('tools.api-cost-estimator.inputRate') }}</Label>
        <Input id="inRate" v-model.number="inputRate" type="number" min="0" step="0.01" class="font-mono" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="outRate">{{ $t('tools.api-cost-estimator.outputRate') }}</Label>
        <Input id="outRate" v-model.number="outputRate" type="number" min="0" step="0.01" class="font-mono" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="inTok">{{ $t('tools.api-cost-estimator.inputTokens') }}</Label>
        <Input id="inTok" v-model.number="inputTokens" type="number" min="0" class="font-mono" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="outTok">{{ $t('tools.api-cost-estimator.outputTokens') }}</Label>
        <Input id="outTok" v-model.number="outputTokens" type="number" min="0" class="font-mono" />
      </div>
      <div class="flex flex-col gap-1.5">
        <Label for="rpm">{{ $t('tools.api-cost-estimator.requests') }}</Label>
        <Input id="rpm" v-model.number="requests" type="number" min="0" class="font-mono" />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg border p-3">
        <div class="text-2xl font-semibold tabular-nums">{{ formatUsd(result.perCall) }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.api-cost-estimator.perCall') }}</div>
      </div>
      <div class="rounded-lg border p-3">
        <div class="text-2xl font-semibold tabular-nums">{{ formatUsd(result.monthly) }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.api-cost-estimator.monthly') }}</div>
      </div>
      <div class="rounded-lg border p-3">
        <div class="text-xl font-semibold tabular-nums">{{ formatUsd(result.inputCost) }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.api-cost-estimator.inputCost') }}</div>
      </div>
      <div class="rounded-lg border p-3">
        <div class="text-xl font-semibold tabular-nums">{{ formatUsd(result.outputCost) }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.api-cost-estimator.outputCost') }}</div>
      </div>
    </div>
  </div>
</template>
