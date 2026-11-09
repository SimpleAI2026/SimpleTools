import { formatWithPrettier } from '@/lib/formatCode'

export function formatHtml(code: string, tabWidth: number, printWidth: number, vue = false) {
  return formatWithPrettier(code, vue ? 'vue' : 'html', { tabWidth, printWidth, htmlWhitespaceSensitivity: 'ignore' })
}
