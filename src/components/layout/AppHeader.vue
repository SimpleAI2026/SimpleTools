<script setup lang="ts">
import { Languages, Moon, Sun, Wrench } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
    <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
      <RouterLink to="/" class="flex items-center gap-2 font-semibold">
        <Wrench class="size-5" />
        {{ $t('app.name') }}
      </RouterLink>
      <div class="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          :aria-label="$t('app.language')"
          data-testid="locale-toggle"
          @click="settings.setLocale(settings.locale === 'zh-CN' ? 'en' : 'zh-CN')"
        >
          <Languages />
          {{ settings.locale === 'zh-CN' ? 'English' : '中文' }}
        </Button>
        <Button variant="ghost" size="icon" :aria-label="$t('app.toggleTheme')" @click="settings.toggleTheme()">
          <Moon v-if="!settings.isDark" />
          <Sun v-else />
        </Button>
      </div>
    </div>
  </header>
</template>
