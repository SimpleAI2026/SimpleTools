<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { decodeUrl, encodeUrl, type UrlMode } from './logic'

const { t } = useI18n()
const direction = ref<'encode' | 'decode'>('encode')
const mode = ref<UrlMode>('component')
const plusAsSpace = ref(false)
const SAMPLE = 'https://example.com/search?q=中文 & more'
const input = ref(SAMPLE)

const result = computed(() => {
  if (direction.value === 'encode') return { output: encodeUrl(input.value, mode.value), error: '' }
  try {
    return { output: decodeUrl(input.value, mode.value, plusAsSpace.value), error: '' }
  } catch {
    return { output: '', error: t('tools.url-encoder.invalid') }
  }
})

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
      <Button size="sm" :variant="direction === 'encode' ? 'default' : 'outline'" @click="direction = 'encode'">{{ $t('common.encode') }}</Button>
      <Button size="sm" :variant="direction === 'decode' ? 'default' : 'outline'" @click="direction = 'decode'">{{ $t('common.decode') }}</Button>
      <span class="mx-2 h-5 border-l"></span>
      <Button size="sm" :variant="mode === 'component' ? 'secondary' : 'ghost'" @click="mode = 'component'">{{ $t('tools.url-encoder.component') }}</Button>
      <Button size="sm" :variant="mode === 'uri' ? 'secondary' : 'ghost'" @click="mode = 'uri'">{{ $t('tools.url-encoder.uri') }}</Button>
      <Label v-if="direction === 'decode'" class="ml-2"><Switch v-model="plusAsSpace" /> {{ $t('tools.url-encoder.plusAsSpace') }}</Label>
      <Button size="sm" variant="ghost" class="ml-auto" @click="input = ''">{{ $t('common.clear') }}</Button>
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
