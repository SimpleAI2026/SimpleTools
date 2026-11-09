import { chatCompletionsUrl } from '../types'
import { normalizeSecret } from '../normalizeSecret'
import { parseSSEStream } from '../sse'
import type { ChatProvider, ProviderStreamEvent, ProviderStreamRequest } from './types'

/**
 * OpenAI-compatible Chat Completions (SSE streaming) provider.
 * Extracted from the original ChatEngine fetch/SSE path.
 */
export class OpenAICompatProvider implements ChatProvider {
  readonly id = 'openai' as const
  readonly supportsTools = true

  constructor(private fetchImpl: typeof fetch = globalThis.fetch.bind(globalThis)) {}

  async *stream(req: ProviderStreamRequest): AsyncGenerator<ProviderStreamEvent> {
    const { config, messages, tools, signal } = req
    const { apiBaseUrl, apiKey, model, temperature, maxTokens, headers } = config

    if (!apiBaseUrl || !apiKey || !model) {
      throw new Error('apiBaseUrl, apiKey, and model are required')
    }

    const body: Record<string, unknown> = {
      model,
      messages,
      stream: true,
    }
    if (temperature != null) body.temperature = temperature
    if (maxTokens != null) body.max_tokens = maxTokens
    if (tools.length) {
      body.tools = tools
      body.tool_choice = 'auto'
    }

    const res = await this.fetchImpl(chatCompletionsUrl(apiBaseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${normalizeSecret(apiKey)}`,
        ...headers,
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => res.statusText)
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 400)}`)
    }
    if (!res.body) throw new Error('No response body')

    let finishReason: string | null = null

    for await (const chunk of parseSSEStream(res.body, signal)) {
      if (chunk.finish_reason) finishReason = chunk.finish_reason
      const delta = chunk.delta
      if (!delta) continue

      if (delta.content) {
        yield { type: 'text-delta', delta: delta.content }
      }
      if (delta.tool_calls?.length) {
        yield { type: 'tool-call-deltas', deltas: delta.tool_calls }
      }
    }

    yield { type: 'finish', finishReason }
  }
}
