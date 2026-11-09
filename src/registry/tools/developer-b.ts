import { Braces, Clock, Code, FileCode, FileCode2, FileText, Minimize2, Paintbrush, Shapes, Sheet, Table, Database } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'css-formatter', category: 'developer', icon: Paintbrush, keywords: ['css', 'scss', 'less', 'prettier', 'beautify', 'minify'], component: () => import('@/tools/css-formatter/index.vue') },
  { slug: 'html-formatter', category: 'developer', icon: Code, keywords: ['html', 'prettier', 'beautify', 'vue'], component: () => import('@/tools/html-formatter/index.vue') },
  { slug: 'javascript-formatter', category: 'developer', icon: FileCode, keywords: ['javascript', 'js', 'typescript', 'prettier'], component: () => import('@/tools/javascript-formatter/index.vue') },
  { slug: 'svg-formatter', category: 'developer', icon: Shapes, keywords: ['svg', 'optimize', 'minify'], component: () => import('@/tools/svg-formatter/index.vue') },
  { slug: 'sql-formatter', category: 'developer', icon: Database, keywords: ['sql', 'mysql', 'postgres', 'format'], component: () => import('@/tools/sql-formatter/index.vue') },
  { slug: 'xml-formatter', category: 'developer', icon: FileCode2, keywords: ['xml', 'format', 'validate'], component: () => import('@/tools/xml-formatter/index.vue') },
  { slug: 'csv-formatter', category: 'developer', icon: Table, keywords: ['csv', 'tsv', 'markdown', 'table'], component: () => import('@/tools/csv-formatter/index.vue') },
  { slug: 'csv-to-sql', category: 'developer', icon: Sheet, keywords: ['csv', 'sql', 'insert', 'create table'], component: () => import('@/tools/csv-to-sql/index.vue') },
  { slug: 'cron-parser', category: 'developer', icon: Clock, keywords: ['cron', 'crontab', 'schedule', '定时'], component: () => import('@/tools/cron-parser/index.vue') },
  { slug: 'html-minifier', category: 'developer', icon: Minimize2, keywords: ['html', 'minify', 'compress', '压缩'], component: () => import('@/tools/html-minifier/index.vue') },
  { slug: 'json-to-typescript', category: 'developer', icon: Braces, keywords: ['json', 'typescript', 'interface', 'type'], component: () => import('@/tools/json-to-typescript/index.vue') },
  { slug: 'markdown-preview', category: 'developer', icon: FileText, keywords: ['markdown', 'md', 'preview', 'gfm'], component: () => import('@/tools/markdown-preview/index.vue') },
]
export default tools
