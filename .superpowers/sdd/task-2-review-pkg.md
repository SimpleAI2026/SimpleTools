# Review package Task 2
BASE: d5e0bceb19ba6075206cf9bd3dbe6d121d9d4f3b
HEAD: fc661a4a5cf88c66fae6287aad7b12d2b0b00302

## Commits
fc661a4 feat(agent): add ToolRegistry and parseToolArgs

## Stat
 src/agent/ToolRegistry.ts                |  72 +++++++++++++++
 src/agent/__tests__/ToolRegistry.test.ts |  41 +++++++++
 src/agent/parseToolArgs.ts               | 146 +++++++++++++++++++++++++++++++
 3 files changed, 259 insertions(+)

## Diff
diff --git a/src/agent/ToolRegistry.ts b/src/agent/ToolRegistry.ts
new file mode 100644
index 0000000..aa7e9df
--- /dev/null
+++ b/src/agent/ToolRegistry.ts
@@ -0,0 +1,72 @@
+import type { HostTool, ToolContext } from './types'
+import { parseToolArguments } from './parseToolArgs'
+
+export class ToolRegistry {
+  private tools = new Map<string, HostTool>()
+
+  register(tool: HostTool): void {
+    if (!/^[a-zA-Z0-9_-]+$/.test(tool.name)) {
+      throw new Error(`Invalid tool name: ${tool.name}`)
+    }
+    // Silent replace — Vue hosts often re-register on prop sync.
+    this.tools.set(tool.name, tool)
+  }
+
+  unregister(name: string): void {
+    this.tools.delete(name)
+  }
+
+  clear(): void {
+    this.tools.clear()
+  }
+
+  has(name: string): boolean {
+    return this.tools.has(name)
+  }
+
+  list(): HostTool[] {
+    return [...this.tools.values()]
+  }
+
+  /** OpenAI tools schema for chat.completions */
+  toOpenAI(): Array<{
+    type: 'function'
+    function: { name: string; description: string; parameters: object }
+  }> {
+    return this.list().map((t) => ({
+      type: 'function' as const,
+      function: {
+        name: t.name,
+        description: t.description,
+        parameters: t.parameters,
+      },
+    }))
+  }
+
+  async run(
+    name: string,
+    argsJson: string,
+    ctx: ToolContext,
+  ): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
+    const tool = this.tools.get(name)
+    if (!tool) {
+      return { ok: false, error: `Unknown tool: ${name}` }
+    }
+    let args: unknown = {}
+    try {
+      args = parseToolArguments(argsJson || '')
+    } catch {
+      return {
+        ok: false,
+        error: `Invalid JSON arguments for ${name}`,
+      }
+    }
+    try {
+      const result = await tool.handler(args, ctx)
+      return { ok: true, result }
+    } catch (err) {
+      const message = err instanceof Error ? err.message : String(err)
+      return { ok: false, error: message }
+    }
+  }
+}
diff --git a/src/agent/__tests__/ToolRegistry.test.ts b/src/agent/__tests__/ToolRegistry.test.ts
new file mode 100644
index 0000000..f769cce
--- /dev/null
+++ b/src/agent/__tests__/ToolRegistry.test.ts
@@ -0,0 +1,41 @@
+import { describe, expect, it } from 'vitest'
+import { ToolRegistry } from '../ToolRegistry'
+
+describe('ToolRegistry', () => {
+  it('rejects invalid names and runs handlers', async () => {
+    const reg = new ToolRegistry()
+    expect(() =>
+      reg.register({
+        name: 'bad name',
+        description: 'x',
+        parameters: { type: 'object', properties: {} },
+        handler: () => null,
+      }),
+    ).toThrow(/Invalid tool name/)
+
+    reg.register({
+      name: 'echo',
+      description: 'Echo',
+      parameters: {
+        type: 'object',
+        properties: { text: { type: 'string' } },
+        required: ['text'],
+      },
+      handler: (args: { text: string }) => ({ text: args.text }),
+    })
+
+    const ok = await reg.run('echo', '{"text":"hi"}', {
+      threadId: 't1',
+      abortSignal: new AbortController().signal,
+    })
+    expect(ok).toEqual({ ok: true, result: { text: 'hi' } })
+
+    const missing = await reg.run('nope', '{}', {
+      threadId: 't1',
+      abortSignal: new AbortController().signal,
+    })
+    expect(missing.ok).toBe(false)
+
+    expect(reg.toOpenAI()[0]?.function.name).toBe('echo')
+  })
+})
diff --git a/src/agent/parseToolArgs.ts b/src/agent/parseToolArgs.ts
new file mode 100644
index 0000000..25390d1
--- /dev/null
+++ b/src/agent/parseToolArgs.ts
@@ -0,0 +1,146 @@
+/**
+ * Resilient parsing of OpenAI-style tool `arguments` strings.
+ * Models often emit invalid JSON when values contain quotes/newlines (e.g. CSS).
+ */
+
+function looksLikeCss(s: string): boolean {
+  const t = s.trim();
+  if (!t) return false;
+  if (/^:host\b/i.test(t)) return true;
+  if (/--sc-[\w-]+\s*:/.test(t)) return true;
+  if (/\{[\s\S]*--sc-/.test(t)) return true;
+  return false;
+}
+
+function stripFences(s: string): string {
+  return s
+    .replace(/^```(?:json|css|javascript)?\s*/i, '')
+    .replace(/\s*```$/i, '')
+    .trim();
+}
+
+/** Extract a (possibly broken) JSON string value for key "css". */
+export function extractBrokenCssField(raw: string): string | null {
+  const key = /"css"\s*:\s*/.exec(raw);
+  if (!key) return null;
+  let i = key.index + key[0].length;
+  while (i < raw.length && /\s/.test(raw[i]!)) i++;
+  if (i >= raw.length) return null;
+
+  // Quoted string — tolerate raw newlines and unescaped quotes inside CSS.
+  if (raw[i] === '"' || raw[i] === "'") {
+    const quote = raw[i];
+    i += 1;
+    let out = '';
+    while (i < raw.length) {
+      const ch = raw[i];
+      if (ch === '\\' && i + 1 < raw.length) {
+        const n = raw[i + 1];
+        out +=
+          n === 'n'
+            ? '\n'
+            : n === 'r'
+              ? '\r'
+              : n === 't'
+                ? '\t'
+                : n === '"' || n === "'" || n === '\\'
+                  ? n
+                  : n;
+        i += 2;
+        continue;
+      }
+      if (ch === quote) {
+        const rest = raw.slice(i + 1).trimStart();
+        // End of value if followed by , } or EOS — else treat as literal quote in CSS.
+        if (!rest || rest.startsWith(',') || rest.startsWith('}')) {
+          return out;
+        }
+        out += ch;
+        i += 1;
+        continue;
+      }
+      out += ch;
+      i += 1;
+    }
+    return out.trim() ? out : null;
+  }
+
+  // Unquoted value: take until ,"note" or trailing }
+  const rest = raw.slice(i);
+  const cut = rest.search(/\s*,\s*"note"\s*:|\s*\}\s*$/);
+  const body = (cut >= 0 ? rest.slice(0, cut) : rest).trim().replace(/,$/, '');
+  return body || null;
+}
+
+function extractNoteField(raw: string): string | undefined {
+  const m = /"note"\s*:\s*"((?:\\.|[^"\\])*)"/.exec(raw);
+  if (!m) return undefined;
+  try {
+    return JSON.parse(`"${m[1]}"`);
+  } catch {
+    return m[1];
+  }
+}
+
+function tryParse(s: string): unknown | undefined {
+  try {
+    return JSON.parse(s);
+  } catch {
+    return undefined;
+  }
+}
+
+/**
+ * Parse tool call arguments JSON with repairs.
+ * Never throws — returns `{}` for empty input; throws Error only if completely unusable
+ * when `strict` (ToolRegistry catches and surfaces Invalid JSON).
+ */
+export function parseToolArguments(argsJson: string): unknown {
+  const original = (argsJson ?? '').trim();
+  if (!original) return {};
+
+  const candidates = [original, stripFences(original)];
+  for (const c of candidates) {
+    const parsed = tryParse(c);
+    if (parsed !== undefined) return parsed;
+  }
+
+  // Whole payload is CSS (model skipped JSON wrapper)
+  if (looksLikeCss(original) || looksLikeCss(stripFences(original))) {
+    return { css: stripFences(original) };
+  }
+
+  // Single-quoted JSON-ish keys/strings
+  const singleToDouble = tryParse(
+    original.replace(/([{,]\s*)'([^']+)'(\s*:)/g, '$1"$2"$3').replace(/:\s*'([^']*)'/g, ': "$1"'),
+  );
+  if (singleToDouble !== undefined) return singleToDouble;
+
+  // Broken {"css": "...multiline / unescaped..."}
+  const css = extractBrokenCssField(original);
+  if (css != null && css.trim()) {
+    const note = extractNoteField(original);
+    return note ? { css, note } : { css };
+  }
+
+  // Extract first {...} blob
+  const brace = original.indexOf('{');
+  const last = original.lastIndexOf('}');
+  if (brace >= 0 && last > brace) {
+    const slice = original.slice(brace, last + 1);
+    const parsed = tryParse(slice);
+    if (parsed !== undefined) return parsed;
+    const css2 = extractBrokenCssField(slice);
+    if (css2 != null && css2.trim()) {
+      const note = extractNoteField(slice);
+      return note ? { css: css2, note } : { css: css2 };
+    }
+  }
+
+  // Last resort: if it mentions design tokens, treat as CSS
+  if (/:host|--sc-/.test(original)) {
+    return { css: stripFences(original) };
+  }
+
+  throw new Error('Invalid JSON arguments');
+}
