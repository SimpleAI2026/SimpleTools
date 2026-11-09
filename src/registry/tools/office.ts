import { FileSpreadsheet, FileText, Presentation, Sheet, Table2, FileOutput, Combine, FileJson, FileType2, FilePen, Eye } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'excel-viewer', category: 'office', icon: Table2, keywords: ['excel', 'xlsx', 'viewer', '表格'], component: () => import('@/tools/excel-viewer/index.vue') },
  { slug: 'excel-to-csv', category: 'office', icon: Sheet, keywords: ['excel', 'xlsx', 'csv', 'export'], component: () => import('@/tools/excel-to-csv/index.vue') },
  { slug: 'excel-to-json', category: 'office', icon: FileJson, keywords: ['excel', 'xlsx', 'json'], component: () => import('@/tools/excel-to-json/index.vue') },
  { slug: 'csv-to-excel', category: 'office', icon: FileSpreadsheet, keywords: ['csv', 'excel', 'xlsx'], component: () => import('@/tools/csv-to-excel/index.vue') },
  { slug: 'excel-merge', category: 'office', icon: Combine, keywords: ['excel', 'merge', 'combine', '合并'], component: () => import('@/tools/excel-merge/index.vue') },
  { slug: 'excel-to-pdf', category: 'office', icon: FileOutput, keywords: ['excel', 'pdf', 'print'], component: () => import('@/tools/excel-to-pdf/index.vue') },
  { slug: 'word-viewer', category: 'office', icon: Eye, keywords: ['word', 'docx', 'viewer'], component: () => import('@/tools/word-viewer/index.vue') },
  { slug: 'word-to-text', category: 'office', icon: FileText, keywords: ['word', 'docx', 'text', 'txt'], component: () => import('@/tools/word-to-text/index.vue') },
  { slug: 'word-to-markdown', category: 'office', icon: FileType2, keywords: ['word', 'docx', 'markdown', 'md'], component: () => import('@/tools/word-to-markdown/index.vue') },
  { slug: 'word-creator', category: 'office', icon: FilePen, keywords: ['word', 'docx', 'create', 'markdown'], component: () => import('@/tools/word-creator/index.vue') },
  { slug: 'pptx-creator', category: 'office', icon: Presentation, keywords: ['ppt', 'pptx', 'slides', 'powerpoint', '幻灯片'], component: () => import('@/tools/pptx-creator/index.vue') },
]
export default tools
