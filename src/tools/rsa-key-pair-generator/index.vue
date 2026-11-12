<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { generateRsaPem, RSA_SIZES, type RsaPurpose, type RsaSize } from './logic'

const bits = ref<RsaSize>(2048)
const purpose = ref<RsaPurpose>('sign')
const publicKey = ref('')
const privateKey = ref('')
const busy = ref(false)

async function generate() {
  busy.value = true
  try {
    const pem = await generateRsaPem(bits.value, purpose.value)
    publicKey.value = pem.publicKey
    privateKey.value = pem.privateKey
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.rsa-key-pair-generator.note') }}</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.rsa-key-pair-generator.bits') }}
        <select v-model.number="bits" class="border-input bg-background h-10 w-full rounded-md border px-3">
          <option v-for="size in RSA_SIZES" :key="size" :value="size">{{ size }}</option>
        </select>
      </Label>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.rsa-key-pair-generator.purpose') }}
        <select v-model="purpose" class="border-input bg-background h-10 w-full rounded-md border px-3">
          <option value="sign">{{ $t('tools.rsa-key-pair-generator.sign') }}</option>
          <option value="encrypt">{{ $t('tools.rsa-key-pair-generator.encrypt') }}</option>
        </select>
      </Label>
    </div>
    <Button :disabled="busy" data-testid="rsa-generate" @click="generate">{{ busy ? $t('tools.rsa-key-pair-generator.working') : $t('common.generate') }}</Button>
    <div class="grid gap-4 lg:grid-cols-2">
      <section class="flex min-w-0 flex-col gap-2">
        <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.rsa-key-pair-generator.publicKey') }}</Label><CopyButton :text="publicKey" /></div>
        <pre class="bg-muted/40 min-h-40 overflow-auto rounded-md border p-3 font-mono text-xs break-all whitespace-pre-wrap" data-testid="tool-output">{{ publicKey || '—' }}</pre>
      </section>
      <section class="flex min-w-0 flex-col gap-2">
        <div class="flex h-8 items-center justify-between"><Label>{{ $t('tools.rsa-key-pair-generator.privateKey') }}</Label><CopyButton :text="privateKey" /></div>
        <pre class="bg-muted/40 min-h-40 overflow-auto rounded-md border p-3 font-mono text-xs break-all whitespace-pre-wrap">{{ privateKey || '—' }}</pre>
      </section>
    </div>
  </div>
</template>
