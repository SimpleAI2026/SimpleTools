/** Only pure offline logic tools may be executed by the model in P1. */
export const OFFLINE_TOOL_WHITELIST = [
  'token-counter',
  'prompt-secret-redactor',
] as const

export type OfflineToolSlug = (typeof OFFLINE_TOOL_WHITELIST)[number]

export function isOfflineToolWhitelisted(slug: string): slug is OfflineToolSlug {
  return (OFFLINE_TOOL_WHITELIST as readonly string[]).includes(slug)
}
