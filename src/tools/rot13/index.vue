<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import { rotate } from './logic'

const SAMPLE = 'Hello, World!'
const input = ref(SAMPLE)
const shift = ref(13)
const digits = ref(false)
const out = computed(() => rotate(input.value, Number(shift.value) || 0, digits.value))
</script>

<template>
  <TextIO v-model="input" :output="out" :sample="SAMPLE">
    <Label for="shift">{{ $t('tools.rot13.shift') }}</Label>
    <Input id="shift" v-model.number="shift" type="number" class="w-24" />
    <Label><Switch v-model="digits" /> {{ $t('tools.rot13.digits') }}</Label>
  </TextIO>
</template>
