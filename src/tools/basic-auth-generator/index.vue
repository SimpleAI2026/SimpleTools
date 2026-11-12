<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { basicAuthHeader, parseBasicAuth } from './logic'

const username = ref('ada')
const password = ref('secret')
const pasted = ref('')
const header = computed(() => (username.value || password.value ? basicAuthHeader(username.value, password.value) : ''))
const parsed = computed(() => (pasted.value.trim() ? parseBasicAuth(pasted.value) : null))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2">
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.basic-auth-generator.username') }}<Input v-model="username" autocomplete="off" data-testid="basic-user" /></Label>
      <Label class="flex flex-col items-start gap-2">{{ $t('tools.basic-auth-generator.password') }}<Input v-model="password" autocomplete="off" /></Label>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="header" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 font-mono text-sm break-all whitespace-pre-wrap" data-testid="tool-output">{{ header || '—' }}</pre>
    </section>
    <Label class="flex flex-col items-start gap-2">{{ $t('tools.basic-auth-generator.decode') }}<Input v-model="pasted" class="font-mono text-xs" /></Label>
    <p v-if="pasted.trim() && !parsed" class="text-destructive text-sm">{{ $t('tools.basic-auth-generator.invalid') }}</p>
    <p v-else-if="parsed" class="text-sm">{{ parsed.username }} / {{ parsed.password }}</p>
  </div>
</template>
