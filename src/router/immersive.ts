import { AVAILABLE_PROGRAMMING_ROUTES } from '@/registry/tools/programming'

const IMMERSIVE_SLUGS = new Set(['agent', ...AVAILABLE_PROGRAMMING_ROUTES.map((route) => route.slug)])

export function isImmersiveSlug(slug: unknown): boolean {
  return typeof slug === 'string' && IMMERSIVE_SLUGS.has(slug)
}
