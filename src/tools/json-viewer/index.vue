<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import CopyButton from '@/components/shared/CopyButton.vue'
import ErrorAlert from '@/components/shared/ErrorAlert.vue'
import JsonNode from './JsonNode.vue'
import { jsonStats, searchJson } from './logic'

const SAMPLE = '{"name":"SimpleTools","version":2,"features":["offline","i18n"],"author":{"name":"me","active":true,"meta":null}}'
const input = ref(SAMPLE)
const parsed = computed(() => {
  try {
    return { ok: true as const, value: JSON.parse(input.value) as unknown }
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) }
  }
})
const stats = computed(() => (parsed.value.ok ? jsonStats(parsed.value.value) : null))
const query = ref('')
const hits = computed(() => (parsed.value.ok ? searchJson(parsed.value.value, query.value) : []))
const hitSet = computed(() => new Set(hits.value))
const selected = ref('$')
const expandAll = ref(0)
const collapseAll = ref(0)

function loadSample() {
  input.value = SAMPLE
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" @click="loadSample">{{ $t('common.sample') }}</Button>
      <Button size="sm" variant="ghost" @click="input = ''">{{ $t('common.clear') }}</Button>
    </div>
    <div class="grid items-stretch gap-4 lg:grid-cols-2">
      <Textarea v-model="input" class="min-h-[500px] min-h-[500px] h-[500px]" :placeholder="$t('tools.json-viewer.input')" />
      <div class="flex flex-col gap-2">
        <ErrorAlert v-if="!parsed.ok" :message="parsed.error" />
        <template v-else>
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" @click="expandAll++">{{ $t('tools.json-viewer.expand') }}</Button>
            <Button size="sm" variant="outline" @click="collapseAll++">{{ $t('tools.json-viewer.collapse') }}</Button>
            <Input v-model="query" class="h-8 max-w-48" :placeholder="$t('tools.json-viewer.search')" />
            <span v-if="query" class="text-muted-foreground text-xs">{{ $t('tools.json-viewer.hits', { n: hits.length }) }}</span>
          </div>
          <p v-if="stats" class="text-muted-foreground text-xs">{{ $t('tools.json-viewer.stats', { objects: stats.objects, arrays: stats.arrays, values: stats.values, depth: stats.maxDepth }) }}</p>
          <div class="flex items-center gap-2 text-xs"><span class="text-muted-foreground">{{ $t('tools.json-viewer.path') }}</span><code class="flex-1 font-mono">{{ selected }}</code><CopyButton :text="selected" :label="false" /></div>
          <div class="max-h-[26rem] overflow-auto rounded-md border p-2">
            <JsonNode :value="parsed.value" path="$" :depth="0" :expand-all="expandAll" :collapse-all="collapseAll" :highlight="hitSet" @select="selected = $event" />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
