<script setup lang="ts">
import { computed } from 'vue'
import { Marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{ content: string }>()
const marked = new Marked({ gfm: true, breaks: true })
const html = computed(() =>
  DOMPurify.sanitize(marked.parse(props.content || '') as string),
)
</script>

<template>
  <!-- sanitized with DOMPurify -->
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="agent-md space-y-2 text-sm [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs [&_ul]:list-disc [&_ul]:pl-5" v-html="html" />
</template>
