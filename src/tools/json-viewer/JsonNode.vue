<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
import { childPath, typeOf } from './logic'

const props = defineProps<{ value: unknown; name?: string | number; path: string; depth: number; expandAll: number; collapseAll: number; highlight: Set<string> }>()
const emit = defineEmits<{ select: [path: string] }>()
const type = computed(() => typeOf(props.value))
const isContainer = computed(() => type.value === 'object' || type.value === 'array')
const open = ref(props.depth < 2)
watch(() => props.expandAll, () => (open.value = true))
watch(() => props.collapseAll, () => (open.value = props.depth < 1))
const entries = computed<[string | number, unknown][]>(() =>
  type.value === 'array' ? (props.value as unknown[]).map((v, i) => [i, v]) : type.value === 'object' ? Object.entries(props.value as object) : [],
)
const summary = computed(() => (type.value === 'array' ? `[${entries.value.length}]` : '{' + entries.value.length + '}'))
function onClick() {
  if (isContainer.value) open.value = !open.value
  emit('select', props.path)
}
const color: Record<string, string> = { string: 'text-emerald-700 dark:text-emerald-400', number: 'text-sky-700 dark:text-sky-400', boolean: 'text-purple-700 dark:text-purple-400', null: 'text-muted-foreground' }
</script>

<template>
  <div class="font-mono text-sm leading-6">
    <div :class="['flex cursor-pointer items-center gap-1 rounded px-1 hover:bg-accent', highlight.has(path) ? 'bg-amber-300/40' : '']" @click="onClick">
      <component :is="open ? ChevronDown : ChevronRight" v-if="isContainer" class="size-3.5 shrink-0" />
      <span v-else class="w-3.5 shrink-0"></span>
      <span v-if="name !== undefined" class="text-rose-700 dark:text-rose-400">{{ typeof name === 'number' ? name : JSON.stringify(name) }}</span>
      <span v-if="name !== undefined">:</span>
      <template v-if="isContainer">
        <span class="text-muted-foreground">{{ summary }}</span>
      </template>
      <span v-else :class="color[type]" class="break-all">{{ type === 'string' ? JSON.stringify(value) : String(value) }}</span>
    </div>
    <div v-if="isContainer && open" class="border-border ml-3 border-l pl-2">
      <JsonNode v-for="[k, v] in entries" :key="k" :value="v" :name="k" :path="childPath(path, k)" :depth="depth + 1" :expand-all="expandAll" :collapse-all="collapseAll" :highlight="highlight" @select="emit('select', $event)" />
    </div>
  </div>
</template>
