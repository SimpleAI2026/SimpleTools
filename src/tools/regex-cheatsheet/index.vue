<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CopyButton from '@/components/shared/CopyButton.vue'
import { filterRegex, REGEX_GROUPS } from './logic'

const { t } = useI18n()
const query = ref('')
const items = computed(() => filterRegex(query.value, (item) => `${t(`tools.regex-cheatsheet.items.${item.id}`)} ${t(`tools.regex-cheatsheet.groups.${item.group}`)}`))
const grouped = computed(() => REGEX_GROUPS.map((group) => ({ group, items: items.value.filter((item) => item.group === group) })).filter((group) => group.items.length))
const text = computed(() => items.value.map((item) => item.pattern).join('\n'))
</script>

<template>
  <div class="flex flex-col gap-4">
    <Input v-model="query" :placeholder="$t('tools.regex-cheatsheet.search')" />
    <p class="text-sm"><RouterLink to="/tools/regex-tester" class="text-primary underline">{{ $t('tools.regex-cheatsheet.openTester') }}</RouterLink></p>
    <section class="flex flex-col gap-3">
      <div class="flex h-8 items-center justify-between"><Label>{{ $t('common.output') }}</Label><CopyButton :text="text" /></div>
      <p v-if="!grouped.length" class="text-muted-foreground text-sm">{{ $t('tools.regex-cheatsheet.none') }}</p>
      <div v-for="group in grouped" :key="group.group" class="flex flex-col gap-2">
        <h2 class="text-sm font-semibold">{{ $t(`tools.regex-cheatsheet.groups.${group.group}`) }}</h2>
        <article v-for="item in group.items" :key="item.id" class="rounded-md border p-3">
          <div class="flex items-start justify-between gap-2">
            <code class="font-mono text-sm">{{ item.pattern }}</code>
            <CopyButton :text="item.pattern" :label="false" />
          </div>
          <p class="text-muted-foreground mt-1 text-sm">{{ $t(`tools.regex-cheatsheet.items.${item.id}`) }}</p>
        </article>
      </div>
    </section>
  </div>
</template>
