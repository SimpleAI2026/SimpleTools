import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CHROME_AI_STATUS,
  ChromeAiProvider,
  checkChromeAiAvailability,
  isLanguageModelPresent,
  messagesToPrompt,
  shouldPreferChromeAi,
} from '../providers/ChromeAiProvider';
import { ChatEngine } from '../ChatEngine';
import { MemoryStore } from '../MemoryStore';

type LanguageModelMock = {
  availability?: ReturnType<typeof vi.fn>;
  create?: ReturnType<typeof vi.fn>;
};

function languageModel(): LanguageModelMock {
  return (globalThis as unknown as { LanguageModel: LanguageModelMock }).LanguageModel;
}

beforeEach(() => {
  delete (globalThis as { LanguageModel?: unknown }).LanguageModel;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (globalThis as { LanguageModel?: unknown }).LanguageModel;
});

describe('checkChromeAiAvailability', () => {
  it('returns unavailable when LanguageModel is missing', async () => {
    const result = await checkChromeAiAvailability();
    expect(result.status).toBe(CHROME_AI_STATUS.UNAVAILABLE);
    expect(result.reason).toBe('no-api');
    expect(isLanguageModelPresent()).toBe(false);
  });

  it('maps availability strings', async () => {
    (globalThis as unknown as { LanguageModel: unknown }).LanguageModel = {
      availability: vi.fn(async () => 'available'),
    };
    expect(isLanguageModelPresent()).toBe(true);
    expect((await checkChromeAiAvailability()).status).toBe(CHROME_AI_STATUS.AVAILABLE);

    languageModel().availability!.mockResolvedValueOnce('downloadable');
    expect((await checkChromeAiAvailability()).status).toBe(CHROME_AI_STATUS.DOWNLOADABLE);

    languageModel().availability!.mockResolvedValueOnce('downloading');
    expect((await checkChromeAiAvailability()).status).toBe(CHROME_AI_STATUS.DOWNLOADING);

    languageModel().availability!.mockResolvedValueOnce('nope');
    expect((await checkChromeAiAvailability()).status).toBe(CHROME_AI_STATUS.UNAVAILABLE);

    languageModel().availability!.mockRejectedValueOnce(new Error('boom'));
    const failed = await checkChromeAiAvailability();
    expect(failed.status).toBe(CHROME_AI_STATUS.UNAVAILABLE);
    expect(failed.reason).toContain('boom');
  });
});

describe('shouldPreferChromeAi', () => {
  it('is false when apiKey present', async () => {
    (globalThis as unknown as { LanguageModel: LanguageModelMock }).LanguageModel = { availability: vi.fn(async () => 'available') };
    expect(await shouldPreferChromeAi('sk-x')).toBe(false);
  });

  it('is true when no key and Nano available/downloadable', async () => {
    (globalThis as unknown as { LanguageModel: LanguageModelMock }).LanguageModel = { availability: vi.fn(async () => 'downloadable') };
    expect(await shouldPreferChromeAi('')).toBe(true);
  });
});

describe('messagesToPrompt', () => {
  it('flattens roles', () => {
    const p = messagesToPrompt([
      { role: 'system', content: 'sys' },
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'yo' },
    ]);
    expect(p).toContain('System:\nsys');
    expect(p).toContain('User:\nhi');
    expect(p).toContain('Assistant:\nyo');
    expect(p.trim().endsWith('Assistant:')).toBe(true);
  });
});

describe('ChromeAiProvider.stream', () => {
  it('streams via promptStreaming and reuses session', async () => {
    const prompt = vi.fn(async () => 'fallback');
    const destroy = vi.fn();
    const addEventListener = vi.fn((evt: string, cb: (e: { loaded?: number }) => void) => {
      if (evt === 'downloadprogress') cb({ loaded: 0.4 });
    });
    async function* streamChunks() {
      yield 'Hel';
      yield 'lo';
    }
    (globalThis as unknown as { LanguageModel: LanguageModelMock }).LanguageModel = {
      availability: vi.fn(async () => 'available'),
      create: vi.fn(async ({ monitor }: { monitor?: (m: unknown) => void }) => {
        monitor?.({ addEventListener });
        return {
          prompt,
          promptStreaming: vi.fn(() => streamChunks()),
          destroy,
        };
      }),
    };

    const onDownloadProgress = vi.fn();
    const provider = new ChromeAiProvider({ onDownloadProgress });
    const deltas: string[] = [];
    for await (const ev of provider.stream({
      config: { apiBaseUrl: '', apiKey: '', model: '', provider: 'chrome-ai' },
      messages: [{ role: 'user', content: 'hi' }],
      tools: [],
      signal: new AbortController().signal,
    })) {
      if (ev.type === 'text-delta') deltas.push(ev.delta);
    }
    expect(deltas.join('')).toBe('Hello');
    expect(onDownloadProgress).toHaveBeenCalledWith(0.4);
    expect(languageModel().create!).toHaveBeenCalledTimes(1);

    // reuse
    for await (const ev of provider.stream({
      config: { apiBaseUrl: '', apiKey: '', model: '', provider: 'chrome-ai' },
      messages: [{ role: 'user', content: 'again' }],
      tools: [],
      signal: new AbortController().signal,
    })) {
      void ev
    }
    expect(languageModel().create!).toHaveBeenCalledTimes(1);
    provider.destroySession();
    expect(destroy).toHaveBeenCalled();
  });

  it('falls back to prompt() when promptStreaming missing', async () => {
    (globalThis as unknown as { LanguageModel: LanguageModelMock }).LanguageModel = {
      create: vi.fn(async () => ({
        prompt: vi.fn(async () => 'nano-ok'),
        destroy: vi.fn(),
      })),
    };
    const provider = new ChromeAiProvider();
    const deltas: string[] = [];
    for await (const ev of provider.stream({
      config: { apiBaseUrl: '', apiKey: '', model: '' },
      messages: [{ role: 'user', content: 'x' }],
      tools: [],
      signal: new AbortController().signal,
    })) {
      if (ev.type === 'text-delta') deltas.push(ev.delta);
    }
    expect(deltas.join('')).toBe('nano-ok');
  });

  it('throws when create unavailable', async () => {
    (globalThis as unknown as { LanguageModel: LanguageModelMock }).LanguageModel = {};
    const provider = new ChromeAiProvider();
    await expect(async () => {
      for await (const ev of provider.stream({
        config: { apiBaseUrl: '', apiKey: '', model: '' },
        messages: [{ role: 'user', content: 'x' }],
        tools: [],
        signal: new AbortController().signal,
      })) {
        void ev
      }
    }).rejects.toThrow(/unavailable/i);
  });
});

describe('ChatEngine with chrome-ai skips tools', () => {
  it('does not call fetch and ignores registered tools', async () => {
    const fetchSpy = vi.fn();
    (globalThis as unknown as { LanguageModel: LanguageModelMock }).LanguageModel = {
      create: vi.fn(async () => ({
        prompt: vi.fn(async () => 'local reply'),
        destroy: vi.fn(),
      })),
    };
    const engine = new ChatEngine({
      config: {
        apiBaseUrl: '',
        apiKey: '',
        model: '',
        provider: 'chrome-ai',
      },
      store: new MemoryStore(),
      fetchImpl: fetchSpy as unknown as typeof fetch,
    });
    engine.registerTool({
      name: 'get_page_title',
      description: 't',
      parameters: {},
      handler: async () => ({ title: 'x' }),
    });
    let done = '';
    for await (const ev of engine.send('hello')) {
      if (ev.type === 'done') done = ev.message.content;
    }
    expect(done).toBe('local reply');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(engine.getProvider().supportsTools).toBe(false);
  });
});
