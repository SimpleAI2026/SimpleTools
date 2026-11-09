import { Cable, CaseSensitive, Coins, EyeOff, FileCode2, FileText, ListOrdered, MessageSquare, ScanSearch, ShieldAlert, Shuffle, StickyNote, Wrench } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: "geo-question-panel", category: "ai", icon: FileText, keywords: ["geo", "question", "panel", "问题", "意图"], component: () => import('@/tools/geo-question-panel/index.vue') },
  { slug: "ai-answer-snapshot", category: "ai", icon: ScanSearch, keywords: ["geo", "citation", "mention", "引用", "提及"], component: () => import('@/tools/ai-answer-snapshot/index.vue') },
  { slug: "ai-panel-observations", category: "ai", icon: Coins, keywords: ["geo", "coverage", "observation", "观测", "分母"], component: () => import('@/tools/ai-panel-observations/index.vue') },
  { slug: "claim-evidence-ledger", category: "ai", icon: FileCode2, keywords: ["claim", "evidence", "ledger", "主张", "台账"], component: () => import('@/tools/claim-evidence-ledger/index.vue') },
  { slug: "evidence-answer-brief", category: "ai", icon: StickyNote, keywords: ["brief", "evidence", "gap", "简报", "缺口"], component: () => import('@/tools/evidence-answer-brief/index.vue') },
  { slug: "agent-eval-cases", category: "ai", icon: ListOrdered, keywords: ["eval", "agent", "regex", "评测", "规则"], component: () => import('@/tools/agent-eval-cases/index.vue') },
  { slug: "brand-entity-consistency", category: "ai", icon: ShieldAlert, keywords: ["entity", "brand", "conflict", "实体", "一致性"], component: () => import('@/tools/brand-entity-consistency/index.vue') },
  { slug: "geo-change-experiment", category: "ai", icon: Wrench, keywords: ["experiment", "geo", "control", "实验", "对照"], component: () => import('@/tools/geo-change-experiment/index.vue') },
  { slug: "citation-gap-map", category: "ai", icon: Cable, keywords: ["citation", "gap", "domain", "来源", "差距"], component: () => import('@/tools/citation-gap-map/index.vue') },
  { slug: "source-quote-verifier", category: "text", icon: MessageSquare, keywords: ["quote", "source", "verify", "引文", "核对"], component: () => import('@/tools/source-quote-verifier/index.vue') },
  { slug: "agent-trace-review", category: "ai", icon: Cable, keywords: ["trace", "agent", "retry", "轨迹", "复盘"], component: () => import('@/tools/agent-trace-review/index.vue') },
  { slug: "blind-output-review", category: "ai", icon: EyeOff, keywords: ["blind", "review", "rubric", "盲评", "评分"], component: () => import('@/tools/blind-output-review/index.vue') },
  { slug: "eval-dataset-splitter", category: "ai", icon: Shuffle, keywords: ["split", "holdout", "leak", "划分", "泄漏"], component: () => import('@/tools/eval-dataset-splitter/index.vue') },
  { slug: "localization-lqa", category: "text", icon: CaseSensitive, keywords: ["lqa", "i18n", "placeholder", "文案", "本地化"], component: () => import('@/tools/localization-lqa/index.vue') },
  { slug: "geo-access-evidence", category: "ai", icon: ShieldAlert, keywords: ["robots", "crawler", "access", "访问", "抓取"], component: () => import('@/tools/geo-access-evidence/index.vue') },
  { slug: "agent-workflow-preflight", category: "ai", icon: Wrench, keywords: ["workflow", "graph", "cycle", "工作流", "预检"], component: () => import('@/tools/agent-workflow-preflight/index.vue') },
]
export default tools
