import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useTheme() {
  const settings = useSettingsStore()
  const isDark = computed(() => settings.isDark)
  const mode = computed(() => settings.isDark ? 'dark' : 'light')
  return { mode, isDark, cycle: settings.toggleTheme }
}
