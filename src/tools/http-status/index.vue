<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from '@/components/ui/input'
import { searchStatuses, statusClass } from './logic'

const { locale } = useI18n()
const q = ref('')
const list = computed(() => searchStatuses(q.value))
const color = { '1xx': 'bg-sky-500', '2xx': 'bg-emerald-500', '3xx': 'bg-amber-500', '4xx': 'bg-orange-600', '5xx': 'bg-red-600' }
</script>

<template>
  <div class="flex flex-col gap-4">
    <Input v-model="q" :placeholder="$t('tools.http-status.search')" class="max-w-md" />
    <p v-if="!list.length" class="text-muted-foreground text-sm">{{ $t('tools.http-status.none') }}</p>
    <div class="grid gap-2 sm:grid-cols-2">
      <div v-for="s in list" :key="s.code" class="flex items-start gap-3 rounded-md border p-3">
        <span :class="['rounded px-2 py-0.5 font-mono text-sm font-bold text-white', color[statusClass(s.code)]]">{{ s.code }}</span>
        <div><div class="font-medium">{{ s.en }}</div><div class="text-muted-foreground text-sm">{{ locale === 'zh-CN' ? s.zh : '' }}</div></div>
      </div>
    </div>
  </div>
</template>
