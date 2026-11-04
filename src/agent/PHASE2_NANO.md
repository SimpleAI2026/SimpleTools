# Phase 2 — Chrome Built-in AI (Gemini Nano)

Out of scope for BYOK HostTool P1.

Planned reuse:
- `ChatProviderId = 'chrome-ai'`
- Port SimpleChat `ChromeAiProvider` into `src/agent/providers/ChromeAiProvider.ts`
- `ChatEngine.getProvider()` switches when `config.provider === 'chrome-ai'`
- Tools remain disabled on Nano (`supportsTools === false`), matching SimpleChat v1

No tasks in the P1 plan implement this file.
