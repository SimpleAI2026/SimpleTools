import { Binary, Braces, FileKey, Globe, KeyRound, MousePointer, Network, Regex, Ruler, Server, ShieldCheck } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'regex-tester', category: 'developer', icon: Regex, keywords: ['regex', 'regexp', '正则'], component: () => import('@/tools/regex-tester/index.vue') },
  { slug: 'jwt-decoder', category: 'developer', icon: KeyRound, keywords: ['jwt', 'token', 'jws'], component: () => import('@/tools/jwt-decoder/index.vue') },
  { slug: 'json-viewer', category: 'developer', icon: Braces, keywords: ['json', 'tree', 'viewer', '树'], component: () => import('@/tools/json-viewer/index.vue') },
  { slug: 'url-parser', category: 'developer', icon: Globe, keywords: ['url', 'query', 'parse', '解析'], component: () => import('@/tools/url-parser/index.vue') },
  { slug: 'checksum-calculator', category: 'developer', icon: ShieldCheck, keywords: ['checksum', 'crc32', 'md5', 'sha', 'hmac', '校验'], component: () => import('@/tools/checksum-calculator/index.vue') },
  { slug: 'http-status', category: 'developer', icon: Server, keywords: ['http', 'status', 'code', '状态码'], component: () => import('@/tools/http-status/index.vue') },
  { slug: 'chmod-calculator', category: 'developer', icon: FileKey, keywords: ['chmod', 'permission', 'unix', '权限'], component: () => import('@/tools/chmod-calculator/index.vue') },
  { slug: 'cidr-calculator', category: 'developer', icon: Network, keywords: ['cidr', 'subnet', 'ip', '子网'], component: () => import('@/tools/cidr-calculator/index.vue') },
  { slug: 'ipv4-converter', category: 'developer', icon: Network, keywords: ['ipv4', 'ip', 'convert'], component: () => import('@/tools/ipv4-converter/index.vue') },
  { slug: 'bitwise-calculator', category: 'developer', icon: Binary, keywords: ['bitwise', 'and', 'xor', 'shift', '位运算'], component: () => import('@/tools/bitwise-calculator/index.vue') },
  { slug: 'px-rem', category: 'developer', icon: Ruler, keywords: ['px', 'rem', 'css', 'unit'], component: () => import('@/tools/px-rem/index.vue') },
  { slug: 'css-cursor', category: 'developer', icon: MousePointer, keywords: ['css', 'cursor', '光标'], component: () => import('@/tools/css-cursor/index.vue') },
]
export default tools
