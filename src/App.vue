<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import { useSettingsStore } from '@/stores/settings'

useSettingsStore()
</script>

<template>
  <div class="min-h-screen">
    <AppHeader />
    <main class="mx-auto w-full max-w-6xl px-4 py-6">
      <RouterView />
    </main>
    <footer class="text-muted-foreground mx-auto max-w-6xl px-4 py-8 text-center text-xs">
      {{ $t('app.privacy') }}
    </footer>
  </div>
</template>
