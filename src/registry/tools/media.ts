import { Crop, Grid3x3, ImageDown, Palette, Spline, Square, SquareDashed, Wand2 } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'border-radius-generator', category: 'media', icon: SquareDashed, keywords: ['css', 'border-radius', '圆角'], component: () => import('@/tools/border-radius-generator/index.vue') },
  { slug: 'box-shadow-generator', category: 'media', icon: Square, keywords: ['css', 'box-shadow', '阴影'], component: () => import('@/tools/box-shadow-generator/index.vue') },
  { slug: 'cubic-bezier-editor', category: 'media', icon: Spline, keywords: ['css', 'easing', 'bezier', 'animation', '缓动'], component: () => import('@/tools/cubic-bezier-editor/index.vue') },
  { slug: 'gradient-generator', category: 'media', icon: Palette, keywords: ['css', 'gradient', '渐变'], component: () => import('@/tools/gradient-generator/index.vue') },
  { slug: 'image-editor', category: 'media', icon: Crop, keywords: ['image', 'crop', 'rotate', 'flip', '裁剪'], component: () => import('@/tools/image-editor/index.vue') },
  { slug: 'image-filters', category: 'media', icon: Wand2, keywords: ['image', 'filter', 'grayscale', 'sepia', '滤镜'], component: () => import('@/tools/image-filters/index.vue') },
  { slug: 'image-format-converter', category: 'media', icon: ImageDown, keywords: ['image', 'webp', 'png', 'jpg', 'convert', '格式'], component: () => import('@/tools/image-format-converter/index.vue') },
  { slug: 'image-splitter', category: 'media', icon: Grid3x3, keywords: ['image', 'split', 'grid', 'tiles', '切割', '九宫格'], component: () => import('@/tools/image-splitter/index.vue') },
]
export default tools
