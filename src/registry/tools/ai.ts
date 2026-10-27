import { Bot, Cable, Coins, EyeOff, FileCode2, ScanSearch, ShieldAlert, Wrench } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  {
    slug: 'token-counter',
    category: 'ai',
    icon: Bot,
    keywords: ['token', 'context', 'tiktoken', 'gpt', 'claude', '计数', '上下文'],
    component: () => import('@/tools/token-counter/index.vue'),
  },
  {
    slug: 'api-cost-estimator',
    category: 'ai',
    icon: Coins,
    keywords: ['cost', 'price', 'api', 'billing', '费用', '价格'],
    component: () => import('@/tools/api-cost-estimator/index.vue'),
  },
  {
    slug: 'system-prompt-linter',
    category: 'ai',
    icon: ShieldAlert,
    keywords: ['system', 'prompt', 'lint', 'linter', '检查', '系统提示'],
    component: () => import('@/tools/system-prompt-linter/index.vue'),
  },
  {
    slug: 'prompt-secret-redactor',
    category: 'ai',
    icon: EyeOff,
    keywords: ['secret', 'redact', 'api key', '脱敏', '密钥'],
    component: () => import('@/tools/prompt-secret-redactor/index.vue'),
  },
  {
    slug: 'prompt-injection-scanner',
    category: 'ai',
    icon: ScanSearch,
    keywords: ['injection', 'jailbreak', 'dan', '安全', '注入'],
    component: () => import('@/tools/prompt-injection-scanner/index.vue'),
  },
  {
    slug: 'mcp-config-builder',
    category: 'ai',
    icon: Cable,
    keywords: ['mcp', 'config', 'cursor', 'claude desktop', '配置'],
    component: () => import('@/tools/mcp-config-builder/index.vue'),
  },
  {
    slug: 'agent-tool-def',
    category: 'ai',
    icon: Wrench,
    keywords: ['tool', 'function', 'schema', 'mcp', 'openai', 'anthropic', '工具定义'],
    component: () => import('@/tools/agent-tool-def/index.vue'),
  },
  {
    slug: 'agent-instructions',
    category: 'ai',
    icon: FileCode2,
    keywords: ['agents.md', 'claude.md', 'cursor rules', 'windsurf', '指令'],
    component: () => import('@/tools/agent-instructions/index.vue'),
  },
]

export default tools
