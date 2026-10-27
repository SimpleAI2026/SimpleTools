<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { lintSystemPrompt, SAMPLE_PROMPT } from './logic'

const { locale } = useI18n()
const text = ref('')
const findings = computed(() => lintSystemPrompt(text.value, locale.value.startsWith('zh') ? 'zh' : 'en'))
const severityClass: Record<string, string> = {
  error: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300',
  warn: 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  info: 'border-border bg-muted/40 text-foreground',
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.input') }}</Label>
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="text = SAMPLE_PROMPT">{{ $t('common.sample') }}</Button>
          <Button size="sm" variant="ghost" @click="text = ''">{{ $t('common.clear') }}</Button>
        </div>
      </div>
      <Textarea v-model="text" class="min-h-[500px] font-sans min-h-[500px] h-[500px]" :placeholder="$t('tools.system-prompt-linter.placeholder')" />
    </div>
    <div>
      <h3 class="mb-2 text-sm font-medium">{{ $t('tools.system-prompt-linter.findings') }} ({{ findings.length }})</h3>
      <ul class="flex flex-col gap-2">
        <li v-for="f in findings" :key="f.id" class="rounded-md border p-3 text-sm" :class="severityClass[f.severity]">
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded px-1.5 py-0.5 text-xs font-semibold uppercase">{{ $t(`tools.system-prompt-linter.${f.severity}`) }}</span>
            <span>{{ f.message }}</span>
          </div>
          <p v-if="f.tip" class="text-muted-foreground mt-1 text-xs">{{ $t('tools.system-prompt-linter.tip') }}: {{ f.tip }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>
