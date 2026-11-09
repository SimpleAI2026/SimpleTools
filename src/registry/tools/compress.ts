import { FileArchive, FileDown, ImageMinus } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'gzip-tool', category: 'compress', icon: FileArchive, keywords: ['gzip', 'zlib', 'deflate', 'compress', '压缩', '解压'], component: () => import('@/tools/gzip-tool/index.vue') },
  { slug: 'image-compressor', category: 'compress', icon: ImageMinus, keywords: ['image', 'compress', 'webp', 'jpg', '压缩'], component: () => import('@/tools/image-compressor/index.vue') },
  { slug: 'pdf-compressor', category: 'compress', icon: FileDown, keywords: ['pdf', 'compress', 'shrink', '压缩'], component: () => import('@/tools/pdf-compressor/index.vue') },
]
export default tools
