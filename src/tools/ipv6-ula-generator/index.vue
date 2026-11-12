<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { generateUla } from './logic'

const prefix = ref('')
const subnet = ref('')
async function regenerate() {
  const result = await generateUla()
  prefix.value = result.prefix
  subnet.value = result.firstSubnet
}
onMounted(() => void regenerate())
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.ipv6-ula-generator.note') }}</p>
    <Button data-testid="ula-generate" @click="regenerate">{{ $t('common.generate') }}</Button>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.ipv6-ula-generator.prefix') }}</Label><CopyButton :text="prefix" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono" data-testid="tool-output">{{ prefix || '—' }}</pre>
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.ipv6-ula-generator.subnet') }}</Label><CopyButton :text="subnet" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono">{{ subnet || '—' }}</pre>
    </section>
  </div>
</template>
