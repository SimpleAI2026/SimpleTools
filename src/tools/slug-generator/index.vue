<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { slugify, type SlugOptions } from './logic'

const SAMPLE = 'How to Build a Vue 3 App — Ça marche!\n中文标题也可以'
const input = ref(SAMPLE)
const o = reactive<SlugOptions>({ separator: '-', lowercase: true, maxLength: 0, stopWords: false })
const out = computed(() => input.value.split('\n').map((l) => slugify(l, { ...o, maxLength: Number(o.maxLength) || 0 })).join('\n'))
</script>

<template>
  <TextIO v-model="input" :output="out" :mono="false" :sample="SAMPLE">
    <span class="text-sm">{{ $t('tools.slug-generator.separator') }}</span>
    <ModeToggle v-model="o.separator" :options="[['-', '-'], ['_', '_'], ['.', '.']]" />
    <Label><Switch v-model="o.lowercase" /> {{ $t('tools.slug-generator.lowercase') }}</Label>
    <Label><Switch v-model="o.stopWords" /> {{ $t('tools.slug-generator.stopWords') }}</Label>
    <Label for="ml">{{ $t('tools.slug-generator.maxLength') }}</Label>
    <Input id="ml" v-model.number="o.maxLength" type="number" min="0" class="w-20" />
  </TextIO>
</template>
