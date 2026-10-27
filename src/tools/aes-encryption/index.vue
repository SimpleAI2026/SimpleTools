<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { decryptText, encryptText } from './logic'

const { t } = useI18n()
const mode = ref<'enc' | 'dec'>('enc')
const SAMPLE = 'Hello, secret world'
const input = ref(SAMPLE)
const password = ref('')
const output = ref('')
const error = ref('')
const busy = ref(false)
async function run() {
  busy.value = true
  error.value = ''
  output.value = ''
  try {
    output.value = mode.value === 'enc' ? await encryptText(input.value, password.value) : await decryptText(input.value, password.value)
  } catch (e) {
    const key = e instanceof Error ? e.message : 'bad-format'
    error.value = t(`tools.aes-encryption.errors.${key}`)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <TextIO v-model="input" :output="output" :error="error" :sample="SAMPLE">
      <ModeToggle v-model="mode" :options="[['enc', $t('tools.aes-encryption.encrypt')], ['dec', $t('tools.aes-encryption.decrypt')]]" />
      <Input v-model="password" type="password" autocomplete="off" :placeholder="$t('tools.aes-encryption.password')" class="w-56" />
      <Button size="sm" :disabled="busy" @click="run">{{ busy ? $t('common.processing') : $t('tools.aes-encryption.run') }}</Button>
    </TextIO>
    <p class="text-muted-foreground text-xs">{{ $t('tools.aes-encryption.note') }}</p>
  </div>
</template>
