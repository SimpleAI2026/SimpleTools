<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TextIO from '@/components/shared/TextIO.vue'
import { convertDockerRun } from './logic'

const { t } = useI18n()
const SAMPLE = 'docker run -d --name web -p 8080:80 -e FOO=bar -v /data:/data --restart unless-stopped nginx:alpine'
const input = ref(SAMPLE)
const result = computed(() => convertDockerRun(input.value))
const error = computed(() => (result.value.error ? t(`tools.docker-run-to-compose.errors.${result.value.error}`) : ''))
const output = computed(() => {
  if (result.value.error) return ''
  const notes = result.value.warnings.map((item) => `# ${t(`tools.docker-run-to-compose.warnings.${item.code}`, { detail: item.detail })}`)
  return [...notes, result.value.yaml].filter(Boolean).join('\n')
})
</script>

<template>
  <TextIO v-model="input" :output="output" :error="error" :sample="SAMPLE" />
</template>
