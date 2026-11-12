<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import JsonNode from '@/tools/json-viewer/JsonNode.vue'
import { parseYamlValue, searchYaml, yamlStats } from './logic'

const SAMPLE = 'name: SimpleTools\nflags:\n  - offline\nowner:\n  name: Ada\n'
const input = ref(SAMPLE)
const query = ref('')
const selected = ref('$')
const expandAll = ref(0)
const collapseAll = ref(0)
const parsed = computed(() => parseYamlValue(input.value))
const stats = computed(() => (parsed.value.ok ? yamlStats(parsed.value.value) : null))
const hits = computed(() => (parsed.value.ok ? searchYaml(parsed.value.value, query.value) : []))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <Button size="sm" variant="outline" @click="input = SAMPLE">{{ $t('common.sample') }}</Button>
      <Button size="sm" variant="ghost" @click="input = ''">{{ $t('common.clear') }}</Button>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <Textarea v-model="input" class="min-h-72 font-mono text-xs" spellcheck="false" />
      <div class="flex min-w-0 flex-col gap-2">
        <ErrorAlert v-if="!parsed.ok && parsed.message !== 'empty'" :message="parsed.message" />
        <template v-else-if="parsed.ok">
          <div class="flex h-8 items-center justify-between">
            <span class="text-sm">{{ $t('common.output') }}</span>
            <CopyButton :text="selected" />
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" @click="expandAll++">{{ $t('tools.yaml-viewer.expand') }}</Button>
            <Button size="sm" variant="outline" @click="collapseAll++">{{ $t('tools.yaml-viewer.collapse') }}</Button>
            <Input v-model="query" class="h-8 max-w-48" :placeholder="$t('tools.yaml-viewer.search')" />
          </div>
          <p v-if="stats" class="text-muted-foreground text-xs">{{ $t('tools.yaml-viewer.stats', { objects: stats.objects, arrays: stats.arrays, values: stats.values, maxDepth: stats.maxDepth }) }}</p>
          <div class="max-h-96 overflow-auto rounded-md border p-2" data-testid="tool-output">
            <JsonNode :value="parsed.value" path="$" :depth="0" :expand-all="expandAll" :collapse-all="collapseAll" :highlight="new Set(hits)" @select="selected = $event" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
