import { Binary, Bot, Coins, Link, Link2, MessageSquare, Ruler, ScanSearch } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: "utm-builder", category: "text", icon: Link2, keywords: ["utm", "campaign", "link", "链接", "活动"], component: () => import('@/tools/utm-builder/index.vue') },
  { slug: "owned-marketing-report", category: "office", icon: Coins, keywords: ["reconciliation", "ads", "orders", "对账", "报表"], component: () => import('@/tools/owned-marketing-report/index.vue') },
  { slug: "keyword-intent-map", category: "text", icon: ScanSearch, keywords: ["keyword", "intent", "url", "关键词", "意图"], component: () => import('@/tools/keyword-intent-map/index.vue') },
  { slug: "campaign-unit-economics", category: "office", icon: Coins, keywords: ["roas", "margin", "fx", "利润", "汇率"], component: () => import('@/tools/campaign-unit-economics/index.vue') },
  { slug: "cohort-retention-analyzer", category: "office", icon: Bot, keywords: ["cohort", "retention", "users", "留存", "分群"], component: () => import('@/tools/cohort-retention-analyzer/index.vue') },
  { slug: "ab-test-analyzer", category: "office", icon: Coins, keywords: ["ab", "conversion", "z-test", "实验", "转化"], component: () => import('@/tools/ab-test-analyzer/index.vue') },
  { slug: "responsive-ad-asset-validator", category: "text", icon: Ruler, keywords: ["ads", "headline", "pin", "广告", "文案"], component: () => import('@/tools/responsive-ad-asset-validator/index.vue') },
  { slug: "product-feed-auditor", category: "office", icon: Binary, keywords: ["feed", "gtin", "product", "商品", "Feed"], component: () => import('@/tools/product-feed-auditor/index.vue') },
  { slug: "hreflang-map-auditor", category: "text", icon: Link2, keywords: ["hreflang", "i18n", "seo", "多语", "回链"], component: () => import('@/tools/hreflang-map-auditor/index.vue') },
  { slug: "redirect-migration-planner", category: "text", icon: Link, keywords: ["redirect", "301", "migration", "重定向", "迁移"], component: () => import('@/tools/redirect-migration-planner/index.vue') },
  { slug: "promotion-stack-simulator", category: "office", icon: Coins, keywords: ["promotion", "discount", "price", "促销", "到手价"], component: () => import('@/tools/promotion-stack-simulator/index.vue') },
  { slug: "review-theme-coder", category: "office", icon: MessageSquare, keywords: ["review", "theme", "coding", "反馈", "主题"], component: () => import('@/tools/review-theme-coder/index.vue') },
]
export default tools
