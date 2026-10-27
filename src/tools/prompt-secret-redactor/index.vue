<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { DEFAULT_REDACT_OPTIONS, redactSecrets, SAMPLE_SECRET_TEXT, type RedactCategory } from './logic'

const input = ref('')
const opts = reactive({ ...DEFAULT_REDACT_OPTIONS })
const result = computed(() => redactSecrets(input.value, opts))
const cats: RedactCategory[] = ['openai', 'anthropic', 'google', 'github', 'slack', 'aws', 'bearer', 'jwt', 'email', 'pem']
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <Label class="mb-2 block">{{ $t('tools.prompt-secret-redactor.categories') }}</Label>
      <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Label v-for="c in cats" :key="c" class="flex items-center gap-2 font-normal">
          <Switch v-model="opts[c]" /> {{ $t(`tools.prompt-secret-redactor.${c}`) }}
        </Label>
      </div>
    </div>
    <div class="text-sm font-medium">{{ $t('tools.prompt-secret-redactor.redacted', { n: result.total }) }}</div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-2">
        <div class="flex h-8 items-center justify-between">
          <Label>{{ $t('common.input') }}</Label>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" @click="input = SAMPLE_SECRET_TEXT">{{ $t('common.sample') }}</Button>
            <Button size="sm" variant="ghost" @click="input = ''">{{ $t('common.clear') }}</Button>
          </div>
        </div>
        <Textarea v-model="input" class="min-h-[500px] min-h-[500px] h-[500px]" :placeholder="$t('tools.prompt-secret-redactor.placeholder')" />
      </div>
      <div class="flex flex-col gap-2">
        <div class="flex h-8 items-center justify-between">
          <Label>{{ $t('common.output') }}</Label>
          <CopyButton :text="result.text" />
        </div>
        <Textarea :model-value="result.text" readonly class="min-h-[500px] bg-muted/40 min-h-[500px] h-[500px]" />
      </div>
    </div>
  </div>
</template>
