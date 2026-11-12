<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { filterGitItems, GIT_GROUPS, type GitItem } from './logic'

const { t } = useI18n()
const query = ref('')
const items = computed(() => {
  const q = query.value.trim().toLowerCase()
  return filterGitItems('').filter((item) => {
    if (!q) return true
    const blob = `${item.command} ${t(`tools.git-cheatsheet.items.${item.id}`)} ${t(`tools.git-cheatsheet.groups.${item.group}`)}`.toLowerCase()
    return q.split(/\s+/).every((term) => blob.includes(term))
  })
})
const grouped = computed(() => GIT_GROUPS.map((group) => ({ group, items: items.value.filter((item) => item.group === group) })).filter((group) => group.items.length))
const allText = computed(() => items.value.map((item: GitItem) => item.command).join('\n'))
</script>

<template>
  <div class="flex flex-col gap-4">
    <Input v-model="query" :placeholder="$t('tools.git-cheatsheet.search')" data-testid="git-search" />
    <section class="flex flex-col gap-3">
      <div class="flex h-8 items-center justify-between">
        <Label>{{ $t('common.output') }}</Label>
        <CopyButton :text="allText" />
      </div>
      <p v-if="!grouped.length" class="text-muted-foreground text-sm">{{ $t('tools.git-cheatsheet.none') }}</p>
      <div v-for="group in grouped" :key="group.group" class="flex flex-col gap-2">
        <h2 class="text-sm font-semibold">{{ $t(`tools.git-cheatsheet.groups.${group.group}`) }}</h2>
        <article v-for="item in group.items" :key="item.id" class="rounded-md border p-3">
          <div class="flex items-start justify-between gap-2">
            <code class="min-w-0 font-mono text-sm break-all">{{ item.command }}</code>
            <CopyButton :text="item.command" :label="false" />
          </div>
          <p class="text-muted-foreground mt-1 text-sm">{{ $t(`tools.git-cheatsheet.items.${item.id}`) }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
