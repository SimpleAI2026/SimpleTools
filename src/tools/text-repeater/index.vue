<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import { parseSeparator, repeatText } from './logic'

const { t } = useI18n()
const SAMPLE = 'Hello '
const input = ref(SAMPLE)
const times = ref(5)
const sep = ref('\\n')
const numbered = ref(false)
const res = computed(() => {
  try {
    return { out: repeatText(input.value, Number(times.value), parseSeparator(sep.value), numbered.value), err: '' }
  } catch {
    return { out: '', err: t('tools.text-repeater.tooLarge') }
  }
})
</script>

<template>
  <TextIO v-model="input" :output="res.out" :error="res.err" :mono="false" :sample="SAMPLE">
    <Label for="tm">{{ $t('tools.text-repeater.times') }}</Label>
    <Input id="tm" v-model.number="times" type="number" min="0" class="w-24" />
    <Label for="sp">{{ $t('tools.text-repeater.separator') }}</Label>
    <Input id="sp" v-model="sep" class="w-24 font-mono" />
    <Label><Switch v-model="numbered" /> {{ $t('tools.text-repeater.numbered') }}</Label>
  </TextIO>
</template>
