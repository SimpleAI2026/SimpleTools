import { formatWithPrettier } from '@/lib/formatCode'

export type JsLang = 'babel' | 'typescript'
export interface JsOptions {
  tabWidth: number
  semi: boolean
  singleQuote: boolean
  printWidth: number
}

export function formatJs(code: string, lang: JsLang, o: JsOptions) {
  return formatWithPrettier(code, lang, { tabWidth: o.tabWidth, semi: o.semi, singleQuote: o.singleQuote, printWidth: o.printWidth })
}
