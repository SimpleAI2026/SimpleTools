<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import TextIO from '@/components/shared/TextIO.vue'
import { jsonToTs, type JsonToTsOptions } from './logic'

const SAMPLE = '{\n  "id": 42,\n  "name": "Ada",\n  "roles": ["admin", "dev"],\n  "profile": { "avatar": null, "bio": "hi" },\n  "projects": [{ "id": 1, "title": "Engine" }, { "id": 2, "title": "Notes", "archived": true }]\n}'
const input = ref(SAMPLE)
const o = reactive<JsonToTsOptions>({ rootName: 'Root', useType: false, exportDecl: true, readonly: false })
const result = computed(() => {
  if (!input.value.trim()) return { out: '', err: '' }
  try {
    return { out: jsonToTs(input.value, o), err: '' }
  } catch (e) {
    return { out: '', err: (e as Error).message }
  }
})
</script>

<template>
  <TextIO v-model="input" :output="result.out" :error="result.err" :sample="SAMPLE">
    <Label for="root">{{ $t('tools.json-to-typescript.rootName') }}</Label>
    <Input id="root" v-model="o.rootName" class="w-36 font-mono" />
    <Label><Switch v-model="o.useType" /> {{ $t('tools.json-to-typescript.useType') }}</Label>
    <Label><Switch v-model="o.exportDecl" /> {{ $t('tools.json-to-typescript.exportDecl') }}</Label>
    <Label><Switch v-model="o.readonly" /> {{ $t('tools.json-to-typescript.readonly') }}</Label>
  </TextIO>
</template>
