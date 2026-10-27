import {
  Binary,
  Braces,
  CaseSensitive,
  Clock,
  Fingerprint,
  FileText,
  KeyRound,
  Link2,
  Scaling,
  Shuffle,
} from 'lucide-vue-next'
import type { CategoryId, ToolMeta } from './types'

export { CATEGORIES, type CategoryId, type ToolMeta } from './types'

const CORE_TOOLS: ToolMeta[] = [
  {
    slug: 'json-formatter',
    category: 'developer',
    icon: Braces,
    keywords: ['json', 'format', 'minify', 'validate', '格式化', '校验'],
    component: () => import('@/tools/json-formatter/index.vue'),
  },
  {
    slug: 'base64',
    category: 'encode',
    icon: Binary,
    keywords: ['base64', 'encode', 'decode', '编码'],
    component: () => import('@/tools/base64/index.vue'),
  },
  {
    slug: 'url-encoder',
    category: 'encode',
    icon: Link2,
    keywords: ['url', 'uri', 'percent', 'encode', '编码'],
    component: () => import('@/tools/url-encoder/index.vue'),
  },
  {
    slug: 'hash-generator',
    category: 'encode',
    icon: Fingerprint,
    keywords: ['hash', 'sha', 'sha256', 'digest', 'checksum', '哈希', '摘要'],
    component: () => import('@/tools/hash-generator/index.vue'),
  },
  {
    slug: 'password-generator',
    category: 'generate',
    icon: KeyRound,
    keywords: ['password', 'random', 'secure', '密码', '随机'],
    component: () => import('@/tools/password-generator/index.vue'),
  },
  {
    slug: 'uuid-generator',
    category: 'generate',
    icon: Shuffle,
    keywords: ['uuid', 'guid', 'v4', 'random'],
    component: () => import('@/tools/uuid-generator/index.vue'),
  },
  {
    slug: 'timestamp-converter',
    category: 'convert',
    icon: Clock,
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', '时间戳', '日期'],
    component: () => import('@/tools/timestamp-converter/index.vue'),
  },
  {
    slug: 'case-converter',
    category: 'convert',
    icon: CaseSensitive,
    keywords: ['case', 'camel', 'snake', 'kebab', 'pascal', '大小写', '命名'],
    component: () => import('@/tools/case-converter/index.vue'),
  },
  {
    slug: 'word-counter',
    category: 'text',
    icon: FileText,
    keywords: ['word', 'count', 'characters', '字数', '统计'],
    component: () => import('@/tools/word-counter/index.vue'),
  },
  {
    slug: 'image-resizer',
    category: 'media',
    icon: Scaling,
    keywords: ['image', 'resize', 'scale', 'png', 'jpg', 'webp', '图片', '尺寸', '缩放'],
    component: () => import('@/tools/image-resizer/index.vue'),
  },
]

/** Additional tools, grouped by category under ./tools/<category>.ts (each exports `default: ToolMeta[]`). */
const EXTRA = import.meta.glob<ToolMeta[]>('./tools/*.ts', { eager: true, import: 'default' })

export const TOOLS: ToolMeta[] = [...CORE_TOOLS, ...Object.keys(EXTRA).sort().flatMap((k) => EXTRA[k] ?? [])]

const BY_SLUG = new Map(TOOLS.map((t) => [t.slug, t]))

export function getTool(slug: string): ToolMeta | undefined {
  return BY_SLUG.get(slug)
}

export function toolsInCategory(category: CategoryId): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category)
}

/**
 * Case-insensitive search over slug, keywords and the localized name/description
 * (provided by the caller so this stays framework-agnostic).
 */
export function searchTools(
  query: string,
  localize: (tool: ToolMeta) => string[],
  tools: ToolMeta[] = TOOLS,
): ToolMeta[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return tools
  return tools.filter((t) => {
    const hay = [t.slug, ...t.keywords, ...localize(t)].join(' ').toLowerCase()
    return terms.every((term) => hay.includes(term))
  })
}
