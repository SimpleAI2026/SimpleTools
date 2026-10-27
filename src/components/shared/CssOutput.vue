<script setup lang="ts">
import CopyButton from './CopyButton.vue'

/** Read-only code block with a copy button, used by the CSS generators. */
defineProps<{ code: string }>()
</script>

<template>
  <div class="bg-muted/40 relative rounded-md border p-3 pr-12">
    <pre class="font-mono text-sm break-all whitespace-pre-wrap" data-testid="tool-output">{{ code }}</pre>
    <CopyButton class="absolute top-2 right-2" :text="code" :label="false" />
  </div>
</template>
