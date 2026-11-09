import { Dices, FileText, QrCode, Sigma, UserCheck } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'qr-code-generator', category: 'generate', icon: QrCode, keywords: ['qr', 'qrcode', 'wifi', '二维码'], component: () => import('@/tools/qr-code-generator/index.vue') },
  { slug: 'lorem-ipsum', category: 'generate', icon: FileText, keywords: ['lorem', 'ipsum', 'placeholder', '假文', '占位'], component: () => import('@/tools/lorem-ipsum/index.vue') },
  { slug: 'random-number-generator', category: 'generate', icon: Sigma, keywords: ['random', 'number', 'rng', '随机数'], component: () => import('@/tools/random-number-generator/index.vue') },
  { slug: 'random-name-picker', category: 'generate', icon: UserCheck, keywords: ['random', 'name', 'picker', 'team', '抽签', '分组'], component: () => import('@/tools/random-name-picker/index.vue') },
  { slug: 'coin-dice-roller', category: 'generate', icon: Dices, keywords: ['coin', 'dice', 'roll', 'flip', '硬币', '骰子'], component: () => import('@/tools/coin-dice-roller/index.vue') },
]
export default tools
