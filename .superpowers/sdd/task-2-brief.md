### Task 2: parseToolArgs + ToolRegistry (TDD)

**Files:**
- Create: `src/agent/parseToolArgs.ts`
- Create: `src/agent/ToolRegistry.ts`
- Create: `src/agent/__tests__/ToolRegistry.test.ts`

**Interfaces:**
- Consumes: `HostTool`, `ToolContext` from Task 1
- Produces: `parseToolArguments(argsJson: string): unknown`; `ToolRegistry` with `register`, `unregister`, `clear`, `has`, `list`, `toOpenAI`, `run`

- [ ] **Step 1: Write the failing test**

```ts
// src/agent/__tests__/ToolRegistry.test.ts
import { describe, expect, it } from 'vitest'
import { ToolRegistry } from '../ToolRegistry'

describe('ToolRegistry', () => {
  it('rejects invalid names and runs handlers', async () => {
    const reg = new ToolRegistry()
    expect(() =>
      reg.register({
        name: 'bad name',
        description: 'x',
        parameters: { type: 'object', properties: {} },
        handler: () => null,
      }),
    ).toThrow(/Invalid tool name/)

    reg.register({
      name: 'echo',
      description: 'Echo',
      parameters: {
        type: 'object',
        properties: { text: { type: 'string' } },
        required: ['text'],
      },
      handler: (args: { text: string }) => ({ text: args.text }),
    })

    const ok = await reg.run('echo', '{"text":"hi"}', {
      threadId: 't1',
      abortSignal: new AbortController().signal,
    })
    expect(ok).toEqual({ ok: true, result: { text: 'hi' } })

    const missing = await reg.run('nope', '{}', {
      threadId: 't1',
      abortSignal: new AbortController().signal,
    })
    expect(missing.ok).toBe(false)

    expect(reg.toOpenAI()[0]?.function.name).toBe('echo')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test src/agent/__tests__/ToolRegistry.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Port implementation**

Copy from SimpleChat:
- `packages/core/src/parseToolArgs.ts` → `src/agent/parseToolArgs.ts` (keep CSS-repair helpers; harmless)
- `packages/core/src/ToolRegistry.ts` → `src/agent/ToolRegistry.ts`

Adjust imports to `./types` / `./parseToolArgs` (no `.js` suffix).

- [ ] **Step 4: Run tests**

Run: `yarn test src/agent/__tests__/ToolRegistry.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/agent/parseToolArgs.ts src/agent/ToolRegistry.ts src/agent/__tests__/ToolRegistry.test.ts
git commit -m "feat(agent): add ToolRegistry and parseToolArgs"
```

---

