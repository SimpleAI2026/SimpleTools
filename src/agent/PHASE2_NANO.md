# Chrome Built-in AI (Gemini Nano)

Implemented (ported from SimpleChat):

- `ChatProviderId = 'chrome-ai'`
- `src/agent/providers/ChromeAiProvider.ts` — Prompt API / `LanguageModel`
- `ChatEngine.getProvider()` switches when `config.provider === 'chrome-ai'`
- Settings default to `chrome-ai` when no API key and `LanguageModel` is present
- Tools remain disabled on Nano (`supportsTools === false`), matching SimpleChat v1

BYOK OpenAI-compatible path is unchanged when the user picks a cloud/custom model.
