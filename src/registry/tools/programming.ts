import { Code2 } from 'lucide-vue-next'
import type { ToolMeta } from '../types'

export interface ProgrammingRoute {
  slug: string
  runtime: string
  dialect?: 'js' | 'ts'
  extension: boolean
  keywords: string[]
}

const python = { slug: 'code-python', runtime: 'python', extension: false, keywords: ['python', 'py', '编程'] }
const ruby = { slug: 'code-ruby', runtime: 'ruby', extension: false, keywords: ['ruby', 'rb', '编程'] }
const javascript = { slug: 'code-javascript', runtime: 'quickjs', dialect: 'js', extension: true, keywords: ['javascript', 'js', 'quickjs', '编程'] }
const typescript = { slug: 'code-typescript', runtime: 'quickjs', dialect: 'ts', extension: true, keywords: ['typescript', 'ts', 'quickjs', '编程'] }
const sqlite = { slug: 'code-sqlite', runtime: 'sqlite', extension: true, keywords: ['sqlite', 'sql', '数据库', '编程'] }
const c = { slug: 'code-c', runtime: 'clang', extension: false, keywords: ['c', 'clang', '编程'] }
const cpp = { slug: 'code-cpp', runtime: 'clangpp', extension: false, keywords: ['c++', 'cpp', 'clang', '编程'] }
const php = { slug: 'code-php', runtime: 'php-cgi', extension: false, keywords: ['php', '编程'] }
const lua = { slug: 'code-lua', runtime: 'lua', extension: true, keywords: ['lua', '编程'] }
const go = { slug: 'code-go', runtime: 'go', extension: false, keywords: ['go', 'golang', 'yaegi', '编程'] }
const shell = { slug: 'code-shell', runtime: 'shell', extension: true, keywords: ['shell', 'sh', 'wasi', '编程'] }
const rust = { slug: 'code-rust', runtime: 'rust', extension: false, keywords: ['rust', 'rustc', 'weblings', '编程'] }
const java = { slug: 'code-java', runtime: 'java', extension: true, keywords: ['java', 'teavm', '编程'] }
const linux = { slug: 'code-linux', runtime: 'linux', extension: false, keywords: ['linux', 'v86', 'busybox', '编程'] }
const deeplearning = { slug: 'code-deeplearning', runtime: 'numpy', extension: false, keywords: ['deeplearning', 'deep learning', 'numpy', 'pyodide', '深度学习', '编程'] }

export const EXTENSION_PROGRAMMING_ROUTES: ProgrammingRoute[] = [javascript, typescript, sqlite, lua, shell, java]
export const PROGRAMMING_ROUTES: ProgrammingRoute[] = [
  python, ruby, javascript, typescript, sqlite, c, cpp, php, lua, go, shell, rust, java, linux, deeplearning,
]

export const ALL_CODE_RUNTIMES = import.meta.env.VITE_ENABLE_ALL_CODE_RUNTIMES !== 'false'
export const AVAILABLE_PROGRAMMING_ROUTES = ALL_CODE_RUNTIMES ? PROGRAMMING_ROUTES : EXTENSION_PROGRAMMING_ROUTES
const component = () => import('@/tools/code-playground/index.vue')

const tools: ToolMeta[] = AVAILABLE_PROGRAMMING_ROUTES.map((route) => ({
  slug: route.slug,
  category: 'programming',
  icon: Code2,
  keywords: ['programming', 'code', 'editor', '代码', ...route.keywords],
  component,
}))

export function programmingRoute(slug: unknown): ProgrammingRoute | undefined {
  return AVAILABLE_PROGRAMMING_ROUTES.find((route) => route.slug === slug)
}

export default tools
