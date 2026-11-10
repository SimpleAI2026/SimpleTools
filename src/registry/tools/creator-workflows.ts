import { Braces, Scaling, Type } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'subtitle-toolkit', category: 'audiovisual', icon: Type, keywords: ['srt', 'vtt', 'subtitle', '字幕', '时间轴'], component: () => import('@/tools/subtitle-toolkit/index.vue') },
  { slug: 'video-delivery-preflight', category: 'audiovisual', icon: Scaling, keywords: ['video', 'ffmpeg', 'qc', '交付', '规格'], component: () => import('@/tools/video-delivery-preflight/index.vue') },
  { slug: 'design-token-auditor', category: 'developer', icon: Braces, keywords: ['token', 'dtcg', 'design', '设计', '令牌'], component: () => import('@/tools/design-token-auditor/index.vue') },
]
export default tools
