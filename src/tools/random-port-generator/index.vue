<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { randomPorts } from './logic'

const count = ref(8)
const min = ref(1024)
const max = ref(65535)
const lines = ref(randomPorts({ count: 8, min: 1024, max: 65535 }))
const text = () => lines.value.join('\n')
function regenerate() {
  lines.value = randomPorts({ count: count.value, min: min.value, max: max.value })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-3">
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.random-port-generator.count') }}<Input v-model.number="count" type="number" min="1" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.random-port-generator.min') }}<Input v-model.number="min" type="number" min="1" max="65535" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.random-port-generator.max') }}<Input v-model.number="max" type="number" min="1" max="65535" /></Label>
    </div>
    <Button @click="regenerate">{{ $t('common.generate') }}</Button>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text()" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono" data-testid="tool-output">{{ text() }}</pre>
    </section>
  </div>
</template>
