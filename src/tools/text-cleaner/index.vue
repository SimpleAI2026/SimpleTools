<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import { cleanText, DEFAULT_CLEAN, type CleanOptions } from './logic'

const SAMPLE = '  Hello    world  \n\n\n\n“Smart” quotes…\u200B and ＦＵＬＬＷＩＤＴＨ  '
const input = ref(SAMPLE)
const o = reactive<CleanOptions>({ ...DEFAULT_CLEAN })
const out = computed(() => cleanText(input.value, o))
const keys = Object.keys(DEFAULT_CLEAN) as (keyof CleanOptions)[]
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <Label v-for="k in keys" :key="k" class="text-xs"><Switch v-model="o[k]" /> {{ $t(`tools.text-cleaner.opts.${k}`) }}</Label>
    </div>
    <TextIO v-model="input" :output="out" :mono="false" :sample="SAMPLE" />
  </div>
</template>
