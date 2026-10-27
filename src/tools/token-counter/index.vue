<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { TOKENIZER_FAMILIES, CONTEXT_WINDOWS } from '../_shared/ai-models'
import { analyzeText, formatPercent, type ContextWindow, type TokenizerFamily } from './logic'

const { t } = useI18n()
const text = ref('')
const family = ref<TokenizerFamily>('o200k')
const context = ref<ContextWindow>(128000)
const stats = computed(() => analyzeText(text.value, family.value, context.value))
const familyOptions = computed(() => TOKENIZER_FAMILIES.map((f) => [f.id, t(`tools.token-counter.${f.labelKey}`)] as const))
const contextOptions = computed(() => CONTEXT_WINDOWS.map((w) => [w, `${(w / 1000).toFixed(0)}k`] as const))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <Label>{{ $t('tools.token-counter.family') }}</Label>
      <ModeToggle v-model="family" :options="familyOptions" />
    </div>
    <div class="flex flex-col gap-2">
      <Label>{{ $t('tools.token-counter.context') }}</Label>
      <ModeToggle v-model="context" :options="contextOptions" />
    </div>
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg border p-3">
        <div class="text-2xl font-semibold tabular-nums">{{ stats.tokens.toLocaleString() }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.token-counter.tokens') }}</div>
        <div class="mt-1 text-xs" :class="stats.accurate ? 'text-emerald-600' : 'text-amber-600'">
          {{ stats.accurate ? $t('tools.token-counter.accurate') : $t('tools.token-counter.estimate') }}
        </div>
      </div>
      <div class="rounded-lg border p-3">
        <div class="text-2xl font-semibold tabular-nums">{{ stats.chars.toLocaleString() }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.token-counter.chars') }}</div>
      </div>
      <div class="rounded-lg border p-3">
        <div class="text-2xl font-semibold tabular-nums">{{ stats.words.toLocaleString() }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.token-counter.words') }}</div>
      </div>
      <div class="rounded-lg border p-3">
        <div class="text-2xl font-semibold tabular-nums">{{ formatPercent(stats.contextRatio) }}</div>
        <div class="text-muted-foreground text-xs">{{ $t('tools.token-counter.usage') }} ({{ (context / 1000).toFixed(0) }}k)</div>
      </div>
    </div>
    <p class="text-muted-foreground text-sm">{{ $t('tools.token-counter.estimateNote') }}</p>
    <Textarea v-model="text" class="min-h-[500px] font-sans min-h-[500px] h-[500px]" :placeholder="$t('tools.token-counter.placeholder')" />
    <div class="flex gap-2">
      <Button size="sm" variant="outline" @click="text = $t('tools.token-counter.sampleText')">{{ $t('common.sample') }}</Button>
      <Button size="sm" variant="ghost" @click="text = ''">{{ $t('common.clear') }}</Button>
    </div>
  </div>
</template>
