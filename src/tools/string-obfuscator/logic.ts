export interface ObfuscateOptions {
  keepStart: number
  keepEnd: number
  mask: string
}

export function clampKeep(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

export function obfuscate(value: string, options: ObfuscateOptions): string {
  const chars = [...value]
  const start = Math.min(clampKeep(options.keepStart), chars.length)
  const end = Math.min(clampKeep(options.keepEnd), Math.max(0, chars.length - start))
  const mask = options.mask || '•'
  const hidden = chars.length - start - end
  if (hidden <= 0) return value
  return chars.slice(0, start).join('') + mask.repeat(hidden) + chars.slice(chars.length - end).join('')
}

export function obfuscateLines(value: string, options: ObfuscateOptions): string {
  return value.split(/\r?\n/).map((line) => obfuscate(line, options)).join('\n')
}
