<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CopyButton from '@/components/shared/CopyButton.vue'
import { randomMacs, type MacSeparator } from './logic'

const prefix = ref('')
const separator = ref<MacSeparator>(':')
const uppercase = ref(true)
const local = ref(true)
const count = ref(5)
const lines = ref(randomMacs({ prefix: '', separator: ':', uppercase: true, local: true, count: 5 }))
const text = () => lines.value.join('\n')
function regenerate() {
  lines.value = randomMacs({ prefix: prefix.value, separator: separator.value, uppercase: uppercase.value, local: local.value, count: count.value })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.mac-address-generator.prefix') }}<Input v-model="prefix" placeholder="AC:DE:48" class="font-mono" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.mac-address-generator.separator') }}
        <select v-model="separator" class="border-input bg-background h-10 rounded-md border px-3"><option value=":">:</option><option value="-">-</option><option value="">{{ $t('tools.mac-address-generator.none') }}</option></select>
      </Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.mac-address-generator.count') }}<Input v-model.number="count" type="number" min="1" max="100" /></Label>
      <div class="flex flex-col justify-end gap-2">
        <Label><Switch v-model="uppercase" /> {{ $t('tools.mac-address-generator.upper') }}</Label>
        <Label><Switch v-model="local" /> {{ $t('tools.mac-address-generator.local') }}</Label>
      </div>
    </div>
    <Button data-testid="mac-generate" @click="regenerate">{{ $t('common.generate') }}</Button>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text()" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono text-sm" data-testid="tool-output">{{ text() }}</pre>
    </section>
  </div>
</template>
