<script setup lang="ts">
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import { searchMime } from './logic'

const query = ref('json')
const hits = computed(() => searchMime(query.value))
const text = computed(() => hits.value.map((hit) => `${hit.type}\t${hit.extensions.join(', ')}`).join('\n'))
</script>

<template>
  <div class="flex flex-col gap-4">
    <Input v-model="query" :placeholder="$t('tools.mime-types.search')" data-testid="mime-search" />
    <div class="flex h-8 items-center justify-between"><span class="text-sm font-medium">{{ $t('common.output') }}</span><CopyButton :text="text" /></div>
    <p v-if="!hits.length" class="text-muted-foreground text-sm">{{ $t('tools.mime-types.none') }}</p>
    <div class="flex flex-col gap-2" data-testid="tool-output">
      <article v-for="hit in hits" :key="hit.type" class="rounded-md border p-3">
        <div class="flex items-start justify-between gap-2">
          <code class="font-mono text-sm break-all">{{ hit.type }}</code>
          <CopyButton :text="hit.type" :label="false" />
        </div>
        <p class="text-muted-foreground mt-1 text-sm">{{ hit.extensions.join(', ') || '—' }}</p>
      </article>
    </div>
  </div>
</template>
