import {
  RotateCw, Info, Lock, LockOpen, Eraser, Hash, Crop, Scaling, Layers, Layers2, Droplets, Images, FileText, FileType, FileImage, FileCode2, FileDown,
  FilePlus2, EyeOff, ScanSearch, GitCompare, PenLine, Sheet, Presentation, FileType2, ScanEye,
} from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const c = 'pdf' as const
const tools: ToolMeta[] = [
  { slug: 'pdf-rotate', category: c, icon: RotateCw, keywords: ['pdf', 'rotate', '旋转'], component: () => import('@/tools/pdf-rotate/index.vue') },
  { slug: 'pdf-metadata', category: c, icon: Info, keywords: ['pdf', 'metadata', 'title', 'author', '元数据'], component: () => import('@/tools/pdf-metadata/index.vue') },
  { slug: 'pdf-protect', category: c, icon: Lock, keywords: ['pdf', 'password', 'encrypt', '加密'], component: () => import('@/tools/pdf-protect/index.vue') },
  { slug: 'pdf-unlock', category: c, icon: LockOpen, keywords: ['pdf', 'password', 'decrypt', '解密'], component: () => import('@/tools/pdf-unlock/index.vue') },
  { slug: 'pdf-remove-annotations', category: c, icon: Eraser, keywords: ['pdf', 'annotations', 'comments', '注释'], component: () => import('@/tools/pdf-remove-annotations/index.vue') },
  { slug: 'pdf-page-numbers', category: c, icon: Hash, keywords: ['pdf', 'page numbers', '页码'], component: () => import('@/tools/pdf-page-numbers/index.vue') },
  { slug: 'pdf-crop', category: c, icon: Crop, keywords: ['pdf', 'crop', 'margin', '裁剪'], component: () => import('@/tools/pdf-crop/index.vue') },
  { slug: 'pdf-scale-pages', category: c, icon: Scaling, keywords: ['pdf', 'scale', 'resize', 'a4', '缩放'], component: () => import('@/tools/pdf-scale-pages/index.vue') },
  { slug: 'pdf-flatten', category: c, icon: Layers, keywords: ['pdf', 'flatten', 'form', '扁平化'], component: () => import('@/tools/pdf-flatten/index.vue') },
  { slug: 'pdf-overlay', category: c, icon: Layers2, keywords: ['pdf', 'overlay', 'letterhead', 'stamp', '叠加'], component: () => import('@/tools/pdf-overlay/index.vue') },
  { slug: 'pdf-watermark', category: c, icon: Droplets, keywords: ['pdf', 'watermark', '水印'], component: () => import('@/tools/pdf-watermark/index.vue') },
  { slug: 'image-to-pdf', category: c, icon: Images, keywords: ['image', 'jpg', 'png', 'pdf', '图片'], component: () => import('@/tools/image-to-pdf/index.vue') },
  { slug: 'text-to-pdf', category: c, icon: FileText, keywords: ['text', 'txt', 'pdf', '文本'], component: () => import('@/tools/text-to-pdf/index.vue') },
  { slug: 'html-to-pdf', category: c, icon: FileCode2, keywords: ['html', 'pdf', 'web'], component: () => import('@/tools/html-to-pdf/index.vue') },
  { slug: 'word-to-pdf', category: c, icon: FileDown, keywords: ['word', 'docx', 'pdf'], component: () => import('@/tools/word-to-pdf/index.vue') },
  { slug: 'pdf-creator', category: c, icon: FilePlus2, keywords: ['pdf', 'create', 'markdown', '创建'], component: () => import('@/tools/pdf-creator/index.vue') },
  { slug: 'pdf-redact', category: c, icon: EyeOff, keywords: ['pdf', 'redact', 'privacy', '脱敏', '涂黑'], component: () => import('@/tools/pdf-redact/index.vue') },
  { slug: 'pdf-auto-redact', category: c, icon: ScanSearch, keywords: ['pdf', 'redact', 'regex', 'pii', '脱敏'], component: () => import('@/tools/pdf-auto-redact/index.vue') },
  { slug: 'pdf-compare', category: c, icon: GitCompare, keywords: ['pdf', 'compare', 'diff', '对比'], component: () => import('@/tools/pdf-compare/index.vue') },
  { slug: 'pdf-editor', category: c, icon: PenLine, keywords: ['pdf', 'edit', 'sign', 'text', '编辑'], component: () => import('@/tools/pdf-editor/index.vue') },
  { slug: 'pdf-to-excel', category: c, icon: Sheet, keywords: ['pdf', 'excel', 'xlsx', 'table', '表格'], component: () => import('@/tools/pdf-to-excel/index.vue') },
  { slug: 'pdf-to-image', category: c, icon: FileImage, keywords: ['pdf', 'image', 'png', 'jpg', '图片'], component: () => import('@/tools/pdf-to-image/index.vue') },
  { slug: 'pdf-to-markdown', category: c, icon: FileType2, keywords: ['pdf', 'markdown', 'md'], component: () => import('@/tools/pdf-to-markdown/index.vue') },
  { slug: 'pdf-to-ppt', category: c, icon: Presentation, keywords: ['pdf', 'ppt', 'pptx', 'slides'], component: () => import('@/tools/pdf-to-ppt/index.vue') },
  { slug: 'pdf-to-text', category: c, icon: FileType, keywords: ['pdf', 'text', 'txt', 'extract', '提取'], component: () => import('@/tools/pdf-to-text/index.vue') },
  { slug: 'pdf-to-word', category: c, icon: FileText, keywords: ['pdf', 'word', 'docx'], component: () => import('@/tools/pdf-to-word/index.vue') },
  { slug: 'pdfium-preview', category: c, icon: ScanEye, keywords: ['pdf', 'pdfium', 'wasm', 'preview', 'render', 'text', '预览'], component: () => import('@/tools/pdfium-preview/index.vue') },
]
export default tools
