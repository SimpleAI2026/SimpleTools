import type { AppLocale } from './index'

type Rest<T> = { [L in Exclude<AppLocale, 'en'>]: T }

/** Lock every locale to the English key shape so missing or extra keys fail typecheck. */
export function defineToolMessages<T extends Record<string, unknown>>(en: T, rest: Rest<T>): Record<AppLocale, T> {
  return { en, ...rest }
}
