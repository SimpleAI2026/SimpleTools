import { ArrowRightLeft, Binary, Braces, FileCode, FileImage, FileJson, FileType, Image, Palette, Ruler, Scale, Sheet, Type } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'color-converter', category: 'convert', icon: Palette, keywords: ['color', 'hex', 'rgb', 'hsl', 'cmyk', 'oklch', '颜色'], component: () => import('@/tools/color-converter/index.vue') },
  { slug: 'css-unit-converter', category: 'convert', icon: Ruler, keywords: ['css', 'px', 'rem', 'em', 'vw', 'unit'], component: () => import('@/tools/css-unit-converter/index.vue') },
  { slug: 'csv-json', category: 'convert', icon: Sheet, keywords: ['csv', 'json', 'convert'], component: () => import('@/tools/csv-json/index.vue') },
  { slug: 'html-markdown', category: 'convert', icon: ArrowRightLeft, keywords: ['html', 'markdown', 'md', 'turndown'], component: () => import('@/tools/html-markdown/index.vue') },
  { slug: 'html-to-image', category: 'convert', icon: Image, keywords: ['html', 'image', 'png', 'screenshot', '截图'], component: () => import('@/tools/html-to-image/index.vue') },
  { slug: 'json-xml', category: 'convert', icon: FileCode, keywords: ['json', 'xml', 'convert'], component: () => import('@/tools/json-xml/index.vue') },
  { slug: 'json-yaml', category: 'convert', icon: FileJson, keywords: ['json', 'yaml', 'yml'], component: () => import('@/tools/json-yaml/index.vue') },
  { slug: 'md-to-html', category: 'convert', icon: FileType, keywords: ['markdown', 'html', 'md'], component: () => import('@/tools/md-to-html/index.vue') },
  { slug: 'number-base', category: 'convert', icon: Binary, keywords: ['binary', 'hex', 'octal', 'base', '进制'], component: () => import('@/tools/number-base/index.vue') },
  { slug: 'roman-numerals', category: 'convert', icon: Type, keywords: ['roman', 'numeral', '罗马'], component: () => import('@/tools/roman-numerals/index.vue') },
  { slug: 'svg-to-png', category: 'convert', icon: FileImage, keywords: ['svg', 'png', 'jpg', 'rasterize'], component: () => import('@/tools/svg-to-png/index.vue') },
  { slug: 'toml-json', category: 'convert', icon: Braces, keywords: ['toml', 'json', 'config'], component: () => import('@/tools/toml-json/index.vue') },
  { slug: 'unit-converter', category: 'convert', icon: Scale, keywords: ['unit', 'length', 'weight', 'temperature', '单位', '换算'], component: () => import('@/tools/unit-converter/index.vue') },
]
export default tools
