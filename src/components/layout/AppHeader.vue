<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Code2, Github, Languages, Menu, Moon, Sun } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import AppIcon from '@/components/shared/AppIcon.vue'
import InstallExtensionModal, { type ExtensionKind } from '@/components/layout/InstallExtensionModal.vue'
import { LOCALE_META, SUPPORTED_LOCALES, type AppLocale } from '@/i18n'
import { useSettingsStore } from '@/stores/settings'
import { isImmersiveSlug } from '@/router/immersive'

const settings = useSettingsStore()
const route = useRoute()
const isImmersive = computed(() => route.name === 'tool' && isImmersiveSlug(route.params.slug))

function onLocaleChange(event: Event) {
  settings.setLocale((event.target as HTMLSelectElement).value as AppLocale)
}

const GITHUB_URL = 'https://github.com/SimpleAI2026/SimpleTools'

/** Hide self-download when already running inside an extension build. */
const showExtensionDownloads =
  import.meta.env.VITE_TARGET !== 'chrome' && import.meta.env.VITE_TARGET !== 'vscode'

const modalOpen = ref(false)
const modalKind = ref<ExtensionKind>('chrome')

function openInstall(kind: ExtensionKind) {
  modalKind.value = kind
  modalOpen.value = true
  moreOpen.value = false
}

const moreOpen = ref(false)
const moreRoot = ref<HTMLElement | null>(null)

function onDocPointerDown(event: PointerEvent) {
  const root = moreRoot.value
  if (!moreOpen.value || !root) return
  if (event.target instanceof Node && !root.contains(event.target)) {
    moreOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown)
})
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-10 border-b backdrop-blur">
    <div class="mx-auto flex h-14 items-center gap-3 px-4" :class="isImmersive ? 'max-w-7xl' : 'max-w-6xl'">
      <RouterLink to="/" class="flex items-center gap-2 font-semibold">
        <AppIcon class="size-5" />
        {{ $t('app.name') }}
      </RouterLink>
      <div class="ml-auto flex items-center gap-1">
        <!-- Desktop md+: keep inline Chrome / VS Code / locale / theme -->
        <template v-if="showExtensionDownloads">
          <Button
            variant="ghost"
            size="sm"
            class="hidden md:inline-flex"
            :aria-label="$t('app.extensions.chrome')"
            data-testid="chrome-extension-entry"
            @click="openInstall('chrome')"
          >
            <AppIcon />
            <span class="max-w-[7.5rem] truncate">{{ $t('app.extensions.chrome') }}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="hidden md:inline-flex"
            :aria-label="$t('app.extensions.vscode')"
            data-testid="vscode-extension-entry"
            @click="openInstall('vscode')"
          >
            <Code2 />
            <span class="max-w-[7.5rem] truncate">{{ $t('app.extensions.vscode') }}</span>
          </Button>
        </template>

        <Button
          variant="ghost"
          size="icon"
          class="hidden size-11 md:inline-flex"
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

        <label class="relative hidden items-center gap-1 md:inline-flex">
          <Languages class="pointer-events-none absolute left-2 size-4 opacity-70" />
          <select
            class="border-input bg-background hover:bg-accent h-8 max-w-[11rem] cursor-pointer appearance-none rounded-md border py-1 pr-7 pl-8 text-sm"
            :aria-label="$t('app.language')"
            data-testid="locale-select"
            :value="settings.locale"
            @change="onLocaleChange"
          >
            <option v-for="loc in SUPPORTED_LOCALES" :key="loc" :value="loc">
              {{ LOCALE_META[loc].nativeLabel }}
            </option>
          </select>
        </label>

        <Button
          variant="ghost"
          size="icon"
          class="hidden size-11 md:inline-flex"
          :aria-label="$t('app.toggleTheme')"
          @click="settings.toggleTheme()"
        >
          <Moon v-if="!settings.isDark" />
          <Sun v-else />
        </Button>

        <!-- Mobile <md: GitHub + More overflow menu -->
        <Button variant="ghost" size="icon" class="size-11 md:hidden" as-child data-testid="github-link-mobile">
          <a :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" :aria-label="$t('app.github')"><Github /></a>
        </Button>
        <div ref="moreRoot" class="relative md:hidden">
          <Button
            variant="ghost"
            size="icon"
            class="size-11"
            data-testid="header-more"
            :aria-expanded="moreOpen"
            :aria-label="$t('app.moreMenu')"
            @click="moreOpen = !moreOpen"
          >
            <Menu />
          </Button>
          <div
            v-if="moreOpen"
            class="bg-popover absolute top-full right-0 z-20 mt-1 w-56 rounded-md border p-2 shadow-md"
            role="menu"
          >
            <label class="mb-2 flex flex-col gap-1 px-1 text-xs">
              <span class="text-muted-foreground">{{ $t('app.language') }}</span>
              <select
                class="border-input bg-background h-11 w-full rounded-md border px-2 text-sm"
                :value="settings.locale"
                @change="onLocaleChange"
              >
                <option v-for="loc in SUPPORTED_LOCALES" :key="loc" :value="loc">
                  {{ LOCALE_META[loc].nativeLabel }}
                </option>
              </select>
            </label>
            <Button variant="ghost" class="h-11 w-full justify-start" @click="settings.toggleTheme(); moreOpen = false">
              <Moon v-if="!settings.isDark" /><Sun v-else /> {{ $t('app.toggleTheme') }}
            </Button>
            <template v-if="showExtensionDownloads">
              <Button
                variant="ghost"
                class="h-11 w-full justify-start"
                data-testid="chrome-extension-entry-icon"
                @click="openInstall('chrome')"
              >
                <AppIcon /> {{ $t('app.extensions.chrome') }}
              </Button>
              <Button
                variant="ghost"
                class="h-11 w-full justify-start"
                data-testid="vscode-extension-entry-icon"
                @click="openInstall('vscode')"
              >
                <Code2 /> {{ $t('app.extensions.vscode') }}
              </Button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <InstallExtensionModal v-if="showExtensionDownloads" v-model:open="modalOpen" :kind="modalKind" />
  </header>
</template>
