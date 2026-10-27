<script setup lang="ts">
import { computed, ref } from 'vue'
import TextIO from '@/components/shared/TextIO.vue'
import ModeToggle from '@/components/shared/ModeToggle.vue'
import { decodeEntities, encodeEntities, type EncodeMode } from './logic'

const dir = ref<'enc' | 'dec'>('enc')
const mode = ref<EncodeMode>('minimal')
const SAMPLE = '<p class="x">Tom & Jerry © 2026</p>'
const input = ref(SAMPLE)
const out = computed(() => (dir.value === 'enc' ? encodeEntities(input.value, mode.value) : decodeEntities(input.value)))
</script>

<template>
  <TextIO v-model="input" :output="out" :sample="SAMPLE">
    <ModeToggle v-model="dir" :options="[['enc', $t('common.encode')], ['dec', $t('common.decode')]]" />
    <ModeToggle v-if="dir === 'enc'" v-model="mode" :options="[['minimal', $t('tools.html-entities.minimal')], ['named', $t('tools.html-entities.named')], ['numeric', $t('tools.html-entities.numeric')]]" />
  </TextIO>
</template>
