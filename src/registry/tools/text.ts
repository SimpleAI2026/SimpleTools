import { ArrowDownUp, Eraser, FileDiff, Link, ListOrdered, Repeat, Ruler, StickyNote, Type } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'diff-checker', category: 'text', icon: FileDiff, keywords: ['diff', 'compare', '对比', '比较'], component: () => import('@/tools/diff-checker/index.vue') },
  { slug: 'notepad', category: 'text', icon: StickyNote, keywords: ['notepad', 'note', '记事本', '笔记'], component: () => import('@/tools/notepad/index.vue') },
  { slug: 'text-lines', category: 'text', icon: ListOrdered, keywords: ['sort', 'dedupe', 'lines', '排序', '去重'], component: () => import('@/tools/text-lines/index.vue') },
  { slug: 'text-cleaner', category: 'text', icon: Eraser, keywords: ['clean', 'whitespace', '清理', '空格'], component: () => import('@/tools/text-cleaner/index.vue') },
  { slug: 'slug-generator', category: 'text', icon: Link, keywords: ['slug', 'url', 'permalink'], component: () => import('@/tools/slug-generator/index.vue') },
  { slug: 'text-size-calculator', category: 'text', icon: Ruler, keywords: ['bytes', 'size', 'utf8', '字节', 'sms'], component: () => import('@/tools/text-size-calculator/index.vue') },
  { slug: 'unicode-styles', category: 'text', icon: Type, keywords: ['font', 'bold', 'italic', 'fancy', '字体', '花式'], component: () => import('@/tools/unicode-styles/index.vue') },
  { slug: 'upside-down-text', category: 'text', icon: ArrowDownUp, keywords: ['upside', 'flip', 'reverse', '颠倒', '倒置'], component: () => import('@/tools/upside-down-text/index.vue') },
  { slug: 'text-repeater', category: 'text', icon: Repeat, keywords: ['repeat', '重复'], component: () => import('@/tools/text-repeater/index.vue') },
]
export default tools
