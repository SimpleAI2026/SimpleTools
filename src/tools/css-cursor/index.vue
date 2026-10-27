<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Input } from '@/components/ui/input'
import CopyButton from '@/components/shared/CopyButton.vue'
import { CURSOR_GROUPS, cursorCss } from './logic'

const custom = reactive({ url: '', x: 0, y: 0, fallback: 'auto' })
const customCss = computed(() => cursorCss(custom.fallback, { url: custom.url, x: Number(custom.x), y: Number(custom.y) }))
</script>

<template>
  <div class="flex flex-col gap-6">
    <p class="text-muted-foreground text-sm">{{ $t('tools.css-cursor.hover') }}</p>
    <section v-for="(list, g) in CURSOR_GROUPS" :key="g" class="flex flex-col gap-2">
      <h3 class="text-sm font-medium">{{ $t(`tools.css-cursor.groups.${g}`) }}</h3>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        <div v-for="c in list" :key="c" :style="{ cursor: c }" class="hover:bg-accent flex items-center justify-between rounded-md border px-3 py-4 font-mono text-xs">
          {{ c }}<CopyButton :text="`cursor: ${c};`" :label="false" />
        </div>
      </div>
    </section>
    <section class="flex flex-col gap-2">
      <h3 class="text-sm font-medium">{{ $t('tools.css-cursor.custom') }}</h3>
      <div class="flex flex-wrap gap-2">
        <Input v-model="custom.url" class="max-w-md flex-1" :placeholder="$t('tools.css-cursor.url')" />
        <Input v-model.number="custom.x" type="number" class="w-20" :aria-label="$t('tools.css-cursor.hotspot')" />
        <Input v-model.number="custom.y" type="number" class="w-20" :aria-label="$t('tools.css-cursor.hotspot')" />
        <Input v-model="custom.fallback" class="w-28" :aria-label="$t('tools.css-cursor.fallback')" />
      </div>
      <div class="flex items-center gap-2">
        <code class="bg-muted/40 flex-1 rounded border p-2 font-mono text-xs break-all">{{ customCss }}</code>
        <CopyButton :text="customCss" :label="false" />
      </div>
      <div v-if="custom.url" class="flex h-24 items-center justify-center rounded-md border border-dashed" :style="{ cursor: customCss.slice(8, -1) }">{{ $t('tools.css-cursor.hover') }}</div>
    </section>
  </div>
</template>
