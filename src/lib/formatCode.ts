import type { Options, Plugin } from 'prettier'

/** Prettier parsers we support; plugins are loaded lazily so prettier only ships with the formatter routes. */
export type PrettierParser = 'css' | 'scss' | 'less' | 'html' | 'vue' | 'babel' | 'typescript' | 'json'

const loaders = {
  css: () => Promise.all([import('prettier/plugins/postcss')]),
  html: () =>
    Promise.all([import('prettier/plugins/html'), import('prettier/plugins/postcss'), import('prettier/plugins/babel'), import('prettier/plugins/estree')]),
  babel: () => Promise.all([import('prettier/plugins/babel'), import('prettier/plugins/estree')]),
  typescript: () => Promise.all([import('prettier/plugins/typescript'), import('prettier/plugins/estree')]),
} as const

const pluginGroup: Record<PrettierParser, keyof typeof loaders> = {
  css: 'css',
  scss: 'css',
  less: 'css',
  html: 'html',
  vue: 'html',
  babel: 'babel',
  json: 'babel',
  typescript: 'typescript',
}

export async function formatWithPrettier(code: string, parser: PrettierParser, opts: Options = {}): Promise<string> {
  const [{ format }, plugins] = await Promise.all([import('prettier/standalone'), loaders[pluginGroup[parser]]()])
  return format(code, { parser, plugins: plugins as unknown as Plugin[], ...opts })
}
