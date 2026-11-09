# Review package Task 6 (with fixes)
BASE: 0b5a694acf6e6c558e7bb26eb0cb1cb8af9bda2a
HEAD: 180a780c1bfe5fea62fb9334c3eac5f238361369

## Commits
180a780 test(agent): cover open_tool reject and token-counter HostTool
2a15723 feat(agent): add HostTools list_tools open_tool run_offline_tool

## Stat
 src/agent/__tests__/hostTools.test.ts  |  98 +++++++++++++++++++++++++
 src/agent/hostTools/createHostTools.ts | 129 +++++++++++++++++++++++++++++++++
 src/agent/hostTools/index.ts           |   6 ++
 src/agent/hostTools/whitelist.ts       |  11 +++
 src/agent/index.ts                     |   3 +
 5 files changed, 247 insertions(+)

## Diff
diff --git a/src/agent/__tests__/hostTools.test.ts b/src/agent/__tests__/hostTools.test.ts
new file mode 100644
index 0000000..0e045cc
--- /dev/null
+++ b/src/agent/__tests__/hostTools.test.ts
@@ -0,0 +1,98 @@
+import { describe, expect, it, vi } from 'vitest'
+import { createHostTools } from '../hostTools/createHostTools'
+import { OFFLINE_TOOL_WHITELIST } from '../hostTools/whitelist'
+import * as tokenCounterLogic from '@/tools/token-counter/logic'
+import * as secretRedactorLogic from '@/tools/prompt-secret-redactor/logic'
+
+describe('createHostTools', () => {
+  const router = { push: vi.fn().mockResolvedValue(undefined) }
+  const t = (key: string) => key
+  const tools = createHostTools({ router: router as never, t })
+  const byName = Object.fromEntries(tools.map((x) => [x.name, x]))
+  const ctx = { threadId: 't', abortSignal: new AbortController().signal }
+
+  it('exposes the three P1 tools', () => {
+    expect(Object.keys(byName).sort()).toEqual([
+      'list_tools',
+      'open_tool',
+      'run_offline_tool',
+    ])
+    expect([...OFFLINE_TOOL_WHITELIST]).toEqual([
+      'token-counter',
+      'prompt-secret-redactor',
+    ])
+  })
+
+  it('list_tools returns registry entries', async () => {
+    const list = (await byName.list_tools!.handler({}, ctx)) as Array<{ slug: string }>
+    expect(list.some((x) => x.slug === 'token-counter')).toBe(true)
+  })
+
+  it('open_tool navigates for known slug', async () => {
+    router.push.mockClear()
+    const res = await byName.open_tool!.handler({ slug: 'token-counter' }, ctx)
+    expect(res).toMatchObject({ ok: true, slug: 'token-counter' })
+    expect(router.push).toHaveBeenCalled()
+  })
+
+  it('open_tool rejects unknown slug without navigating or running offline logic', async () => {
+    router.push.mockClear()
+    const analyzeSpy = vi.spyOn(tokenCounterLogic, 'analyzeText')
+    const redactSpy = vi.spyOn(secretRedactorLogic, 'redactSecrets')
+    try {
+      const res = (await byName.open_tool!.handler(
+        { slug: 'definitely-unknown-slug-xyz' },
+        ctx,
+      )) as { ok: boolean; error?: string }
+      expect(res.ok).toBe(false)
+      expect(res.error).toMatch(/unknown/i)
+      expect(router.push).not.toHaveBeenCalled()
+      expect(analyzeSpy).not.toHaveBeenCalled()
+      expect(redactSpy).not.toHaveBeenCalled()
+    } finally {
+      analyzeSpy.mockRestore()
+      redactSpy.mockRestore()
+    }
+  })
+
+  it('run_offline_tool redacts secrets', async () => {
+    const res = (await byName.run_offline_tool!.handler(
+      {
+        slug: 'prompt-secret-redactor',
+        input: { text: 'key sk-proj-abcdefghijklmnopqrstuvwxyz0123456789ABCD' },
+      },
+      ctx,
+    )) as { ok: boolean; result: { total: number } }
+    expect(res.ok).toBe(true)
+    expect(res.result.total).toBeGreaterThan(0)
+  })
+
+  it('run_offline_tool token-counter analyzes text', async () => {
+    const res = (await byName.run_offline_tool!.handler(
+      {
+        slug: 'token-counter',
+        input: { text: 'hello world', family: 'o200k', contextWindow: 128000 },
+      },
+      ctx,
+    )) as {
+      ok: boolean
+      slug: string
+      result: { tokens: number; chars: number; words: number; accurate: boolean; contextWindow: number }
+    }
+    expect(res.ok).toBe(true)
+    expect(res.slug).toBe('token-counter')
+    expect(res.result.tokens).toBeGreaterThan(0)
+    expect(res.result.chars).toBeGreaterThan(0)
+    expect(res.result.words).toBeGreaterThan(0)
+    expect(res.result.accurate).toBe(true)
+    expect(res.result.contextWindow).toBe(128000)
+  })
+
+  it('run_offline_tool rejects non-whitelist', async () => {
+    const res = (await byName.run_offline_tool!.handler(
+      { slug: 'ffmpeg', input: {} },
+      ctx,
+    )) as { ok: boolean }
+    expect(res.ok).toBe(false)
+  })
+})
diff --git a/src/agent/hostTools/createHostTools.ts b/src/agent/hostTools/createHostTools.ts
new file mode 100644
index 0000000..dfc764b
--- /dev/null
+++ b/src/agent/hostTools/createHostTools.ts
@@ -0,0 +1,129 @@
+import type { Router } from 'vue-router'
+import type { HostTool } from '../types'
+import { TOOLS, getTool } from '@/registry'
+import { isOfflineToolWhitelisted } from './whitelist'
+import { analyzeText } from '@/tools/token-counter/logic'
+import {
+  DEFAULT_REDACT_OPTIONS,
+  redactSecrets,
+  type RedactOptions,
+} from '@/tools/prompt-secret-redactor/logic'
+
+export interface HostToolDeps {
+  router: Router
+  /** Localized name/description lookup */
+  t: (key: string) => string
+}
+
+export function createHostTools(deps: HostToolDeps): HostTool[] {
+  const list_tools: HostTool = {
+    name: 'list_tools',
+    description:
+      'List SimpleTools offline toolbox entries (slug, category, name, description, keywords).',
+    parameters: {
+      type: 'object',
+      properties: {
+        category: {
+          type: 'string',
+          description: 'Optional category id filter (e.g. ai, developer, text)',
+        },
+        query: {
+          type: 'string',
+          description: 'Optional search string over slug/keywords/name',
+        },
+      },
+    },
+    handler: (args: { category?: string; query?: string }) => {
+      let tools = TOOLS
+      if (args.category) {
+        tools = tools.filter((t) => t.category === args.category)
+      }
+      const q = (args.query ?? '').trim().toLowerCase()
+      if (q) {
+        tools = tools.filter((t) => {
+          const name = deps.t(`tools.${t.slug}.name`).toLowerCase()
+          const desc = deps.t(`tools.${t.slug}.description`).toLowerCase()
+          const hay = [t.slug, t.category, ...t.keywords, name, desc].join(' ').toLowerCase()
+          return hay.includes(q)
+        })
+      }
+      return tools.map((t) => ({
+        slug: t.slug,
+        category: t.category,
+        name: deps.t(`tools.${t.slug}.name`),
+        description: deps.t(`tools.${t.slug}.description`),
+        keywords: t.keywords,
+        runnableOffline: isOfflineToolWhitelisted(t.slug),
+      }))
+    },
+  }
+
+  const open_tool: HostTool = {
+    name: 'open_tool',
+    description:
+      'Navigate the SimpleTools UI to an offline tool page by slug (e.g. token-counter).',
+    parameters: {
+      type: 'object',
+      properties: {
+        slug: { type: 'string', description: 'Tool slug from list_tools' },
+      },
+      required: ['slug'],
+    },
+    handler: async (args: { slug: string }) => {
+      const slug = String(args.slug || '').trim()
+      if (!getTool(slug)) {
+        return { ok: false, error: `Unknown tool slug: ${slug}` }
+      }
+      await deps.router.push({ name: 'tool', params: { slug } })
+      return { ok: true, slug, path: `/tools/${slug}` }
+    },
+  }
+
+  const run_offline_tool: HostTool = {
+    name: 'run_offline_tool',
+    description:
+      'Run a whitelisted offline tool purely in-logic (no UI). P1 whitelist: token-counter, prompt-secret-redactor.',
+    parameters: {
+      type: 'object',
+      properties: {
+        slug: {
+          type: 'string',
+          enum: ['token-counter', 'prompt-secret-redactor'],
+        },
+        input: {
+          type: 'object',
+          description:
+            'Tool-specific payload. token-counter: { text, family?, contextWindow? }. prompt-secret-redactor: { text, options? }.',
+        },
+      },
+      required: ['slug', 'input'],
+    },
+    handler: (args: { slug: string; input: Record<string, unknown> }) => {
+      const slug = String(args.slug || '').trim()
+      if (!isOfflineToolWhitelisted(slug)) {
+        return {
+          ok: false,
+          error: `Slug not in offline whitelist: ${slug}. Allowed: token-counter, prompt-secret-redactor`,
+        }
+      }
+      const input = args.input ?? {}
+      if (slug === 'token-counter') {
+        const text = String(input.text ?? '')
+        const family = (input.family as 'o200k' | 'cl100k' | 'claude' | 'gemini' | 'deepseek') || 'o200k'
+        const contextWindow = Number(input.contextWindow ?? 128000) as 8000 | 32000 | 128000 | 200000
+        return { ok: true, slug, result: analyzeText(text, family, contextWindow) }
+      }
+      if (slug === 'prompt-secret-redactor') {
+        const text = String(input.text ?? '')
+        const options = {
+          ...DEFAULT_REDACT_OPTIONS,
+          ...(input.options as Partial<RedactOptions> | undefined),
+        }
+        return { ok: true, slug, result: redactSecrets(text, options) }
+      }
+      return { ok: false, error: 'Unreachable' }
+    },
+  }
+
+  return [list_tools, open_tool, run_offline_tool]
+}
diff --git a/src/agent/hostTools/index.ts b/src/agent/hostTools/index.ts
new file mode 100644
index 0000000..fc7be2d
--- /dev/null
+++ b/src/agent/hostTools/index.ts
@@ -0,0 +1,6 @@
+export { createHostTools, type HostToolDeps } from './createHostTools'
+export {
+  OFFLINE_TOOL_WHITELIST,
+  isOfflineToolWhitelisted,
+  type OfflineToolSlug,
+} from './whitelist'
diff --git a/src/agent/hostTools/whitelist.ts b/src/agent/hostTools/whitelist.ts
new file mode 100644
index 0000000..2b42a24
--- /dev/null
+++ b/src/agent/hostTools/whitelist.ts
@@ -0,0 +1,11 @@
+/** Only pure offline logic tools may be executed by the model in P1. */
+export const OFFLINE_TOOL_WHITELIST = [
+  'token-counter',
+  'prompt-secret-redactor',
+] as const
+
+export type OfflineToolSlug = (typeof OFFLINE_TOOL_WHITELIST)[number]
+
+export function isOfflineToolWhitelisted(slug: string): slug is OfflineToolSlug {
+  return (OFFLINE_TOOL_WHITELIST as readonly string[]).includes(slug)
+}
diff --git a/src/agent/index.ts b/src/agent/index.ts
index 6b7fc70..ef06306 100644
--- a/src/agent/index.ts
+++ b/src/agent/index.ts
@@ -10,10 +10,13 @@ export {
   AGENT_STORAGE_KEY,
   AGENT_SETTINGS_LS_KEY,
   DEFAULT_AGENT_MODEL,
   loadAgentSettings,
   saveAgentSettings,
   resolveAgentConfig,
   type PersistedAgentSettings,
 } from './settings'
 export { OpenAICompatProvider, isChatProviderId } from './providers'
 export type { ChatProvider, ChatProviderId, OpenAICompatMessage } from './providers'
+
+export { createHostTools, type HostToolDeps } from './hostTools'
+export { OFFLINE_TOOL_WHITELIST, isOfflineToolWhitelisted } from './hostTools/whitelist'
