<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { generateUlids, MAX_ULID_COUNT, parseUlid } from './logic'

const count = ref(5)
const list = ref(generateUlids(5))
const probe = ref('')
const text = computed(() => list.value.join('\n'))
const parsed = computed(() => (probe.value.trim() ? parseUlid(probe.value) : null))

function regenerate() {
  list.value = generateUlids(count.value)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-end gap-3">
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.ulid-generator.count') }}
        <Input v-model.number="count" type="number" min="1" :max="MAX_ULID_COUNT" class="w-28" />
      </Label>
      <Button data-testid="ulid-generate" @click="regenerate">{{ $t('common.generate') }}</Button>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }}</Label>
        <CopyButton :text="text" />
      </div>
      <pre class="bg-muted/40 min-h-40 overflow-auto rounded-md border p-3 font-mono text-sm break-all whitespace-pre-wrap" data-testid="tool-output">{{ text }}</pre>
    </section>
    <section class="flex flex-col gap-2">
      <Label>{{ $t('tools.ulid-generator.parse') }}</Label>
      <Input v-model="probe" class="font-mono" :placeholder="$t('tools.ulid-generator.parseHint')" />
      <p v-if="probe.trim() && !parsed" class="text-destructive text-sm">{{ $t('tools.ulid-generator.invalid') }}</p>
      <p v-else-if="parsed" class="text-sm">{{ new Date(parsed.time).toISOString() }} · {{ parsed.randomHex }}</p>
    </section>
  </div>
</template>
