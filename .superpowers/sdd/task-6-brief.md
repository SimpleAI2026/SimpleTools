### Task 6: HostTools — list_tools / open_tool / run_offline_tool (TDD)

**Files:**
- Create: `src/agent/hostTools/whitelist.ts`
- Create: `src/agent/hostTools/createHostTools.ts`
- Create: `src/agent/hostTools/index.ts`
- Create: `src/agent/__tests__/hostTools.test.ts`

**Interfaces:**
- Consumes: `HostTool` from types; `TOOLS` / `getTool` from `@/registry`; `analyzeText` from `@/tools/token-counter/logic`; `redactSecrets` from `@/tools/prompt-secret-redactor/logic`; Vue Router instance injected
- Produces: `createHostTools(deps): HostTool[]` with names `list_tools`, `open_tool`, `run_offline_tool`; `OFFLINE_TOOL_WHITELIST`

Design (exact):

```ts
// src/agent/hostTools/whitelist.ts
/** Only pure offline logic tools may be executed by the model in P1. */
export const OFFLINE_TOOL_WHITELIST = [
  'token-counter',
  'prompt-secret-redactor',
] as const

export type OfflineToolSlug = (typeof OFFLINE_TOOL_WHITELIST)[number]

export function isOfflineToolWhitelisted(slug: string): slug is OfflineToolSlug {
  return (OFFLINE_TOOL_WHITELIST as readonly string[]).includes(slug)
}
```

```ts
// src/agent/hostTools/createHostTools.ts
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
    handler: (args: { category?: string; query?: string }) => {
      let tools = TOOLS
      if (args.category) {
        tools = tools.filter((t) => t.category === args.category)
      }
      const q = (args.query ?? '').trim().toLowerCase()
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
    handler: async (args: { slug: string }) => {
      const slug = String(args.slug || '').trim()
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
    handler: (args: { slug: string; input: Record<string, unknown> }) => {
      const slug = String(args.slug || '').trim()
      if (!isOfflineToolWhitelisted(slug)) {
        return {
          ok: false,
          error: `Slug not in offline whitelist: ${slug}. Allowed: token-counter, prompt-secret-redactor`,
        }
      }
      const input = args.input ?? {}
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
```

- [ ] **Step 1: Write failing hostTools test**

```ts
// src/agent/__tests__/hostTools.test.ts
import { describe, expect, it, vi } from 'vitest'
import { createHostTools } from '../hostTools/createHostTools'
import { OFFLINE_TOOL_WHITELIST } from '../hostTools/whitelist'

describe('createHostTools', () => {
  const router = { push: vi.fn().mockResolvedValue(undefined) }
  const t = (key: string) => key
  const tools = createHostTools({ router: router as never, t })
  const byName = Object.fromEntries(tools.map((x) => [x.name, x]))

  it('exposes the three P1 tools', () => {
    expect(Object.keys(byName).sort()).toEqual([
      'list_tools',
      'open_tool',
      'run_offline_tool',
    ])
    expect(OFFLINE_TOOL_WHITELIST).toContain('token-counter')
  })

  it('list_tools returns registry entries', async () => {
    const list = (await byName.list_tools!.handler({}, {
      threadId: 't',
      abortSignal: new AbortController().signal,
    })) as Array<{ slug: string }>
    expect(list.some((x) => x.slug === 'token-counter')).toBe(true)
  })

  it('open_tool navigates for known slug', async () => {
    const res = await byName.open_tool!.handler(
      { slug: 'token-counter' },
      { threadId: 't', abortSignal: new AbortController().signal },
    )
    expect(res).toMatchObject({ ok: true, slug: 'token-counter' })
    expect(router.push).toHaveBeenCalled()
  })

  it('run_offline_tool redacts secrets', async () => {
    const res = (await byName.run_offline_tool!.handler(
      {
        slug: 'prompt-secret-redactor',
        input: { text: 'key sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCD' },
      },
      { threadId: 't', abortSignal: new AbortController().signal },
    )) as { ok: boolean; result: { total: number } }
    expect(res.ok).toBe(true)
    expect(res.result.total).toBeGreaterThan(0)
  })

  it('run_offline_tool rejects non-whitelist', async () => {
    const res = (await byName.run_offline_tool!.handler(
      { slug: 'ffmpeg', input: {} },
      { threadId: 't', abortSignal: new AbortController().signal },
    )) as { ok: boolean }
    expect(res.ok).toBe(false)
  })
})
```

- [ ] **Step 2–4: Implement, pass tests, commit**

```bash
yarn test src/agent/__tests__/hostTools.test.ts
git add src/agent/hostTools src/agent/__tests__/hostTools.test.ts
git commit -m "feat(agent): add HostTools list_tools open_tool run_offline_tool"
```

Also re-export from `src/agent/index.ts`:

```ts
export { createHostTools, type HostToolDeps } from './hostTools'
export { OFFLINE_TOOL_WHITELIST, isOfflineToolWhitelisted } from './hostTools/whitelist'
```

---

