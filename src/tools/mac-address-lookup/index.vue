<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { lookupOui, parseOuiTable } from './logic'

const mac = ref('28:6F:B9:00:11:22')
const table = shallowRef<Map<string, string> | null>(null)
const hit = computed(() => (table.value ? lookupOui(mac.value, table.value) : null))
const text = computed(() => (hit.value ? `${hit.value.prefix}\t${hit.value.vendor}` : ''))
onMounted(() => {
  void import('./oui.txt?raw').then((mod) => {
    table.value = parseOuiTable(mod.default)
  })
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <Label class="flex flex-col items-start gap-2">{{ $t('tools.mac-address-lookup.mac') }}<Input v-model="mac" class="font-mono" /></Label>
    <p class="text-muted-foreground text-sm">{{ $t('tools.mac-address-lookup.note') }}</p>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <p v-if="!table" class="text-muted-foreground text-sm">{{ $t('tools.mac-address-lookup.loading') }}</p>
      <pre v-else class="bg-muted/40 rounded-md border p-3 whitespace-pre-wrap" data-testid="tool-output">{{ text || $t('tools.mac-address-lookup.none') }}</pre>
    </section>
  </div>
</template>
