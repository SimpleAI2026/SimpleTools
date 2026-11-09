import type { Router } from 'vue-router'
import type { HostTool } from '../types'
import { TOOLS, getTool } from '@/registry'
import { isOfflineToolWhitelisted } from './whitelist'
import { analyzeText } from '@/tools/token-counter/logic'
import {
  DEFAULT_REDACT_OPTIONS,
  redactSecrets,
  type RedactOptions,
} from '@/tools/prompt-secret-redactor/logic'

export interface HostToolDeps {
  router: Router
  /** Localized name/description lookup */
  t: (key: string) => string
}

export function createHostTools(deps: HostToolDeps): HostTool[] {
  const list_tools: HostTool = {
    name: 'list_tools',
    description:
      'List SimpleTools offline toolbox entries (slug, category, name, description, keywords).',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category id filter (e.g. ai, developer, text)',
        },
        query: {
          type: 'string',
          description: 'Optional search string over slug/keywords/name',
        },
      },
    },
    handler: (args) => {
      const a = (args ?? {}) as { category?: string; query?: string }
      let tools = TOOLS
      if (a.category) {
        tools = tools.filter((t) => t.category === a.category)
      }
      const q = (a.query ?? '').trim().toLowerCase()
      if (q) {
        tools = tools.filter((t) => {
          const name = deps.t(`tools.${t.slug}.name`).toLowerCase()
          const desc = deps.t(`tools.${t.slug}.description`).toLowerCase()
          const hay = [t.slug, t.category, ...t.keywords, name, desc].join(' ').toLowerCase()
          return hay.includes(q)
        })
      }
      return tools.map((t) => ({
        slug: t.slug,
        category: t.category,
        name: deps.t(`tools.${t.slug}.name`),
        description: deps.t(`tools.${t.slug}.description`),
        keywords: t.keywords,
        runnableOffline: isOfflineToolWhitelisted(t.slug),
      }))
    },
  }

  const open_tool: HostTool = {
    name: 'open_tool',
    description:
      'Navigate the SimpleTools UI to an offline tool page by slug (e.g. token-counter).',
    parameters: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Tool slug from list_tools' },
      },
      required: ['slug'],
    },
    handler: async (args) => {
      const slug = String((args as { slug?: string } | null)?.slug || '').trim()
      if (!getTool(slug)) {
        return { ok: false, error: `Unknown tool slug: ${slug}` }
      }
      await deps.router.push({ name: 'tool', params: { slug } })
      return { ok: true, slug, path: `/tools/${slug}` }
    },
  }

  const run_offline_tool: HostTool = {
    name: 'run_offline_tool',
    description:
      'Run a whitelisted offline tool purely in-logic (no UI). P1 whitelist: token-counter, prompt-secret-redactor.',
    parameters: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          enum: ['token-counter', 'prompt-secret-redactor'],
        },
        input: {
          type: 'object',
          description:
            'Tool-specific payload. token-counter: { text, family?, contextWindow? }. prompt-secret-redactor: { text, options? }.',
        },
      },
      required: ['slug', 'input'],
    },
    handler: (args) => {
      const a = (args ?? {}) as { slug?: string; input?: Record<string, unknown> }
      const slug = String(a.slug || '').trim()
      if (!isOfflineToolWhitelisted(slug)) {
        return {
          ok: false,
          error: `Slug not in offline whitelist: ${slug}. Allowed: token-counter, prompt-secret-redactor`,
        }
      }
      const input = a.input ?? {}
      if (slug === 'token-counter') {
        const text = String(input.text ?? '')
        const family = (input.family as 'o200k' | 'cl100k' | 'claude' | 'gemini' | 'deepseek') || 'o200k'
        const contextWindow = Number(input.contextWindow ?? 128000) as 8000 | 32000 | 128000 | 200000
        return { ok: true, slug, result: analyzeText(text, family, contextWindow) }
      }
      if (slug === 'prompt-secret-redactor') {
        const text = String(input.text ?? '')
        const options = {
          ...DEFAULT_REDACT_OPTIONS,
          ...(input.options as Partial<RedactOptions> | undefined),
        }
        return { ok: true, slug, result: redactSecrets(text, options) }
      }
      return { ok: false, error: 'Unreachable' }
    },
  }

  return [list_tools, open_tool, run_offline_tool]
}
