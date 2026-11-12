<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { DEFAULT_ROUNDS, hashBcrypt, MAX_ROUNDS, MIN_ROUNDS, verifyBcrypt } from './logic'

const { t } = useI18n()
const password = ref('correct horse battery')
const rounds = ref(DEFAULT_ROUNDS)
const hash = ref('')
const verifyPassword = ref('correct horse battery')
const verifyHash = ref('')
const busy = ref(false)
const verdict = ref<'match' | 'mismatch' | ''>('')
const error = ref('')

const output = computed(() => hash.value)

async function generate() {
  error.value = ''
  verdict.value = ''
  if (!password.value) {
    error.value = t('tools.bcrypt.needPassword')
    hash.value = ''
    return
  }
  busy.value = true
  try {
    hash.value = await hashBcrypt(password.value, rounds.value)
    verifyHash.value = hash.value
  } finally {
    busy.value = false
  }
}

async function verify() {
  error.value = ''
  const ok = await verifyBcrypt(verifyPassword.value, verifyHash.value)
  verdict.value = ok ? 'match' : 'mismatch'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-muted-foreground text-sm">{{ $t('tools.bcrypt.note') }}</p>
    <div class="grid gap-3 sm:grid-cols-[1fr_8rem]">
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.bcrypt.password') }}
        <Input v-model="password" type="text" autocomplete="off" data-testid="bcrypt-password" />
      </Label>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.bcrypt.rounds') }}
        <Input v-model.number="rounds" type="number" :min="MIN_ROUNDS" :max="MAX_ROUNDS" />
      </Label>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button :disabled="busy" data-testid="bcrypt-hash" @click="generate">{{ busy ? $t('tools.bcrypt.working') : $t('tools.bcrypt.hash') }}</Button>
    </div>
    <ErrorAlert v-if="error" :message="error" />
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }}</Label>
        <CopyButton :text="output" />
      </div>
      <pre class="bg-muted/40 min-h-24 overflow-auto rounded-md border p-3 font-mono text-xs break-all whitespace-pre-wrap" data-testid="tool-output">{{ output || '—' }}</pre>
    </section>
    <section class="flex flex-col gap-3 rounded-lg border p-3">
      <h2 class="text-sm font-medium">{{ $t('tools.bcrypt.verifyTitle') }}</h2>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.bcrypt.password') }}
        <Input v-model="verifyPassword" autocomplete="off" />
      </Label>
      <Label class="flex flex-col items-start gap-2">
        {{ $t('tools.bcrypt.hashLabel') }}
        <Input v-model="verifyHash" class="font-mono text-xs" />
      </Label>
      <Button variant="outline" @click="verify">{{ $t('tools.bcrypt.verify') }}</Button>
      <p v-if="verdict" :class="verdict === 'match' ? 'text-emerald-600' : 'text-destructive'" class="text-sm">
        {{ verdict === 'match' ? $t('tools.bcrypt.match') : $t('tools.bcrypt.mismatch') }}
      </p>
    </section>
  </div>
</template>
