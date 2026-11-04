<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useSettingsStore } from '@/stores/settings'

useSettingsStore()
const route = useRoute()
const isAgent = computed(
  () => route.name === 'agent' || (route.name === 'tool' && route.params.slug === 'agent'),
)
</script>

<template>
  <div class="min-h-screen" :class="isAgent ? 'flex h-dvh flex-col overflow-hidden' : ''">
    <AppHeader />
    <main
      :class="
        isAgent
          ? 'mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-0 pt-2 sm:px-4 sm:pt-3 sm:pb-3'
          : 'mx-auto w-full max-w-6xl px-4 py-6'
      "
    >
      <RouterView />
    </main>
    <footer
      v-if="!isAgent"
      class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs"
    >
      {{ $t('app.privacy') }}
    </footer>
  </div>
</template>
