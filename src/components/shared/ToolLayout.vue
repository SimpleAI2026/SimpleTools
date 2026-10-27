<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, Star } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import type { ToolMeta } from '@/registry'
import { useUserStore } from '@/stores/user'

const props = defineProps<{ tool: ToolMeta }>()
const user = useUserStore()
const fav = computed(() => user.isFavorite(props.tool.slug))
</script>

<template>
  <div class="flex flex-col gap-6">
    <div>
      <RouterLink to="/" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
        <ArrowLeft class="size-4" /> {{ $t('app.back') }}
      </RouterLink>
    </div>
    <div class="flex items-start gap-4">
      <div class="bg-secondary flex size-12 shrink-0 items-center justify-center rounded-xl">
        <component :is="tool.icon" class="size-6" />
      </div>
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-semibold">{{ $t(`tools.${tool.slug}.name`) }}</h1>
        <p class="text-muted-foreground mt-1 text-sm">{{ $t(`tools.${tool.slug}.description`) }}</p>
      </div>
      <Button
        variant="outline"
        size="icon"
        :aria-label="fav ? $t('app.removeFavorite') : $t('app.addFavorite')"
        :aria-pressed="fav"
        @click="user.toggleFavorite(tool.slug)"
      >
        <Star :class="fav ? 'fill-yellow-400 text-yellow-500' : ''" />
      </Button>
    </div>
    <slot />
  </div>
</template>
