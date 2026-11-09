import { Braces, Clock, Eraser, FileText, Fingerprint, ListOrdered, Scaling, Type } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: "ai-storyboard-variants", category: "media", icon: FileText, keywords: ["storyboard", "shot", "prompt", "分镜", "版本"], component: () => import('@/tools/ai-storyboard-variants/index.vue') },
  { slug: "subtitle-toolkit", category: "media", icon: Type, keywords: ["srt", "vtt", "subtitle", "字幕", "时间轴"], component: () => import('@/tools/subtitle-toolkit/index.vue') },
  { slug: "generation-take-ledger", category: "office", icon: FileText, keywords: ["rights", "license", "asset", "权利", "素材"], component: () => import('@/tools/generation-take-ledger/index.vue') },
  { slug: "video-delivery-preflight", category: "media", icon: Scaling, keywords: ["video", "ffmpeg", "qc", "交付", "规格"], component: () => import('@/tools/video-delivery-preflight/index.vue') },
  { slug: "audio-level-auditor", category: "media", icon: Clock, keywords: ["audio", "wav", "peak", "电平", "削波"], component: () => import('@/tools/audio-level-auditor/index.vue') },
  { slug: "edit-decision-log", category: "media", icon: Eraser, keywords: ["edit", "timeline", "cut", "剪辑", "时间线"], component: () => import('@/tools/edit-decision-log/index.vue') },
  { slug: "chapter-author", category: "media", icon: ListOrdered, keywords: ["chapter", "youtube", "podcast", "章节", "节目"], component: () => import('@/tools/chapter-author/index.vue') },
  { slug: "visual-selects-board", category: "media", icon: Scaling, keywords: ["selects", "contact", "image", "选片", "编号"], component: () => import('@/tools/visual-selects-board/index.vue') },
  { slug: "image-alt-review", category: "media", icon: Scaling, keywords: ["alt", "a11y", "image", "替代文本", "无障碍"], component: () => import('@/tools/image-alt-review/index.vue') },
  { slug: "design-token-auditor", category: "developer", icon: Braces, keywords: ["token", "dtcg", "design", "设计", "令牌"], component: () => import('@/tools/design-token-auditor/index.vue') },
  { slug: "project-handoff-auditor", category: "office", icon: Fingerprint, keywords: ["handoff", "manifest", "hash", "交接", "完整性"], component: () => import('@/tools/project-handoff-auditor/index.vue') },
  { slug: "voiceover-timing-planner", category: "media", icon: Clock, keywords: ["voiceover", "timing", "script", "配音", "时长"], component: () => import('@/tools/voiceover-timing-planner/index.vue') },
]
export default tools
