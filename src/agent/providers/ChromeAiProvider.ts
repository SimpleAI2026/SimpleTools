/**
 * Chrome Built-in AI (Prompt API / LanguageModel / Gemini Nano) provider.
 * Patterns ported from SimpleMind BuiltinPromptAI — no cloud keys.
 * First version: text only; OpenAI tools are NOT supported on Nano.
 */

import type { ChatProvider, OpenAICompatMessage, ProviderStreamEvent, ProviderStreamRequest } from './types';

export const CHROME_AI_STATUS = Object.freeze({
  UNKNOWN: 'unknown',
  UNAVAILABLE: 'unavailable',
  DOWNLOADABLE: 'downloadable',
  DOWNLOADING: 'downloading',
  AVAILABLE: 'available',
});

export type ChromeAiStatus = (typeof CHROME_AI_STATUS)[keyof typeof CHROME_AI_STATUS];

export interface ChromeAiAvailability {
  status: ChromeAiStatus;
  reason?: string;
  raw?: string;
}

type LanguageModelSession = {
  prompt: (input: string, opts?: { signal?: AbortSignal }) => Promise<unknown>;
  promptStreaming?: (
    input: string,
    opts?: { signal?: AbortSignal },
  ) => AsyncIterable<unknown> | ReadableStream<unknown>;
  destroy?: () => void;
};

type LanguageModelAPI = {
  availability: () => Promise<string>;
  create: (opts: {
    signal?: AbortSignal;
    monitor?: (m: { addEventListener?: (type: string, cb: (e: { loaded?: number }) => void) => void } | null) => void;
  }) => Promise<LanguageModelSession>;
};

function getLanguageModel(): LanguageModelAPI | null {
  const g = globalThis as { LanguageModel?: LanguageModelAPI };
  return g.LanguageModel || null;
}

/** True when LanguageModel exists (sync heuristic for default provider). */
export function isLanguageModelPresent(): boolean {
  const LM = getLanguageModel();
  return !!(LM && typeof LM.availability === 'function');
}

export async function checkChromeAiAvailability(): Promise<ChromeAiAvailability> {
  const LM = getLanguageModel();
  if (!LM || typeof LM.availability !== 'function') {
    return { status: CHROME_AI_STATUS.UNAVAILABLE, reason: 'no-api' };
  }
  try {
    const raw = await LM.availability();
    const normalized = String(raw || '').toLowerCase();
    if (normalized === 'available') return { status: CHROME_AI_STATUS.AVAILABLE, raw: normalized };
    if (normalized === 'downloadable') return { status: CHROME_AI_STATUS.DOWNLOADABLE, raw: normalized };
    if (normalized === 'downloading') return { status: CHROME_AI_STATUS.DOWNLOADING, raw: normalized };
    return { status: CHROME_AI_STATUS.UNAVAILABLE, reason: 'unsupported', raw: normalized };
  } catch (err) {
    return {
      status: CHROME_AI_STATUS.UNAVAILABLE,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Prefer chrome-ai when no API key and Nano is present / downloadable / available. */
export async function shouldPreferChromeAi(apiKey: string): Promise<boolean> {
  if (String(apiKey || '').trim()) return false;
  if (!isLanguageModelPresent()) return false;
  const { status } = await checkChromeAiAvailability();
  return (
    status === CHROME_AI_STATUS.AVAILABLE ||
    status === CHROME_AI_STATUS.DOWNLOADABLE ||
    status === CHROME_AI_STATUS.DOWNLOADING
  );
}

/** Flatten OpenAI-style messages into a single prompt for Nano. */
export function messagesToPrompt(messages: OpenAICompatMessage[]): string {
  const parts: string[] = [];
  for (const m of messages) {
    if (m.role === 'system') {
      parts.push(`System:\n${m.content}`);
    } else if (m.role === 'user') {
      parts.push(`User:\n${m.content}`);
    } else if (m.role === 'assistant') {
      parts.push(`Assistant:\n${m.content || ''}`);
    } else if (m.role === 'tool') {
      parts.push(`Tool:\n${m.content}`);
    }
  }
  parts.push('Assistant:');
  return parts.join('\n\n');
}

function chunkToText(chunk: unknown): string {
  if (chunk == null) return '';
  if (typeof chunk === 'string') return chunk;
  if (typeof chunk === 'object') {
    const o = chunk as { content?: unknown; text?: unknown };
    if (typeof o.content === 'string') return o.content;
    if (typeof o.text === 'string') return o.text;
  }
  return String(chunk);
}

async function* iterateStream(
  stream: AsyncIterable<unknown> | ReadableStream<unknown>,
): AsyncGenerator<string> {
  if (Symbol.asyncIterator in Object(stream)) {
    for await (const chunk of stream as AsyncIterable<unknown>) {
      const t = chunkToText(chunk);
      if (t) yield t;
    }
    return;
  }
  const reader = (stream as ReadableStream<unknown>).getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const t = chunkToText(value);
      if (t) yield t;
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* ignore */
    }
  }
}

export interface ChromeAiProviderOptions {
  onDownloadProgress?: (loaded: number) => void;
}

/**
 * Chrome Prompt API provider. Session is reused across turns until destroyed.
 */
export class ChromeAiProvider implements ChatProvider {
  readonly id = 'chrome-ai' as const;
  readonly supportsTools = false;
  private session: LanguageModelSession | null = null;
  private onDownloadProgress?: (loaded: number) => void;

  constructor(opts: ChromeAiProviderOptions = {}) {
    this.onDownloadProgress = opts.onDownloadProgress;
  }

  setOnDownloadProgress(cb?: (loaded: number) => void): void {
    this.onDownloadProgress = cb;
  }

  async checkAvailability(): Promise<ChromeAiAvailability> {
    return checkChromeAiAvailability();
  }

  async ensureSession(signal?: AbortSignal): Promise<LanguageModelSession> {
    const LM = getLanguageModel();
    if (!LM || typeof LM.create !== 'function') {
      throw new Error(
        'Built-in AI unavailable. Use Chrome 138+ (extension) or Chrome 148+ (web) with Prompt API / Gemini Nano.',
      );
    }
    if (this.session) return this.session;

    const onProgress = this.onDownloadProgress;
    this.session = await LM.create({
      signal,
      monitor(m) {
        if (!onProgress) return;
        if (!m || typeof m.addEventListener !== 'function') return;
        m.addEventListener('downloadprogress', (e) => {
          const loaded = e && typeof e.loaded === 'number' ? e.loaded : 0;
          onProgress(loaded);
        });
      },
    });
    return this.session;
  }

  destroySession(): void {
    try {
      if (this.session && typeof this.session.destroy === 'function') {
        this.session.destroy();
      }
    } catch {
      /* ignore */
    }
    this.session = null;
  }

  async *stream(req: ProviderStreamRequest): AsyncGenerator<ProviderStreamEvent> {
    const session = await this.ensureSession(req.signal);
    const prompt = messagesToPrompt(req.messages);

    if (typeof session.promptStreaming === 'function') {
      const stream = session.promptStreaming(prompt, { signal: req.signal });
      let emitted = false;
      for await (const delta of iterateStream(stream)) {
        emitted = true;
        yield { type: 'text-delta', delta };
      }
      if (!emitted) {
        // Some builds yield empty stream; fall back to prompt().
        const result = await session.prompt(prompt, { signal: req.signal });
        const text =
          typeof result === 'string' ? result : result == null ? '' : String(result);
        if (text) yield { type: 'text-delta', delta: text };
      }
    } else {
      const result = await session.prompt(prompt, { signal: req.signal });
      const text =
        typeof result === 'string' ? result : result == null ? '' : String(result);
      if (text) yield { type: 'text-delta', delta: text };
    }

    yield { type: 'finish', finishReason: 'stop' };
  }
}

export const chromeAiProviderSingleton = new ChromeAiProvider();
