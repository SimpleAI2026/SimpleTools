<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ToolCard from '@/components/shared/ToolCard.vue'
import { CATEGORIES, getTool, searchTools, TOOLS, type CategoryId, type ToolMeta } from '@/registry'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const user = useUserStore()
const query = ref('')
const category = ref<CategoryId | 'all'>('all')

const categoryCounts = new Map<CategoryId, number>()
for (const tool of TOOLS) categoryCounts.set(tool.category, (categoryCounts.get(tool.category) ?? 0) + 1)
const usedCategories = CATEGORIES.filter((c) => (categoryCounts.get(c) ?? 0) > 0)
const categoryItems: { id: CategoryId | 'all'; count: number }[] = [
  { id: 'all', count: TOOLS.length },
  ...usedCategories.map((id) => ({ id, count: categoryCounts.get(id) ?? 0 })),
]

const filtered = computed(() => {
  const pool = category.value === 'all' ? TOOLS : TOOLS.filter((tool) => tool.category === category.value)
  return searchTools(query.value, (tool) => [t(`tools.${tool.slug}.name`), t(`tools.${tool.slug}.description`)], pool)
})
const selectedCategoryName = computed(() => category.value === 'all' ? t('app.all') : t(`categories.${category.value}`))

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
    </section>

    <div class="flex flex-col gap-6 md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:items-start">
      <select
        v-model="category"
        class="border-input bg-background h-11 w-full min-w-0 rounded-md border px-3 text-sm md:hidden"
        :aria-label="$t('app.categoryNavigation')"
        data-testid="category-select"
      >
        <option v-for="item in categoryItems" :key="item.id" :value="item.id">
          {{ item.id === 'all' ? $t('app.all') : $t(`categories.${item.id}`) }} · {{ item.count }}
        </option>
      </select>

      <aside class="hidden min-w-0 md:sticky md:top-20 md:max-h-[calc(100dvh-6rem)] md:block md:overflow-y-auto">
        <nav
          class="flex flex-col gap-2 rounded-xl border bg-card p-3"
          :aria-label="$t('app.categoryNavigation')"
          data-testid="category-navigation"
        >
          <Button
            v-for="item in categoryItems"
            :key="item.id"
            size="sm"
            :variant="category === item.id ? 'default' : 'outline'"
            class="min-h-11 w-full justify-start"
            :aria-pressed="category === item.id"
            :data-testid="`category-${item.id}`"
            @click="category = item.id"
          >
            <span>{{ item.id === 'all' ? $t('app.all') : $t(`categories.${item.id}`) }}</span>
            <span class="ml-auto pl-3 text-xs opacity-70">{{ item.count }}</span>
          </Button>
        </nav>
      </aside>

      <div class="flex min-w-0 flex-col gap-8">
        <section v-if="browsing && favoriteTools.length" class="flex flex-col gap-3">
          <h2 class="font-semibold">{{ $t('app.favorites') }}</h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard v-for="tool in favoriteTools" :key="tool.slug" :tool="tool" />
          </div>
        </section>

        <section v-if="browsing && recentTools.length" class="flex flex-col gap-3" data-testid="recent-section">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ $t('app.recent') }}</h2>
            <Button variant="ghost" size="sm" @click="user.clearRecent()">{{ $t('app.clearRecent') }}</Button>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard v-for="tool in recentTools" :key="tool.slug" :tool="tool" />
          </div>
        </section>

        <section class="flex flex-col gap-3">
          <h2 class="font-semibold" aria-live="polite" data-testid="tool-list-title">
            {{ selectedCategoryName }} · {{ $t('app.toolCount', { n: filtered.length }) }}
          </h2>
          <div v-if="filtered.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="tool-list">
            <ToolCard v-for="tool in filtered" :key="tool.slug" :tool="tool" />
          </div>
          <p v-else class="text-muted-foreground py-12 text-center">{{ $t('app.noResults') }}</p>
        </section>
      </div>
    </div>
  </div>
</template>
