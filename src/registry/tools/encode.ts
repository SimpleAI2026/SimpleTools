import { Binary, Code, FileImage, Hash, Lock, Radio, RotateCcw, Type } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

const tools: ToolMeta[] = [
  { slug: 'base32', category: 'encode', icon: Hash, keywords: ['base32', 'rfc4648'], component: () => import('@/tools/base32/index.vue') },
  { slug: 'aes-encryption', category: 'encode', icon: Lock, keywords: ['aes', 'encrypt', 'decrypt', 'gcm', '加密', '解密'], component: () => import('@/tools/aes-encryption/index.vue') },
  { slug: 'binary-text', category: 'encode', icon: Binary, keywords: ['binary', 'hex', 'bytes', '二进制', '十六进制'], component: () => import('@/tools/binary-text/index.vue') },
  { slug: 'html-entities', category: 'encode', icon: Code, keywords: ['html', 'entity', 'escape', '转义', '实体'], component: () => import('@/tools/html-entities/index.vue') },
  { slug: 'image-base64', category: 'encode', icon: FileImage, keywords: ['image', 'base64', 'data url', '图片'], component: () => import('@/tools/image-base64/index.vue') },
  { slug: 'morse-code', category: 'encode', icon: Radio, keywords: ['morse', '摩尔斯', '电码'], component: () => import('@/tools/morse-code/index.vue') },
  { slug: 'rot13', category: 'encode', icon: RotateCcw, keywords: ['rot13', 'caesar', 'cipher', '凯撒'], component: () => import('@/tools/rot13/index.vue') },
  { slug: 'utf8-converter', category: 'encode', icon: Type, keywords: ['unicode', 'utf8', 'utf-16', 'codepoint', '码点', '转义'], component: () => import('@/tools/utf8-converter/index.vue') },
]
export default tools
