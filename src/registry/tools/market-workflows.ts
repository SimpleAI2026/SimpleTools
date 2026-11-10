import { Binary, Coins, Link, Link2 } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'utm-builder', category: 'text', icon: Link2, keywords: ['utm', 'campaign', 'link', '链接', '活动'], component: () => import('@/tools/utm-builder/index.vue') },
  { slug: 'ab-test-analyzer', category: 'office', icon: Coins, keywords: ['ab', 'conversion', 'z-test', '实验', '转化'], component: () => import('@/tools/ab-test-analyzer/index.vue') },
  { slug: 'product-feed-auditor', category: 'office', icon: Binary, keywords: ['feed', 'gtin', 'product', '商品', 'Feed'], component: () => import('@/tools/product-feed-auditor/index.vue') },
  { slug: 'hreflang-map-auditor', category: 'text', icon: Link2, keywords: ['hreflang', 'i18n', 'seo', '多语', '回链'], component: () => import('@/tools/hreflang-map-auditor/index.vue') },
  { slug: 'redirect-migration-planner', category: 'text', icon: Link, keywords: ['redirect', '301', 'migration', '重定向', '迁移'], component: () => import('@/tools/redirect-migration-planner/index.vue') },
]
export default tools
