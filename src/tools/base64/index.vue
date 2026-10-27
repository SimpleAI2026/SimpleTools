<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { decodeBase64, encodeBase64 } from './logic'

const { t } = useI18n()
const mode = ref<'encode' | 'decode'>('encode')
const urlSafe = ref(false)
const SAMPLE = 'Hello, 世界!'
const input = ref(SAMPLE)

const result = computed(() => {
  if (mode.value === 'encode') return { output: encodeBase64(input.value, urlSafe.value), error: '' }
  try {
    return { output: decodeBase64(input.value), error: '' }
  } catch {
    return { output: '', error: t('tools.base64.invalid') }
  }
})

function swap() {
  if (result.value.error) return
  input.value = result.value.output
  mode.value = mode.value === 'encode' ? 'decode' : 'encode'
}

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" :variant="mode === 'encode' ? 'default' : 'outline'" @click="mode = 'encode'">{{ $t('common.encode') }}</Button>
      <Button size="sm" :variant="mode === 'decode' ? 'default' : 'outline'" @click="mode = 'decode'">{{ $t('common.decode') }}</Button>
      <Label v-if="mode === 'encode'" class="ml-2"><Switch v-model="urlSafe" /> {{ $t('tools.base64.urlSafe') }}</Label>
      <div class="ml-auto flex gap-2">
        <Button size="sm" variant="ghost" @click="swap">⇅</Button>
        <Button size="sm" variant="ghost" @click="input = ''">{{ $t('common.clear') }}</Button>
      </div>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <div class="flex min-h-0 flex-col gap-2">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label>{{ $t('common.input') }}</Label>
        </div>
        <Textarea v-model="input" class="min-h-[500px] h-[500px]" spellcheck="false" />
      </div>
      <div class="flex min-h-0 flex-col gap-2">
        <div class="flex h-8 shrink-0 items-center justify-between">
          <Label>{{ $t('common.output') }}</Label>
          <CopyButton :text="result.output" />
        </div>
        <Textarea :model-value="result.output" readonly class="bg-muted/40 break-all min-h-[500px] h-[500px]" />
      </div>
    </div>
    <ErrorAlert v-if="result.error" :message="result.error" />
  </div>
</template>
