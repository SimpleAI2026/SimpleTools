<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ToolCard from '@/components/shared/ToolCard.vue'
import { CATEGORIES, getTool, searchTools, TOOLS, type CategoryId, type ToolMeta } from '@/registry'
import { useUserStore } from '@/stores/user'
import { cn } from '@/lib/utils'

const { t } = useI18n()
const user = useUserStore()
const query = ref('')
const category = ref<CategoryId | 'all'>('all')

const usedCategories = CATEGORIES.filter((c) => TOOLS.some((tool) => tool.category === c))

const filtered = computed(() => {
  const pool = category.value === 'all' ? TOOLS : TOOLS.filter((tool) => tool.category === category.value)
  return searchTools(query.value, (tool) => [t(`tools.${tool.slug}.name`), t(`tools.${tool.slug}.description`)], pool)
})

const toTools = (slugs: string[]) => slugs.map(getTool).filter((x): x is ToolMeta => !!x)
const favoriteTools = computed(() => toTools(user.favorites))
const recentTools = computed(() => toTools(user.recent).slice(0, 6))
const browsing = computed(() => !query.value.trim() && category.value === 'all')
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="flex flex-col gap-4 pt-6 text-center">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">{{ $t('app.name') }}</h1>
      <p class="text-muted-foreground">{{ $t('app.tagline') }}</p>
      <div class="relative mx-auto w-full max-w-lg">
        <Search class="text-muted-foreground absolute top-2.5 left-3 size-4" />
        <Input v-model="query" type="search" :placeholder="$t('app.search')" class="pl-9" data-testid="search" />
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        <Button
          v-for="c in ['all', ...usedCategories] as const"
          :key="c"
          size="sm"
          :variant="category === c ? 'default' : 'outline'"
          @click="category = c"
        >
          {{ c === 'all' ? $t('app.all') : $t(`categories.${c}`) }}
        </Button>
      </div>
    </section>

    <section v-if="browsing && favoriteTools.length" class="flex flex-col gap-3">
      <h2 class="font-semibold">{{ $t('app.favorites') }}</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ToolCard v-for="tool in favoriteTools" :key="tool.slug" :tool="tool" />
      </div>
    </section>

    <section v-if="browsing && recentTools.length" class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">{{ $t('app.recent') }}</h2>
        <Button variant="ghost" size="sm" @click="user.clearRecent()">{{ $t('app.clearRecent') }}</Button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ToolCard v-for="tool in recentTools" :key="tool.slug" :tool="tool" />
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 :class="cn('font-semibold', !browsing && 'sr-only')">
        {{ $t('app.all') }} · {{ $t('app.toolCount', { n: TOOLS.length }) }}
      </h2>
      <div v-if="filtered.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ToolCard v-for="tool in filtered" :key="tool.slug" :tool="tool" />
      </div>
      <p v-else class="text-muted-foreground py-12 text-center">{{ $t('app.noResults') }}</p>
    </section>
  </div>
</template>
