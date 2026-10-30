<script setup lang="ts">
import { ref } from 'vue'
import { Code2, Github, Languages, Moon, Puzzle, Sun, Wrench } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import InstallExtensionModal, { type ExtensionKind } from '@/components/layout/InstallExtensionModal.vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

const GITHUB_URL = 'https://github.com/SimpleAI2026/SimpleTools'

/** Hide self-download when already running inside an extension build. */
const showExtensionDownloads =
  import.meta.env.VITE_TARGET !== 'chrome' && import.meta.env.VITE_TARGET !== 'vscode'

const modalOpen = ref(false)
const modalKind = ref<ExtensionKind>('chrome')

function openInstall(kind: ExtensionKind) {
  modalKind.value = kind
  modalOpen.value = true
}
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
    <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
      <RouterLink to="/" class="flex items-center gap-2 font-semibold">
        <Wrench class="size-5" />
        {{ $t('app.name') }}
      </RouterLink>
      <div class="ml-auto flex items-center gap-1">
        <template v-if="showExtensionDownloads">
          <Button
            variant="ghost"
            size="sm"
            class="hidden sm:inline-flex"
            :aria-label="$t('app.extensions.chrome')"
            data-testid="chrome-extension-entry"
            @click="openInstall('chrome')"
          >
            <Puzzle />
            <span class="max-w-[7.5rem] truncate">{{ $t('app.extensions.chrome') }}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="sm:hidden"
            :aria-label="$t('app.extensions.chrome')"
            data-testid="chrome-extension-entry-icon"
            @click="openInstall('chrome')"
          >
            <Puzzle />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="hidden sm:inline-flex"
            :aria-label="$t('app.extensions.vscode')"
            data-testid="vscode-extension-entry"
            @click="openInstall('vscode')"
          >
            <Code2 />
            <span class="max-w-[7.5rem] truncate">{{ $t('app.extensions.vscode') }}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            class="sm:hidden"
            :aria-label="$t('app.extensions.vscode')"
            data-testid="vscode-extension-entry-icon"
            @click="openInstall('vscode')"
          >
            <Code2 />
          </Button>
        </template>
        <Button
          variant="ghost"
          size="icon"
          as-child
          data-testid="github-link"
        >
          <a
            :href="GITHUB_URL"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="$t('app.github')"
            :title="$t('app.github')"
          >
            <Github />
          </a>
        </Button>
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
    <InstallExtensionModal v-if="showExtensionDownloads" v-model:open="modalOpen" :kind="modalKind" />
  </header>
</template>
