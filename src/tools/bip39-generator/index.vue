<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import { BIP39_STRENGTHS, checkMnemonic, createMnemonic, mnemonicWordCount, type Bip39Strength } from './logic'

const strength = ref<Bip39Strength>(128)
const phrase = ref(createMnemonic(128))
const pasted = ref('')
const valid = computed(() => (pasted.value.trim() ? checkMnemonic(pasted.value) : null))

function regenerate() {
  phrase.value = createMnemonic(strength.value)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Label class="flex items-center gap-2">{{ $t('tools.bip39-generator.strength') }}
        <select v-model.number="strength" class="border-input bg-background h-10 rounded-md border px-3" @change="regenerate">
          <option v-for="item in BIP39_STRENGTHS" :key="item" :value="item">{{ item }} · {{ mnemonicWordCount(item) }}</option>
        </select>
      </Label>
      <Button @click="regenerate">{{ $t('tools.bip39-generator.generate') }}</Button>
    </div>
    <section class="flex flex-col gap-2">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="phrase" /></div>
      <pre class="bg-muted/40 rounded-md border p-3 whitespace-pre-wrap" data-testid="tool-output">{{ phrase }}</pre>
    </section>
    <Label class="flex flex-col items-start gap-2">{{ $t('tools.bip39-generator.check') }}<Textarea v-model="pasted" class="min-h-20" /></Label>
    <p v-if="valid !== null" :class="valid ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'">{{ valid ? $t('tools.bip39-generator.valid') : $t('tools.bip39-generator.invalid') }}</p>
  </div>
</template>
