<script setup lang="ts">
import { onMounted } from 'vue'
import { useAgentStore } from '@/stores/agent'

const agent = useAgentStore()
onMounted(() => {
  void agent.init()
})
</script>

<template>
  <div class="text-muted-foreground flex min-h-0 flex-1 items-center justify-center p-8 text-sm" data-testid="agent-page">
    {{ $t('agent.empty') }}
  </div>
</template>
