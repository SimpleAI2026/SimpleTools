import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { TOOLS } from '@/registry'
import { pushRecent, sanitizeSlugs, toggleItem } from './list-utils'

const KNOWN = new Set(TOOLS.map((t) => t.slug))

/** Favorites and recently used tools, persisted in localStorage. */
export const useUserStore = defineStore('user', () => {
  const favoritesRaw = useLocalStorage<string[]>('st_favorites', [])
  const recentRaw = useLocalStorage<string[]>('st_recent', [])

  const favorites = computed(() => sanitizeSlugs(favoritesRaw.value, KNOWN))
  const recent = computed(() => sanitizeSlugs(recentRaw.value, KNOWN))

  function isFavorite(slug: string): boolean {
    return favorites.value.includes(slug)
  }
  function toggleFavorite(slug: string): void {
    favoritesRaw.value = toggleItem(favorites.value, slug)
  }
  function addRecent(slug: string): void {
    if (KNOWN.has(slug)) recentRaw.value = pushRecent(recent.value, slug)
  }
  function clearRecent(): void {
    recentRaw.value = []
  }

  return { favorites, recent, isFavorite, toggleFavorite, addRecent, clearRecent }
})
