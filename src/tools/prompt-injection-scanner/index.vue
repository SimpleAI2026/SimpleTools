<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SAMPLE_INJECTION, scanInjection } from './logic'

const text = ref('')
const result = computed(() => scanInjection(text.value))
const levelClass: Record<string, string> = {
  low: 'bg-emerald-600 text-white',
  medium: 'bg-amber-500 text-white',
  high: 'bg-orange-600 text-white',
  critical: 'bg-red-600 text-white',
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.prompt-injection-scanner.caveat') }}</p>
    <div class="flex flex-wrap items-center gap-3">
      <div class="rounded-lg border px-4 py-2">
        <div class="text-muted-foreground text-xs">{{ $t('tools.prompt-injection-scanner.score') }}</div>
        <div class="text-2xl font-semibold tabular-nums">{{ result.score }}</div>
      </div>
      <span class="rounded-md px-3 py-1 text-sm font-semibold" :class="levelClass[result.level]">
        {{ $t('tools.prompt-injection-scanner.level') }}: {{ $t(`tools.prompt-injection-scanner.${result.level}`) }}
      </span>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.input') }}</Label>
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="text = SAMPLE_INJECTION">{{ $t('common.sample') }}</Button>
          <Button size="sm" variant="ghost" @click="text = ''">{{ $t('common.clear') }}</Button>
        </div>
      </div>
      <Textarea v-model="text" class="min-h-[500px] font-sans min-h-[500px] h-[500px]" :placeholder="$t('tools.prompt-injection-scanner.placeholder')" />
    </div>
    <div>
      <h3 class="mb-2 text-sm font-medium">{{ $t('tools.prompt-injection-scanner.matches') }} ({{ result.matches.length }})</h3>
      <ul v-if="result.matches.length" class="flex flex-col gap-2">
        <li v-for="m in result.matches" :key="m.id" class="rounded-md border p-3 text-sm">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded px-1.5 py-0.5 text-xs font-semibold uppercase" :class="levelClass[m.severity]">{{ m.severity }}</span>
            <span class="font-medium">{{ m.rule }}</span>
          </div>
          <pre class="bg-muted/40 mt-2 overflow-x-auto rounded p-2 font-mono text-xs">{{ m.snippet }}</pre>
        </li>
      </ul>
      <p v-else class="text-muted-foreground text-sm">—</p>
    </div>
  </div>
</template>
