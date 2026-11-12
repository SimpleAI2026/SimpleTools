<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import { normalizeEmails, type EmailOptions } from './logic'

const SAMPLE = 'Ada.Lovelace+news@GoogleMail.com'
const input = ref(SAMPLE)
const options = reactive<EmailOptions>({ lowercase: true, stripPlus: true, gmailDots: true })
const output = computed(() => normalizeEmails(input.value, options))
</script>

<template>
  <TextIO v-model="input" :output="output" :sample="SAMPLE">
    <Label><Switch v-model="options.lowercase" /> {{ $t('tools.email-normalizer.lowercase') }}</Label>
    <Label><Switch v-model="options.stripPlus" /> {{ $t('tools.email-normalizer.plus') }}</Label>
    <Label><Switch v-model="options.gmailDots" /> {{ $t('tools.email-normalizer.dots') }}</Label>
  </TextIO>
</template>
