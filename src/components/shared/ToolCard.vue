<script setup lang="ts">
import type { ToolMeta } from '@/registry'
import { Badge } from '@/components/ui/badge'

defineProps<{ tool: ToolMeta }>()
</script>

<template>
  <RouterLink
    :to="{ name: 'tool', params: { slug: tool.slug } }"
    class="bg-card hover:border-primary/40 group flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition hover:shadow-md"
    :data-testid="`tool-card-${tool.slug}`"
  >
    <div class="flex items-center gap-3">
      <div class="bg-secondary flex size-9 items-center justify-center rounded-lg">
        <component :is="tool.icon" class="size-5" />
      </div>
      <div class="min-w-0">
        <div class="truncate font-medium">{{ $t(`tools.${tool.slug}.name`) }}</div>
        <Badge class="text-muted-foreground mt-1">{{ $t(`categories.${tool.category}`) }}</Badge>
      </div>
    </div>
    <p class="text-muted-foreground line-clamp-2 text-sm">{{ $t(`tools.${tool.slug}.description`) }}</p>
  </RouterLink>
</template>
