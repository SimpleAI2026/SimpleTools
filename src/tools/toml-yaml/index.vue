<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import TextIO from '@/components/shared/TextIO.vue'
import { tomlToYaml, yamlToToml } from './logic'

const { t } = useI18n()
const SAMPLE = 'title = "SimpleTools"\ncount = 2\n'
const input = ref(SAMPLE)
const direction = ref<'toYaml' | 'toToml'>('toYaml')
const result = computed(() => {
  try {
    const output = direction.value === 'toYaml' ? tomlToYaml(input.value) : yamlToToml(input.value)
    return { output, error: '' }
  } catch (error) {
    const code = error instanceof Error && error.message === 'root-object' ? 'root' : 'invalid'
    return { output: '', error: input.value.trim() ? t(`tools.toml-yaml.errors.${code}`) : '' }
  }
})
</script>

<template>
  <TextIO v-model="input" :output="result.output" :error="result.error" :sample="SAMPLE">
    <Button size="sm" :variant="direction === 'toYaml' ? 'default' : 'outline'" @click="direction = 'toYaml'">TOML → YAML</Button>
    <Button size="sm" :variant="direction === 'toToml' ? 'default' : 'outline'" @click="direction = 'toToml'">YAML → TOML</Button>
  </TextIO>
</template>
