import type { HostTool, ToolContext } from './types'
import { parseToolArguments } from './parseToolArgs'

export class ToolRegistry {
  private tools = new Map<string, HostTool>()

  register(tool: HostTool): void {
    if (!/^[a-zA-Z0-9_-]+$/.test(tool.name)) {
      throw new Error(`Invalid tool name: ${tool.name}`)
    }
    // Silent replace — Vue hosts often re-register on prop sync.
    this.tools.set(tool.name, tool)
  }

  unregister(name: string): void {
    this.tools.delete(name)
  }

  clear(): void {
    this.tools.clear()
  }

  has(name: string): boolean {
    return this.tools.has(name)
  }

  list(): HostTool[] {
    return [...this.tools.values()]
  }

  /** OpenAI tools schema for chat.completions */
  toOpenAI(): Array<{
    type: 'function'
    function: { name: string; description: string; parameters: object }
  }> {
    return this.list().map((t) => ({
      type: 'function' as const,
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }))
  }

  async run(
    name: string,
    argsJson: string,
    ctx: ToolContext,
  ): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
    const tool = this.tools.get(name)
    if (!tool) {
      return { ok: false, error: `Unknown tool: ${name}` }
    }
    let args: unknown = {}
    try {
      args = parseToolArguments(argsJson || '')
    } catch {
      return {
        ok: false,
        error: `Invalid JSON arguments for ${name}`,
      }
    }
    try {
      const result = await tool.handler(args, ctx)
      return { ok: true, result }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, error: message }
    }
  }
}
