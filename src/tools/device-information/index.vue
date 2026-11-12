<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { formatDevice, type DeviceFacts } from './logic'

const facts = ref<DeviceFacts | null>(null)
const text = computed(() => (facts.value ? formatDevice(facts.value) : ''))

function collect(): DeviceFacts {
  const nav = navigator
  const memory = 'deviceMemory' in nav ? String((nav as Navigator & { deviceMemory?: number }).deviceMemory ?? '') : ''
  return {
    userAgent: nav.userAgent,
    language: nav.language,
    languages: nav.languages.join(', '),
    hardwareConcurrency: String(nav.hardwareConcurrency || ''),
    deviceMemory: memory,
    screen: `${screen.width}x${screen.height} @${window.devicePixelRatio}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? '',
    touch: String(navigator.maxTouchPoints > 0),
    cookieEnabled: String(nav.cookieEnabled),
    platform: nav.platform,
    colorScheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  }
}
onMounted(() => {
  facts.value = collect()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.device-information.note') }}</p>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 whitespace-pre-wrap" data-testid="tool-output">{{ text || '—' }}</pre>
    </section>
  </div>
</template>
