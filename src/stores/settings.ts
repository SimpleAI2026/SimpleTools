import { computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useColorMode, useLocalStorage } from '@vueuse/core'
import { globalLocale, LOCALE_STORAGE_KEY, type AppLocale } from '@/i18n'

/** UI preferences: language (persisted) and color theme. */
export const useSettingsStore = defineStore('settings', () => {
  const locale = useLocalStorage<AppLocale>(LOCALE_STORAGE_KEY, globalLocale.value)
  const colorMode = useColorMode({ storageKey: 'st_theme' })

  const isDark = computed(() => colorMode.state.value === 'dark')

  watch(
    locale,
    (l) => {
      globalLocale.value = l
      document.documentElement.lang = l
    },
    { immediate: true },
  )

  function setLocale(l: AppLocale): void {
    locale.value = l
  }
  function toggleTheme(): void {
    colorMode.value = isDark.value ? 'light' : 'dark'
  }

  return { locale, isDark, setLocale, toggleTheme }
})
