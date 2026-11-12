import { BookOpen, Calculator, Clock, Container, FileKey, GitCompare, Globe, Hash, KeyRound, ShieldCheck } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'bcrypt', category: 'encode', icon: KeyRound, keywords: ['bcrypt', 'password', 'hash', '密码', '哈希'], component: () => import('@/tools/bcrypt/index.vue') },
  { slug: 'otp-generator', category: 'encode', icon: ShieldCheck, keywords: ['otp', 'totp', 'hotp', '2fa', '验证码'], component: () => import('@/tools/otp-generator/index.vue') },
  { slug: 'rsa-key-pair-generator', category: 'encode', icon: FileKey, keywords: ['rsa', 'pem', 'pkcs8', 'spki', '密钥'], component: () => import('@/tools/rsa-key-pair-generator/index.vue') },
  { slug: 'ulid-generator', category: 'generate', icon: Hash, keywords: ['ulid', 'id', 'sortable', '标识'], component: () => import('@/tools/ulid-generator/index.vue') },
  { slug: 'json-diff', category: 'developer', icon: GitCompare, keywords: ['json', 'diff', 'compare', '差异'], component: () => import('@/tools/json-diff/index.vue') },
  { slug: 'user-agent-parser', category: 'developer', icon: Globe, keywords: ['user-agent', 'ua', 'browser', '浏览器'], component: () => import('@/tools/user-agent-parser/index.vue') },
  { slug: 'crontab-generator', category: 'developer', icon: Clock, keywords: ['cron', 'crontab', 'schedule', '定时', '生成'], component: () => import('@/tools/crontab-generator/index.vue') },
  { slug: 'docker-run-to-compose', category: 'developer', icon: Container, keywords: ['docker', 'compose', 'yaml', '容器'], component: () => import('@/tools/docker-run-to-compose/index.vue') },
  { slug: 'math-evaluator', category: 'developer', icon: Calculator, keywords: ['math', 'calculator', 'expression', '计算', '表达式'], component: () => import('@/tools/math-evaluator/index.vue') },
  { slug: 'git-cheatsheet', category: 'developer', icon: BookOpen, keywords: ['git', 'cheatsheet', 'memo', '速查'], component: () => import('@/tools/git-cheatsheet/index.vue') },
]
export default tools
