<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import { decodeJwt, verifyHmac } from './logic'

const { t, locale } = useI18n()
const SAMPLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
const token = ref(SAMPLE)
const res = computed(() => {
  try {
    return { d: decodeJwt(token.value), err: '' }
  } catch (e) {
    return { d: null, err: t(`tools.jwt-decoder.errors.${e instanceof Error ? e.message : 'decode'}`) }
  }
})
const secret = ref('')
const verified = ref<boolean | null | undefined>(undefined)
async function verify() {
  verified.value = await verifyHmac(token.value, secret.value).catch(() => false)
}
const pretty = (o: unknown) => JSON.stringify(o, null, 2)

function loadSample() {
  token.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
    </div>
    <Textarea v-model="token" class="min-h-28 break-all h-auto" :placeholder="$t('tools.jwt-decoder.token')" @input="verified = undefined" />
    <ErrorAlert v-if="res.err" :message="res.err" />
    <template v-if="res.d">
      <div class="flex flex-wrap gap-2 text-sm">
        <span v-if="res.d.expired === true" class="rounded bg-red-600 px-2 py-0.5 text-white">{{ $t('tools.jwt-decoder.expired') }}</span>
        <span v-else-if="res.d.expired === false" class="rounded bg-emerald-600 px-2 py-0.5 text-white">{{ $t('tools.jwt-decoder.valid') }}</span>
        <span v-else class="text-muted-foreground">{{ $t('tools.jwt-decoder.noExp') }}</span>
        <span v-for="tm in res.d.times" :key="tm.claim" class="text-muted-foreground">· {{ $t(`tools.jwt-decoder.claims.${tm.claim}`) }}: {{ tm.date.toLocaleString(locale) }}</span>
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <div v-for="k in ['header', 'payload'] as const" :key="k" class="flex flex-col gap-2">
          <div class="flex items-center justify-between"><Label>{{ $t(`tools.jwt-decoder.${k}`) }}</Label><CopyButton :text="pretty(res.d[k])" /></div>
          <pre class="bg-muted/40 overflow-auto rounded-md border p-3 font-mono text-sm">{{ pretty(res.d[k]) }}</pre>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Input v-model="secret" type="password" class="max-w-sm" :placeholder="$t('tools.jwt-decoder.secret')" />
        <Button size="sm" variant="outline" :disabled="!secret" @click="verify">{{ $t('tools.jwt-decoder.verify') }}</Button>
        <span v-if="verified === true" class="text-sm text-emerald-600">✓ {{ $t('tools.jwt-decoder.ok') }}</span>
        <span v-else-if="verified === false" class="text-destructive text-sm">✗ {{ $t('tools.jwt-decoder.bad') }}</span>
        <span v-else-if="verified === null" class="text-muted-foreground text-sm">{{ $t('tools.jwt-decoder.unsupported') }}</span>
      </div>
    </template>
  </div>
</template>
