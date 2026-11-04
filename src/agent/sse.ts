/** Parse SSE chunks from an OpenAI-compatible chat.completions stream. */

export interface StreamDelta {
  content?: string
  tool_calls?: Array<{
    index: number
    id?: string
    type?: string
    function?: { name?: string; arguments?: string }
  }>
  finish_reason?: string | null
}

export async function* parseSSEStream(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<{ delta?: StreamDelta; finish_reason?: string | null; raw?: unknown }> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      if (signal?.aborted) break
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parts = buffer.split('\n')
      buffer = parts.pop() ?? ''

      for (const line of parts) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith(':')) continue
        if (!trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const choice = json.choices?.[0]
          yield {
            delta: choice?.delta,
            finish_reason: choice?.finish_reason ?? null,
            raw: json,
          }
        } catch {
          // ignore malformed chunks
        }
      }
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      /* ignore */
    }
  }
}

export interface AccumulatedToolCall {
  id: string
  name: string
  arguments: string
}

/** Merge incremental tool_calls deltas into a map keyed by index. */
export function mergeToolCallDeltas(
  acc: Map<number, AccumulatedToolCall>,
  deltas: NonNullable<StreamDelta['tool_calls']>,
): void {
  for (const d of deltas) {
    const existing = acc.get(d.index) ?? { id: '', name: '', arguments: '' }
    if (d.id) existing.id = d.id
    if (d.function?.name) existing.name += d.function.name
    if (d.function?.arguments) existing.arguments += d.function.arguments
    acc.set(d.index, existing)
  }
}
