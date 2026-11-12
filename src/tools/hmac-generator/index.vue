<script setup lang="ts">
import { ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { HMAC_ALGOS, hmacDigest, type HmacAlgo, type HmacEncoding } from './logic'

const message = ref('Hi There')
const key = ref('key')
const algo = ref<HmacAlgo>('SHA-256')
const encoding = ref<HmacEncoding>('hex')
const output = ref('')

async function refresh() {
  output.value = message.value || key.value ? await hmacDigest(message.value, key.value, algo.value, encoding.value) : ''
}
watch([message, key, algo, encoding], () => void refresh(), { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-4">
    <Label class="flex flex-col items-start gap-2">{{ $t('tools.hmac-generator.message') }}<Textarea v-model="message" class="min-h-28 font-mono text-sm" /></Label>
    <div class="grid gap-3 sm:grid-cols-3">
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.hmac-generator.key') }}<Input v-model="key" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.hmac-generator.algo') }}
        <select v-model="algo" class="border-input bg-background h-10 rounded-md border px-3"><option v-for="item in HMAC_ALGOS" :key="item" :value="item">{{ item }}</option></select>
      </Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.hmac-generator.encoding') }}
        <select v-model="encoding" class="border-input bg-background h-10 rounded-md border px-3"><option value="hex">hex</option><option value="base64">base64</option></select>
      </Label>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="output" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono text-xs break-all" data-testid="tool-output">{{ output || '—' }}</pre>
    </section>
  </div>
</template>
