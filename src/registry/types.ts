import type { Component } from 'vue'

export const CATEGORIES = ['developer', 'ai', 'encode', 'generate', 'convert', 'text', 'media', 'pdf', 'office', 'compress'] as const
export type CategoryId = (typeof CATEGORIES)[number]

export interface ToolMeta {
  /** URL slug; also the i18n key under `tools.<slug>` */
  slug: string
  category: CategoryId
  icon: Component
  /** Extra search keywords (both languages) */
  keywords: string[]
  /** Lazy-loaded tool component (separate chunk per tool) */
  component: () => Promise<Component>
}
